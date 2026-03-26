"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { idPhotoFileToBytes, validateIdPhotoFile } from "@/lib/id-photo-storage";
import { prisma } from "@/lib/prisma";
import { buildGuardPostaDescription, GUARD_POSTA_DESCRIPTION_PREFIX } from "@/lib/guard-posta";
import { calculateValidityWindow } from "@/lib/qr";
import { notifyUser } from "@/lib/push";
import {
  enforceGuardShiftForGateOperation,
  getNextHeartbeatAt,
  getOpenGuardShift,
  validateGeoAgainstResidential,
} from "@/lib/guard-shift";

const announceDeliverySchema = z.object({
  residentId: z.string().min(1, "Debes seleccionar un residente."),
  deliveryNote: z.string().min(3, "Escribe un detalle corto del delivery.").max(180, "Detalle demasiado largo."),
});

const createManualVisitSchema = z.object({
  residentId: z.string().min(1, "Debes seleccionar un residente."),
  visitorName: z.string().min(2, "Escribe el nombre de la visita.").max(80, "Nombre demasiado largo."),
  hasVehicle: z.coerce.boolean().default(false),
  vehicleType: z.enum(["CARRO", "MOTO", "MICROBUS", "CAMION", "TAXI"]).optional(),
  vehicleCompanionsCount: z.coerce.number().int().min(0).max(20).optional(),
});

const shiftGeoSchema = z.object({
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
});

function createGuardGeneratedCode() {
  return `GD-${crypto.randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`;
}

export async function startGuardShiftAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";

  const geoParsed = shiftGeoSchema.safeParse({
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });
  if (!geoParsed.success) return "No se recibio geolocalizacion valida.";

  const selfie = formData.get("selfie");
  if (!(selfie instanceof File)) {
    return "Debes capturar una selfie para iniciar turno.";
  }

  const openShift = await getOpenGuardShift(session.userId);
  if (openShift) {
    return "Ya tienes un turno activo. Debes cerrarlo antes de iniciar otro.";
  }

  try {
    validateIdPhotoFile(selfie);
    const selfieData = await idPhotoFileToBytes(selfie);
    const geoCheck = await validateGeoAgainstResidential(session.residentialId, geoParsed.data);

    await prisma.guardShift.create({
      data: {
        guardId: session.userId,
        residentialId: session.residentialId,
        startLatitude: geoParsed.data.latitude,
        startLongitude: geoParsed.data.longitude,
        startDistanceMeters: geoCheck.distanceMeters,
        startIsAnomalous: geoCheck.isAnomalous,
        startAnomalyReason: geoCheck.anomalyReason,
        startSelfieData: selfieData as unknown as Uint8Array<ArrayBuffer>,
        startSelfieMimeType: selfie.type,
        startSelfieSize: selfie.size,
        startSelfieCapturedAt: new Date(),
      },
    });
  } catch (error) {
    return error instanceof Error ? error.message : "No se pudo iniciar el turno.";
  }

  revalidatePath("/guard");
  revalidatePath("/super-admin/guard-attendance");
  return "Turno iniciado correctamente.";
}

export async function markGuardShiftHeartbeatAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";

  const openShift = await getOpenGuardShift(session.userId);
  if (!openShift) return "No tienes un turno activo.";

  const geoParsed = shiftGeoSchema.safeParse({
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });
  if (!geoParsed.success) return "No se recibio geolocalizacion valida.";

  const selfie = formData.get("selfie");
  if (!(selfie instanceof File)) {
    return "Debes capturar una selfie para marcar checkpoint.";
  }

  try {
    validateIdPhotoFile(selfie);
    const selfieData = await idPhotoFileToBytes(selfie);
    const geoCheck = await validateGeoAgainstResidential(session.residentialId, geoParsed.data);

    await prisma.guardShiftMark.create({
      data: {
        shiftId: openShift.id,
        latitude: geoParsed.data.latitude,
        longitude: geoParsed.data.longitude,
        distanceMeters: geoCheck.distanceMeters,
        isAnomalous: geoCheck.isAnomalous,
        anomalyReason: geoCheck.anomalyReason,
        selfieData: selfieData as unknown as Uint8Array<ArrayBuffer>,
        selfieMimeType: selfie.type,
        selfieSize: selfie.size,
        selfieCapturedAt: new Date(),
      },
    });
  } catch (error) {
    return error instanceof Error ? error.message : "No se pudo registrar el checkpoint.";
  }

  revalidatePath("/guard");
  revalidatePath("/super-admin/guard-attendance");
  return "Checkpoint registrado correctamente.";
}

