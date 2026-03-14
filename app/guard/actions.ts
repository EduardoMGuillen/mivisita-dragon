"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { idPhotoFileToBytes, validateIdPhotoFile } from "@/lib/id-photo-storage";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/push";

const announceDeliverySchema = z.object({
  residentId: z.string().min(1, "Debes seleccionar un residente."),
  deliveryNote: z.string().min(3, "Escribe un detalle corto del delivery.").max(180, "Detalle demasiado largo."),
});

const createManualVisitSchema = z.object({
  residentId: z.string().min(1, "Debes seleccionar un residente."),
  visitorName: z.string().min(2, "Escribe el nombre de la visita.").max(80, "Nombre demasiado largo."),
  durationHours: z.coerce.number().int().min(1, "La duracion minima es 1 hora.").max(24, "Maximo 24 horas."),
  hasVehicle: z.coerce.boolean().default(false),
});

const GUARD_GENERATED_DESCRIPTION_PREFIX = "GUARD_GENERATED:";

function createGuardGeneratedCode() {
  return `GD-${crypto.randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`;
}

export async function createManualVisitByGuardAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";

  const parsed = createManualVisitSchema.safeParse({
    residentId: formData.get("residentId"),
    visitorName: formData.get("visitorName"),
    durationHours: formData.get("durationHours"),
    hasVehicle: formData.get("hasVehicle") === "on",
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

  const now = new Date();
  const validUntil = new Date(now.getTime() + parsed.data.durationHours * 60 * 60 * 1000);
  const visitorName = parsed.data.visitorName.trim();

  await prisma.qrCode.create({
    data: {
      code: createGuardGeneratedCode(),
      visitorName,
      description:
        `${GUARD_GENERATED_DESCRIPTION_PREFIX} Creado por guardia ${session.fullName}. ` +
        `Duracion ${parsed.data.durationHours} hora(s).`,
      hasVehicle: parsed.data.hasVehicle,
      validityType: "SINGLE_USE",
      validFrom: now,
      validUntil,
      maxUses: 1,
      residentialId: session.residentialId,
      residentId: resident.id,
    },
  });

  await notifyUser(resident.id, {
    title: "Control Dragon",
    body: `Guardia anuncio visita: ${visitorName}. Vigencia: ${parsed.data.durationHours} hora(s).`,
    url: "/resident",
  });

  revalidatePath("/guard");
  return `Entrada manual creada para ${visitorName} (residente: ${resident.fullName}).`;
}

export async function acceptAnnouncedVisitAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";

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
    title: "Control Dragon",
    body: `Tu visita (${qr.visitorName}) fue registrada en caseta.`,
    url: "/resident",
  });

  revalidatePath("/guard");
  return `Entrada registrada para ${qr.visitorName}.`;
}

export async function announceDeliveryAtGateAction(_prevState: string | null, formData: FormData) {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) return "Sesion invalida sin residencial asociada.";

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
