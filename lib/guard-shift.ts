import { prisma } from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/geo";

export const GUARD_SHIFT_HEARTBEAT_INTERVAL_MS = 2 * 60 * 60 * 1000;

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

type GeoCheckResult = {
  distanceMeters: number | null;
  isAnomalous: boolean;
  anomalyReason: string | null;
};

export async function getOpenGuardShift(guardId: string) {
  return prisma.guardShift.findFirst({
    where: { guardId, endedAt: null },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      startedAt: true,
      residentialId: true,
      marks: {
        select: { markedAt: true },
        orderBy: { markedAt: "desc" },
        take: 1,
      },
    },
  });
}

export function getNextHeartbeatAt(openShift: {
  startedAt: Date;
  marks: Array<{ markedAt: Date }>;
}) {
  const baseTime = openShift.marks[0]?.markedAt ?? openShift.startedAt;
  return new Date(baseTime.getTime() + GUARD_SHIFT_HEARTBEAT_INTERVAL_MS);
}

export function isHeartbeatOverdue(openShift: {
  startedAt: Date;
  marks: Array<{ markedAt: Date }>;
}) {
  const nextHeartbeatAt = getNextHeartbeatAt(openShift);
  return Date.now() > nextHeartbeatAt.getTime();
}

export async function validateGeoAgainstResidential(
  residentialId: string,
  point: GeoPoint,
): Promise<GeoCheckResult> {
  const residential = await prisma.residential.findUnique({
    where: { id: residentialId },
    select: {
      gateLatitude: true,
      gateLongitude: true,
      gateRadiusMeters: true,
    },
  });
  if (!residential) {
    return {
      distanceMeters: null,
      isAnomalous: true,
      anomalyReason: "No se encontro la residencial para validar geolocalizacion.",
    };
  }
  if (residential.gateLatitude == null || residential.gateLongitude == null) {
    return {
      distanceMeters: null,
      isAnomalous: true,
      anomalyReason: "Residencial sin coordenadas de caseta configuradas.",
    };
  }

  const distanceMeters = haversineDistanceMeters(
    { latitude: point.latitude, longitude: point.longitude },
    {
      latitude: residential.gateLatitude,
      longitude: residential.gateLongitude,
    },
  );
  const radius = residential.gateRadiusMeters || 80;
  if (distanceMeters > radius) {
    return {
      distanceMeters,
      isAnomalous: true,
      anomalyReason: `Marcaje fuera de radio de caseta (${Math.round(distanceMeters)}m > ${radius}m).`,
    };
  }
  return {
    distanceMeters,
    isAnomalous: false,
    anomalyReason: null,
  };
}

export async function enforceGuardShiftForGateOperation(guardId: string) {
  const openShift = await getOpenGuardShift(guardId);
  if (!openShift) {
    throw new Error("Debes iniciar tu turno laboral antes de operar ingresos o salidas.");
  }
  if (isHeartbeatOverdue(openShift)) {
    throw new Error("Tienes un marcaje laboral vencido. Marca tu checkpoint de turno para continuar.");
  }
}
