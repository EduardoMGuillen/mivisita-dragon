import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { Card, DashboardShell } from "@/app/components/shell";
import { GuardQrScanner } from "@/app/guard/qr-scanner";
import { GuardManualAcceptForm } from "@/app/guard/guard-manual-accept-form";
import { GuardManualEntryForm } from "@/app/guard/guard-manual-entry-form";
import { GuardPostaExitForm } from "@/app/guard/guard-posta-exit-form";
import { GuardShiftCard } from "@/app/guard/guard-shift-card";
import { GuardPushSubscriptionCard } from "@/app/guard/push-subscription";
import { GuardAutoRefresh } from "@/app/guard/guard-auto-refresh";
import { GuardDeliveryAnnouncementForm } from "@/app/guard/delivery-announcement-form";
import { formatDateTimeTegucigalpa } from "@/lib/datetime";
import { getNextHeartbeatAt, getOpenGuardShift } from "@/lib/guard-shift";
import { GUARD_POSTA_DESCRIPTION_PREFIX } from "@/lib/guard-posta";

function tegucigalpaTodayRange(now = new Date()) {
  const tegucigalpaOffsetHours = 6;
  const shifted = new Date(now.getTime() - tegucigalpaOffsetHours * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  const start = new Date(Date.UTC(year, month, day, tegucigalpaOffsetHours, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day + 1, tegucigalpaOffsetHours, 0, 0, 0));
  return { start, end };
}

export default async function GuardPage() {
  const session = await requireRole(["GUARD"]);
  if (!session.residentialId) {
    return <p className="p-8 text-red-600">Sesion invalida sin residencial.</p>;
  }

  const { start: todayStart, end: todayEnd } = tegucigalpaTodayRange();

  const activeInvites = await prisma.qrCode.findMany({
    where: {
      residentialId: session.residentialId,
      isRevoked: false,
      validUntil: { gte: new Date() },
    },
    include: {
      resident: { select: { fullName: true } },
      scans: {
        where: { isValid: true },
        orderBy: { scannedAt: "desc" },
        take: 1,
        select: { scannedAt: true, reason: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const guardGeneratedEntries = await prisma.qrCode.findMany({
    where: {
      residentialId: session.residentialId,
      description: {
        startsWith: GUARD_POSTA_DESCRIPTION_PREFIX,
      },
    },
    include: {
      resident: { select: { fullName: true } },
      scans: {
        where: { isValid: true },
        orderBy: { scannedAt: "desc" },
        take: 1,
        select: { id: true, scannedAt: true, exitedAt: true, scannerId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const postaPendingExitsForGuard = await prisma.qrScan.findMany({
    where: {
      isValid: true,
      exitedAt: null,
      scannerId: session.userId,
      code: {
        residentialId: session.residentialId,
        description: { startsWith: GUARD_POSTA_DESCRIPTION_PREFIX },
      },
    },
    orderBy: { scannedAt: "desc" },
    take: 25,
    select: {
      id: true,
      scannedAt: true,
      code: {
        select: {
          visitorName: true,
          resident: { select: { fullName: true } },
        },
      },
    },
  });
  const recentRegisteredAnnouncements = await prisma.qrScan.findMany({
    where: {
      isValid: true,
      code: { residentialId: session.residentialId },
    },
    orderBy: { scannedAt: "desc" },
    take: 20,
    select: {
      id: true,
      scannedAt: true,
      reason: true,
      scanner: { select: { fullName: true } },
      code: {
        select: {
          visitorName: true,
          resident: { select: { fullName: true } },
        },
      },
    },
  });
  const todayZoneReservations = await prisma.zoneReservation.findMany({
    where: {
      residentialId: session.residentialId,
      status: "APPROVED",
      startsAt: { gte: todayStart, lt: todayEnd },
    },
    include: {
      zone: { select: { name: true } },
      resident: { select: { fullName: true } },
    },
    orderBy: { startsAt: "asc" },
    take: 80,
  });
  const pendingInvites = activeInvites.filter((invite) => invite.scans.length === 0);
  const openShift = await getOpenGuardShift(session.userId);
  const nextHeartbeatAt = openShift ? getNextHeartbeatAt(openShift) : null;
  const now = new Date();
  const heartbeatOverdue = nextHeartbeatAt ? now.getTime() > nextHeartbeatAt.getTime() : false;
  const residents = await prisma.user.findMany({
    where: {
      residentialId: session.residentialId,
      role: "RESIDENT",
    },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
    take: 100,
  });

  return (
    <DashboardShell
      title="Panel de Guardia"
      subtitle="Escanea y valida QRs de las visitas."
      user={session.fullName}
    >
      <GuardAutoRefresh />
      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Marcaje laboral de guardia</h2>
        <p className="mb-4 text-sm text-slate-600">
          Debes iniciar turno y registrar checkpoint cada 2 horas con selfie y geolocalizacion.
        </p>
        <GuardShiftCard
          hasOpenShift={Boolean(openShift)}
          nextHeartbeatAtIso={nextHeartbeatAt ? nextHeartbeatAt.toISOString() : null}
          heartbeatOverdue={heartbeatOverdue}
        />
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Escanear QR</h2>
        <GuardQrScanner />
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Delivery en entrada</h2>
        <p className="mb-4 text-sm text-slate-600">
          Selecciona el residente y notifica que su delivery esta en la entrada.
        </p>
        <GuardDeliveryAnnouncementForm residents={residents} />
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Entrada manual por llamada (Posta)</h2>
        <p className="mb-4 text-sm text-slate-600">
          Si el residente anuncia por llamada, registra residente, visita y evidencias. La entrada queda marcada al
          guardar; el residente ve el codigo con etiqueta de Posta de Seguridad y recibe notificacion push si esta
          suscrito. Solo quien registro la entrada puede marcar salida manual mas abajo.
        </p>
        <GuardManualEntryForm residents={residents} />

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-700">
          Salidas pendientes (tus registros de Posta)
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Visitas creadas por ti con entrada ya registrada y sin salida. Usa el mismo turno activo y checkpoints al
          dia.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {postaPendingExitsForGuard.map((row) => (
            <div key={row.id} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="font-semibold text-slate-900">{row.code.visitorName}</p>
              <p className="text-sm text-slate-600">Residente: {row.code.resident.fullName}</p>
              <p className="text-xs text-slate-500">
                Entrada: {formatDateTimeTegucigalpa(row.scannedAt)} — salida pendiente
              </p>
              <GuardPostaExitForm scanId={row.id} visitorName={row.code.visitorName} />
            </div>
          ))}
          {postaPendingExitsForGuard.length === 0 ? (
            <p className="text-sm text-slate-600">No tienes salidas pendientes de registros propios de Posta.</p>
          ) : null}
        </div>

        <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-700">
          Entradas generadas por Posta (recientes)
        </h3>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {guardGeneratedEntries.map((entry) => {
            const scan = entry.scans[0];
            const wasAccepted = Boolean(scan);
            const exitDone = Boolean(scan?.exitedAt);
            return (
              <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{entry.visitorName}</p>
                  <span
                    className={
                      wasAccepted
                        ? exitDone
                          ? "rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                          : "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                        : "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                    }
                  >
                    {!wasAccepted ? "Pendiente evidencia" : exitDone ? "Salida registrada" : "En sitio (sin salida)"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">Residente: {entry.resident.fullName}</p>
                <p className="text-xs text-slate-500">
                  Tipo de acceso: {entry.hasVehicle ? "Vehiculo" : "Acceso peatonal"}
                </p>
                <p className="text-xs text-slate-500">Creada: {formatDateTimeTegucigalpa(entry.createdAt)}</p>
                <p className="text-xs text-slate-500">Expira: {formatDateTimeTegucigalpa(entry.validUntil)}</p>
                {scan ? (
                  <>
                    <p className="mt-1 text-xs text-slate-600">
                      Entrada: {formatDateTimeTegucigalpa(scan.scannedAt)}
                    </p>
                    <p className="text-xs text-slate-600">
                      Salida: {scan.exitedAt ? formatDateTimeTegucigalpa(scan.exitedAt) : "Pendiente"}
                    </p>
                  </>
                ) : null}
              </div>
            );
          })}
          {guardGeneratedEntries.length === 0 ? (
            <p className="text-sm text-slate-600">Aun no hay entradas creadas manualmente por guardia.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Reservas de zonas para hoy</h2>
        <p className="mb-4 text-sm text-slate-600">
          Reservas activas del dia actual para control de acceso en caseta.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {todayZoneReservations.map((reservation) => (
            <div key={reservation.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="font-semibold text-slate-900">{reservation.zone.name}</p>
              <p className="text-sm text-slate-700">Residente: {reservation.resident.fullName}</p>
              <p className="text-xs text-slate-600">
                Horario: {formatDateTimeTegucigalpa(reservation.startsAt)} -{" "}
                {formatDateTimeTegucigalpa(reservation.endsAt)}
              </p>
              {reservation.note ? <p className="mt-1 text-xs text-slate-500">{reservation.note}</p> : null}
            </div>
          ))}
          {todayZoneReservations.length === 0 ? (
            <p className="text-sm text-slate-600">No hay reservas activas para hoy.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Anuncios recientes</h2>
        <GuardPushSubscriptionCard />
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-700">
            Acceso manual (anuncios pendientes)
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="font-semibold text-slate-900">{invite.visitorName}</p>
                <p className="text-sm text-slate-600">Residente: {invite.resident.fullName}</p>
                {invite.description ? (
                  <p className="text-xs text-slate-600">Descripcion: {invite.description}</p>
                ) : null}
                <p className="text-xs text-slate-500">
                  Tipo de acceso: {invite.hasVehicle ? "Vehiculo" : "Acceso peatonal"}
                </p>
                <p className="text-xs text-slate-500">
                  Expira: {formatDateTimeTegucigalpa(invite.validUntil)}
                </p>
                <GuardManualAcceptForm qrId={invite.id} hasVehicle={invite.hasVehicle} />
              </div>
            ))}
            {pendingInvites.length === 0 ? (
              <p className="text-sm text-slate-600">No hay anuncios pendientes ahora mismo.</p>
            ) : null}
          </div>
        </details>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-slate-700">
            Ultimos 20 anuncios registrados
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {recentRegisteredAnnouncements.map((record) => (
              <div key={record.id} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="font-semibold text-slate-900">{record.code.visitorName}</p>
                <p className="text-sm text-slate-700">Residente: {record.code.resident.fullName}</p>
                <p className="text-xs text-slate-600">Guardia: {record.scanner.fullName}</p>
                <p className="text-xs text-slate-600">
                  Registrado: {formatDateTimeTegucigalpa(record.scannedAt)}
                </p>
                <p className="mt-1 text-xs text-slate-600">{record.reason}</p>
              </div>
            ))}
            {recentRegisteredAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-600">Aun no hay anuncios registrados.</p>
            ) : null}
          </div>
        </details>
      </Card>
    </DashboardShell>
  );
}