export async function endGuardShiftAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";

  const openShift = await getOpenGuardShift(session.userId);
  if (!openShift) return "No tienes un turno activo para cerrar.";

  const geoParsed = shiftGeoSchema.safeParse({
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });
  if (!geoParsed.success) return "No se recibio geolocalizacion valida.";

  const selfie = formData.get("selfie");
  if (!(selfie instanceof File)) {
    return "Debes capturar una selfie para cerrar turno.";
  }

  try {
    validateIdPhotoFile(selfie);
    const selfieData = await idPhotoFileToBytes(selfie);
    const geoCheck = await validateGeoAgainstResidential(session.residentialId, geoParsed.data);

    await prisma.guardShift.update({
      where: { id: openShift.id },
      data: {
        endedAt: new Date(),
        endLatitude: geoParsed.data.latitude,
        endLongitude: geoParsed.data.longitude,
        endDistanceMeters: geoCheck.distanceMeters,
        endIsAnomalous: geoCheck.isAnomalous,
        endAnomalyReason: geoCheck.anomalyReason,
        endSelfieData: selfieData as unknown as Uint8Array<ArrayBuffer>,
        endSelfieMimeType: selfie.type,
        endSelfieSize: selfie.size,
        endSelfieCapturedAt: new Date(),
      },
    });
  } catch (error) {
    return error instanceof Error ? error.message : "No se pudo cerrar el turno.";
  }

  revalidatePath("/guard");
  revalidatePath("/super-admin/guard-attendance");
  return "Turno finalizado correctamente.";
}

export async function createManualVisitByGuardAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  const residentialId = session.residentialId;
  if (!residentialId) return "Sesion invalida sin residencial asociada.";
  try {
    await enforceGuardShiftForGateOperation(session.userId);
  } catch (error) {
    return error instanceof Error ? error.message : "Debes tener turno laboral activo.";
  }

  const parsed = createManualVisitSchema.safeParse({
    residentId: formData.get("residentId"),
    visitorName: formData.get("visitorName"),
    hasVehicle: formData.get("hasVehicle") === "on",
    vehicleType: formData.get("vehicleType") || undefined,
    vehicleCompanionsCount: formData.get("vehicleCompanionsCount") || undefined,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos invalidos.";
  }

  const resident = await prisma.user.findFirst({
    where: {
      id: parsed.data.residentId,
      residentialId,
      role: "RESIDENT",
    },
    select: { id: true, fullName: true },
  });
  if (!resident) return "No se encontro el residente seleccionado.";

  const visitorName = parsed.data.visitorName.trim();
  const validityWindow = calculateValidityWindow("SINGLE_USE");

  const residentialSettings = await prisma.residential.findUnique({
    where: { id: residentialId },
    select: {
      enableResidentQrVehicleType: true,
      enableResidentQrVehicleCompanions: true,
    },
  });
  if (!residentialSettings) return "Residencial no encontrada.";

  const hasVehicle = parsed.data.hasVehicle;
  const vehicleType =
    residentialSettings.enableResidentQrVehicleType && hasVehicle ? parsed.data.vehicleType ?? null : null;
  const vehicleCompanionsCount =
    residentialSettings.enableResidentQrVehicleCompanions && hasVehicle
      ? (parsed.data.vehicleCompanionsCount ?? null)
      : null;

  if (residentialSettings.enableResidentQrVehicleCompanions && hasVehicle) {
    if (!residentialSettings.enableResidentQrVehicleType) {
      return "La residencial debe habilitar tipo de vehiculo para usar acompanantes.";
    }
    if (!vehicleType) return "Debes seleccionar tipo de vehiculo.";
    if (vehicleCompanionsCount == null || Number.isNaN(vehicleCompanionsCount)) {
      return "Debes indicar cantidad de acompanantes.";
    }
    const maxByType: Record<string, number> = {
      CARRO: 6,
      MOTO: 1,
      MICROBUS: 14,
      CAMION: 2,
      TAXI: 5,
    };
    const maxAllowed = maxByType[vehicleType] ?? 6;
    if (vehicleCompanionsCount < 0 || vehicleCompanionsCount > maxAllowed) {
      return `Acompanantes invalidos para ${vehicleType}. Maximo: ${maxAllowed}.`;
    }
  }

  const idPhoto = formData.get("idPhoto");
  if (!(idPhoto instanceof File)) {
    return "Debes capturar la evidencia de identificacion del visitante.";
  }

  let platePhotoData: Uint8Array | undefined;
  let platePhotoMimeType: string | undefined;
  let platePhotoSize: number | undefined;

  try {
    validateIdPhotoFile(idPhoto);
    const idPhotoData = await idPhotoFileToBytes(idPhoto);

    if (parsed.data.hasVehicle) {
      const platePhoto = formData.get("platePhoto");
      if (!(platePhoto instanceof File)) {
        return "Esta visita requiere foto de placa porque viene en vehiculo.";
      }
      validateIdPhotoFile(platePhoto);
      platePhotoData = await idPhotoFileToBytes(platePhoto);
      platePhotoMimeType = platePhoto.type;
      platePhotoSize = platePhoto.size;
    }

    const description = buildGuardPostaDescription(session.userId, session.fullName);

    await prisma.$transaction(async (tx) => {
      const qr = await tx.qrCode.create({
        data: {
          code: createGuardGeneratedCode(),
          visitorName,
          description,
          category: "VISIT",
          hasVehicle,
          vehicleType,
          vehicleCompanionsCount,
          validityType: "SINGLE_USE",
          validFrom: validityWindow.validFrom,
          validUntil: validityWindow.validUntil,
          maxUses: validityWindow.maxUses,
          residentialId,
          residentId: resident.id,
        },
      });

      await tx.qrCode.update({
        where: { id: qr.id },
        data: { usedCount: { increment: 1 } },
      });

      await tx.qrScan.create({
        data: {
          codeId: qr.id,
          scannerId: session.userId,
          isValid: true,
          reason: "Ingreso registrado por Posta de Seguridad al crear anuncio (llamada) con evidencia.",
          idPhotoData: idPhotoData as unknown as Uint8Array<ArrayBuffer>,
          idPhotoMimeType: idPhoto.type,
          idPhotoSize: idPhoto.size,
          idCapturedAt: new Date(),
          platePhotoData: platePhotoData
            ? (platePhotoData as unknown as Uint8Array<ArrayBuffer>)
            : null,
          platePhotoMimeType,
          platePhotoSize,
        },
      });
    });
  } catch (error) {
    return error instanceof Error ? error.message : "No se pudo registrar la entrada con evidencia.";
  }

  await notifyUser(resident.id, {
    title: "Posta de Seguridad creo un QR por ti",
    body: `${session.fullName} registro la entrada de "${visitorName}" a tu nombre (ingreso ya marcado en posta). Revisa tu app.`,
    url: "/resident",
  });

  revalidatePath("/guard");
  revalidatePath("/resident");
  return `Entrada registrada y QR creado para ${visitorName} (residente: ${resident.fullName}). El residente vera la etiqueta de Posta de Seguridad.`;
}

export async function acceptAnnouncedVisitAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";
  try {
    await enforceGuardShiftForGateOperation(session.userId);
  } catch (error) {
    return error instanceof Error ? error.message : "Debes tener turno laboral activo.";
  }

  const qrId = String(formData.get("qrId") ?? "");
  if (!qrId) return "No se recibio el identificador del anuncio.";

  const qr = await prisma.qrCode.findFirst({
    where: {
      id: qrId,
      residentialId: session.residentialId,
      isRevoked: false,
      validUntil: { gte: new Date() },
    },
    include: {
      resident: { select: { id: true, fullName: true } },
      scans: {
        where: { isValid: true },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!qr) return "El anuncio no esta disponible.";
  if (qr.scans.length > 0) {
    revalidatePath("/guard");
    return "Esta visita ya fue registrada anteriormente.";
  }
  if (qr.usedCount >= qr.maxUses) {
    revalidatePath("/guard");
    return "El anuncio ya no tiene usos disponibles.";
  }

  const idPhoto = formData.get("idPhoto");
  if (!(idPhoto instanceof File)) {
    return "Debes tomar una foto del ID del visitante.";
  }

  let platePhotoData: Uint8Array | undefined;
  let platePhotoMimeType: string | undefined;
  let platePhotoSize: number | undefined;
  try {
    validateIdPhotoFile(idPhoto);
    const idPhotoData = await idPhotoFileToBytes(idPhoto);

    if (qr.hasVehicle) {
      const platePhoto = formData.get("platePhoto");
      if (!(platePhoto instanceof File)) {
        return "Esta visita requiere foto de placa porque viene en vehiculo.";
      }
      validateIdPhotoFile(platePhoto);
      platePhotoData = await idPhotoFileToBytes(platePhoto);
      platePhotoMimeType = platePhoto.type;
      platePhotoSize = platePhoto.size;
    }

    await prisma.$transaction([
      prisma.qrCode.update({
        where: { id: qr.id },
        data: { usedCount: { increment: 1 } },
      }),
      prisma.qrScan.create({
        data: {
          codeId: qr.id,
          scannerId: session.userId,
          isValid: true,
          reason: "Llegada confirmada manualmente por guardia con evidencia.",
          idPhotoData: idPhotoData as unknown as Uint8Array<ArrayBuffer>,
          idPhotoMimeType: idPhoto.type,
          idPhotoSize: idPhoto.size,
          idCapturedAt: new Date(),
          platePhotoData: platePhotoData
            ? (platePhotoData as unknown as Uint8Array<ArrayBuffer>)
            : null,
          platePhotoMimeType,
          platePhotoSize,
        },
      }),
    ]);
  } catch (error) {
    return error instanceof Error ? error.message : "No se pudo registrar la evidencia.";
  }

  await notifyUser(qr.resident.id, {
    title: "Posta de Seguridad",
    body: `Tu visita (${qr.visitorName}) fue registrada en la posta.`,
    url: "/resident",
  });

  revalidatePath("/guard");
  return `Entrada registrada para ${qr.visitorName}.`;
}

export async function announceDeliveryAtGateAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";
  try {
    await enforceGuardShiftForGateOperation(session.userId);
  } catch (error) {
    return error instanceof Error ? error.message : "Debes tener turno laboral activo.";
  }

  const settings = await prisma.residential.findUnique({
    where: { id: session.residentialId },
    select: { enablePostaDeliveries: true },
  });
  if (!settings?.enablePostaDeliveries) {
    return "Pedidos en posta estan deshabilitados para esta residencial.";
  }

  const parsed = announceDeliverySchema.safeParse({
    residentId: formData.get("residentId"),
    deliveryNote: formData.get("deliveryNote"),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos invalidos.";
  }

  const resident = await prisma.user.findFirst({
    where: {
      id: parsed.data.residentId,
      residentialId: session.residentialId,
      role: "RESIDENT",
    },
    select: { id: true, fullName: true },
  });
  if (!resident) return "No se encontro el residente seleccionado.";

  const trimmedNote = parsed.data.deliveryNote.trim();
  await prisma.deliveryAnnouncement.create({
    data: {
      note: trimmedNote,
      residentId: resident.id,
      guardId: session.userId,
      residentialId: session.residentialId,
    },
  });

  await notifyUser(resident.id, {
    title: "Control Dragon",
    body: `Guardia: hay un delivery para ti. Detalle: ${trimmedNote}`,
    url: "/resident",
  });

  revalidatePath("/residential-admin");
  revalidatePath("/super-admin");
  return `Notificacion enviada a ${resident.fullName}.`;
}

export async function markPostaVisitExitAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";
  try {
    await enforceGuardShiftForGateOperation(session.userId);
  } catch (error) {
    return error instanceof Error ? error.message : "Debes tener turno laboral activo.";
  }

  const scanId = String(formData.get("scanId") ?? "").trim();
  if (!scanId) return "Identificador de registro invalido.";

  const exitNoteRaw = String(formData.get("exitNote") ?? "").trim();
  const exitNote =
    exitNoteRaw.length > 0
      ? exitNoteRaw.slice(0, 200)
      : "Salida registrada manualmente por Posta de Seguridad.";

  const scan = await prisma.qrScan.findFirst({
    where: {
      id: scanId,
      isValid: true,
      exitedAt: null,
      scannerId: session.userId,
      code: {
        residentialId: session.residentialId,
        description: { startsWith: GUARD_POSTA_DESCRIPTION_PREFIX },
      },
    },
    include: {
      code: {
        select: {
          visitorName: true,
          residentId: true,
          resident: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  if (!scan) {
    return "No se encontro el registro o no puedes marcar salida (solo el oficial que registro la entrada).";
  }

  await prisma.qrScan.update({
    where: { id: scan.id },
    data: {
      exitedAt: new Date(),
      exitNote,
    },
  });

  await notifyUser(scan.code.resident.id, {
    title: "Posta de Seguridad: salida registrada",
    body: `Se registro la salida de la visita ${scan.code.visitorName}.`,
    url: "/resident",
  });

  revalidatePath("/guard");
  revalidatePath("/resident");
  return `Salida registrada para ${scan.code.visitorName}.`;
}

export async function getGuardShiftPanelState(guardId: string) {
  const openShift = await getOpenGuardShift(guardId);
  if (!openShift) {
    return {
      hasOpenShift: false,
      nextHeartbeatAt: null as Date | null,
      heartbeatOverdue: false,
    };
  }
  const nextHeartbeatAt = getNextHeartbeatAt(openShift);
  return {
    hasOpenShift: true,
    nextHeartbeatAt,
    heartbeatOverdue: Date.now() > nextHeartbeatAt.getTime(),
  };
}
