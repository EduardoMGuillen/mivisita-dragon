import QRCode from "qrcode";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { Card } from "@/app/components/shell";
import { CreateQrForm } from "@/app/resident/create-qr-form";
import { CreateZoneReservationForm } from "@/app/resident/create-zone-reservation-form";
import { ReservationRowActions } from "@/app/resident/reservation-row-actions";
import { deleteInviteQrAction } from "@/app/resident/actions";
import { QrShareActions } from "@/app/resident/qr-share-actions";
import { formatDateTimeTegucigalpa } from "@/lib/datetime";
import { isGuardPostaQr } from "@/lib/guard-posta";
import { autoCloseStalePostaVisits } from "@/lib/guard-posta-auto-exit";

type InviteWithImage = {
  id: string;
  code: string;
  visitorName: string;
  validityType: "SINGLE_USE" | "ONE_DAY" | "THREE_DAYS" | "INFINITE" | "SEVEN_DAYS" | "SEVEN_USES";
  description?: string | null;
  hasVehicle: boolean;
  validUntil: Date;
  usedCount: number;
  maxUses: number;
  isRevoked: boolean;
  image: string;
  isPosta: boolean;
  showResidentDescription: boolean;
  latestScan: { scannedAt: Date; exitedAt: Date | null } | null;
};

function validityLabel(validityType: InviteWithImage["validityType"]) {
  if (validityType === "SINGLE_USE") return "1 solo uso";
  if (validityType === "ONE_DAY") return "Valido por 1 dia";
  if (validityType === "SEVEN_DAYS") return "Valido por 7 dias";
  if (validityType === "SEVEN_USES") return "7 ingresos (sin vencimiento)";
  if (validityType === "INFINITE") return "Sin vencimiento";
  return "Valido por 3 dias";
}

type AllowedValidity = "SINGLE_USE" | "ONE_DAY" | "THREE_DAYS" | "INFINITE" | "SEVEN_DAYS" | "SEVEN_USES";

function allowedValidityTypesFromResidential(r: {
  allowResidentQrSingleUse: boolean;
  allowResidentQrOneDay: boolean;
  allowResidentQrThreeDays: boolean;
  allowResidentQrInfinite: boolean;
  allowResidentQrSevenDays: boolean;
  allowResidentQrSevenUses: boolean;
}): AllowedValidity[] {
  const out: AllowedValidity[] = [];
  if (r.allowResidentQrSingleUse) out.push("SINGLE_USE");
  if (r.allowResidentQrOneDay) out.push("ONE_DAY");
  if (r.allowResidentQrThreeDays) out.push("THREE_DAYS");
  if (r.allowResidentQrInfinite) out.push("INFINITE");
  if (r.allowResidentQrSevenDays) out.push("SEVEN_DAYS");
  if (r.allowResidentQrSevenUses) out.push("SEVEN_USES");
  return out;
}

export default async function ResidentPage() {
  const session = await requireRole(["RESIDENT"]);
  if (session.residentialId) {
    await autoCloseStalePostaVisits({ residentialId: session.residentialId });
  }
  const residential = session.residentialId
    ? await prisma.residential.findUnique({
        where: { id: session.residentialId },
        select: {
          name: true,
          supportPhone: true,
          allowResidentQrSingleUse: true,
          allowResidentQrOneDay: true,
          allowResidentQrThreeDays: true,
          allowResidentQrInfinite: true,
          allowResidentQrSevenDays: true,
          allowResidentQrSevenUses: true,
          enableResidentQrDateTime: true,
          enableResidentQrVehicleType: true,
          enableResidentQrVehicleCompanions: true,
          enableResidentDeliveryQr: true,
        },
      })
    : null;

  const allowedValidityTypes = residential
    ? allowedValidityTypesFromResidential(residential)
    : (["SINGLE_USE", "ONE_DAY", "THREE_DAYS", "INFINITE", "SEVEN_DAYS", "SEVEN_USES"] as AllowedValidity[]);

  const now = new Date();
  const scansInclude = {
    scans: {
      where: { isValid: true },
      orderBy: { scannedAt: "desc" } as const,
      take: 1,
      select: { scannedAt: true, exitedAt: true },
    },
  };
  // Split into two queries so active QRs are never hidden by a hard cap
  const [activeInvitesRaw, expiredInvitesRaw] = await Promise.all([
    prisma.qrCode.findMany({
      where: { residentId: session.userId, validUntil: { gte: now } },
      orderBy: { createdAt: "desc" },
      take: 300,
      include: scansInclude,
    }),
    prisma.qrCode.findMany({
      where: { residentId: session.userId, validUntil: { lt: now } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: scansInclude,
    }),
  ]);
  const invites = [...activeInvitesRaw, ...expiredInvitesRaw];
  const [zones, reservations, zoneReservations, zoneBlocks] = await Promise.all([
    prisma.zone.findMany({
      where: { residentialId: session.residentialId ?? "", isActive: true },
      orderBy: { name: "asc" },
      take: 50,
    }),
    prisma.zoneReservation.findMany({
      where: {
        residentId: session.userId,
        status: "APPROVED",
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            maxHoursPerReservation: true,
            oneReservationPerDay: true,
            scheduleStartHour: true,
            scheduleEndHour: true,
          },
        },
      },
      orderBy: { startsAt: "asc" },
      take: 40,
    }),
    prisma.zoneReservation.findMany({
      where: {
        residentialId: session.residentialId ?? "",
        status: "APPROVED",
      },
      select: {
        id: true,
        zoneId: true,
        startsAt: true,
        endsAt: true,
      },
      orderBy: { startsAt: "asc" },
      take: 800,
    }),
    prisma.zoneBlock.findMany({
      where: {
        residentialId: session.residentialId ?? "",
      },
      select: {
        zoneId: true,
        startsAt: true,
        endsAt: true,
      },
      orderBy: { startsAt: "asc" },
      take: 800,
    }),
  ]);

  const invitesWithImage: InviteWithImage[] = await Promise.all(
    invites.map(async (invite) => {
      const isPosta = isGuardPostaQr(invite.description);
      const latestScan = invite.scans[0] ?? null;
      return {
        id: invite.id,
        code: invite.code,
        visitorName: invite.visitorName,
        validityType: invite.validityType,
        description: invite.description,
        hasVehicle: invite.hasVehicle,
        validUntil: invite.validUntil,
        usedCount: invite.usedCount,
        maxUses: invite.maxUses,
        isRevoked: invite.isRevoked,
        image: await QRCode.toDataURL(`MP:${invite.code}`),
        isPosta,
        showResidentDescription: Boolean(invite.description && !isPosta),
        latestScan,
      };
    }),
  );

  const postaVisitsOpen = invitesWithImage.filter(
    (invite) =>
      invite.isPosta &&
      invite.validUntil >= now &&
      invite.latestScan != null &&
      invite.latestScan.exitedAt == null,
  );
  const activeInvites = invitesWithImage.filter(
    (invite) =>
      invite.validUntil >= now &&
      invite.usedCount < invite.maxUses &&
      !invite.isRevoked &&
      !postaVisitsOpen.some((p) => p.id === invite.id),
  );
  const expiredInvites = invitesWithImage.filter(
    (invite) =>
      !postaVisitsOpen.some((p) => p.id === invite.id) &&
      !activeInvites.some((a) => a.id === invite.id),
  );
  const zoneOccupiedSlots = [
    ...zoneReservations.map((item) => ({
      zoneId: item.zoneId,
      startsAtIso: item.startsAt.toISOString(),
      endsAtIso: item.endsAt.toISOString(),
      source: "reservation" as const,
      reservationId: item.id,
    })),
    ...zoneBlocks.map((item) => ({
      zoneId: item.zoneId,
      startsAtIso: item.startsAt.toISOString(),
      endsAtIso: item.endsAt.toISOString(),
      source: "block" as const,
    })),
  ];

  return (
    <>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Crear anuncio de visita</h2>
        <CreateQrForm
          allowedValidityTypes={allowedValidityTypes}
          enableResidentQrDateTime={residential?.enableResidentQrDateTime ?? false}
          enableResidentQrVehicleType={residential?.enableResidentQrVehicleType ?? false}
          enableResidentQrVehicleCompanions={residential?.enableResidentQrVehicleCompanions ?? false}
          enableResidentDeliveryQr={residential?.enableResidentDeliveryQr ?? false}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">QRs activos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeInvites.map((invite) => (
            <article key={invite.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              {invite.isPosta ? (
                <span className="mb-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  Posta de Seguridad
                </span>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={invite.image}
                alt={`QR de ${invite.visitorName}`}
                className="mx-auto h-40 w-40 rounded-lg bg-white p-2 shadow-sm"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900">{invite.visitorName}</p>
              <p className="text-xs text-slate-600">{validityLabel(invite.validityType)}</p>
              {invite.showResidentDescription && invite.description ? (
                <p className="text-xs text-slate-500">Descripcion: {invite.description}</p>
              ) : null}
              <p className="text-xs text-slate-500">
                Tipo de acceso: {invite.hasVehicle ? "Vehiculo" : "Acceso peatonal"}
              </p>
              <p className="text-xs text-slate-500">
                Expira: {formatDateTimeTegucigalpa(invite.validUntil)}
              </p>
              <p className="text-xs text-slate-500">
                Usos: {invite.usedCount}/{invite.maxUses === 9999 ? "Ilimitado" : invite.maxUses}
              </p>
              <p className="mt-2 break-all rounded-md bg-white px-2 py-1 text-[10px] text-slate-500">
                MP:{invite.code}
              </p>
              <QrShareActions
                qrDataUrl={invite.image}
                visitorName={invite.visitorName}
                code={invite.code}
                validityLabel={validityLabel(invite.validityType)}
                validUntilLabel={formatDateTimeTegucigalpa(invite.validUntil)}
                residentialName={residential?.name ?? "Residencial"}
                residentName={session.fullName}
              />
              {!invite.isPosta ? (
                <form action={deleteInviteQrAction} className="mt-2">
                  <input type="hidden" name="qrId" value={invite.id} />
                  <button className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100">
                    Eliminar QR
                  </button>
                </form>
              ) : null}
            </article>
          ))}
          {activeInvites.length === 0 ? (
            <p className="text-sm text-slate-600">No tienes QRs activos ahora mismo.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Visita en curso (Posta de Seguridad)</h2>
        <p className="mb-3 text-sm text-slate-600">
          Entradas registradas por la posta a tu nombre con ingreso ya marcado. Salida pendiente hasta que el oficial la
          registre.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {postaVisitsOpen.map((invite) => (
            <article
              key={invite.id}
              className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 ring-1 ring-amber-100"
            >
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                Posta de Seguridad
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={invite.image}
                alt={`QR de ${invite.visitorName}`}
                className="mx-auto mt-2 h-40 w-40 rounded-lg bg-white p-2 shadow-sm"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900">{invite.visitorName}</p>
              <p className="text-xs text-slate-600">{validityLabel(invite.validityType)}</p>
              <p className="text-xs font-medium text-amber-900">
                Entrada:{" "}
                {invite.latestScan ? formatDateTimeTegucigalpa(invite.latestScan.scannedAt) : "—"} · Salida pendiente
              </p>
              <p className="text-xs text-slate-500">
                Tipo de acceso: {invite.hasVehicle ? "Vehiculo" : "Acceso peatonal"}
              </p>
              <p className="text-xs text-slate-500">
                Referencia codigo: <span className="break-all font-mono">MP:{invite.code}</span>
              </p>
            </article>
          ))}
          {postaVisitsOpen.length === 0 ? (
            <p className="text-sm text-slate-600">No tienes visitas en curso registradas por la posta.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <details>
          <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">
            <span className="inline-flex items-center gap-2">QRs expirados ({expiredInvites.length})</span>
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expiredInvites.map((invite) => (
              <article
                key={invite.id}
                className="rounded-xl border border-slate-200 bg-slate-100/80 p-4 opacity-90"
              >
                {invite.isPosta ? (
                  <span className="mb-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                    Posta de Seguridad
                  </span>
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={invite.image}
                  alt={`QR de ${invite.visitorName}`}
                  className="mx-auto h-40 w-40 rounded-lg bg-white p-2 shadow-sm grayscale"
                />
                <p className="mt-3 text-sm font-semibold text-slate-900">{invite.visitorName}</p>
                <p className="text-xs text-slate-600">{validityLabel(invite.validityType)}</p>
                {invite.isPosta && invite.latestScan ? (
                  <p className="text-xs text-slate-600">
                    Entrada: {formatDateTimeTegucigalpa(invite.latestScan.scannedAt)}
                    {invite.latestScan.exitedAt
                      ? ` · Salida: ${formatDateTimeTegucigalpa(invite.latestScan.exitedAt)}`
                      : " · Salida pendiente"}
                  </p>
                ) : null}
                {invite.showResidentDescription && invite.description ? (
                  <p className="text-xs text-slate-500">Descripcion: {invite.description}</p>
                ) : null}
                <p className="text-xs text-slate-500">
                  Tipo de acceso: {invite.hasVehicle ? "Vehiculo" : "Acceso peatonal"}
                </p>
                <p className="text-xs text-slate-500">
                  Expira: {formatDateTimeTegucigalpa(invite.validUntil)}
                </p>
                <p className="text-xs text-slate-500">
                  Usos: {invite.usedCount}/{invite.maxUses === 9999 ? "Ilimitado" : invite.maxUses}
                </p>
                <p className="mt-2 break-all rounded-md bg-white px-2 py-1 text-[10px] text-slate-500">
                  MP:{invite.code}
                </p>
              </article>
            ))}
            {expiredInvites.length === 0 ? (
              <p className="text-sm text-slate-600">Aun no tienes QRs expirados.</p>
            ) : null}
            {invitesWithImage.length === 0 ? (
              <p className="text-sm text-slate-600">Aun no has generado QRs.</p>
            ) : null}
          </div>
        </details>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Reservar zona comun</h2>
        <CreateZoneReservationForm
          zones={zones.map((zone) => ({
            id: zone.id,
            name: zone.name,
            maxHoursPerReservation: zone.maxHoursPerReservation,
            oneReservationPerDay: zone.oneReservationPerDay,
            scheduleStartHour: zone.scheduleStartHour,
            scheduleEndHour: zone.scheduleEndHour,
          }))}
          occupiedSlots={zoneOccupiedSlots}
        />

        <div className="mt-4 grid gap-2">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-sm font-semibold text-slate-900">{reservation.zone.name}</p>
              <p className="text-xs text-slate-600">
                {formatDateTimeTegucigalpa(reservation.startsAt)} - {formatDateTimeTegucigalpa(reservation.endsAt)}
              </p>
              {reservation.note ? <p className="text-xs text-slate-500">Nota: {reservation.note}</p> : null}
              <ReservationRowActions
                reservationId={reservation.id}
                zoneId={reservation.zone.id}
                zoneName={reservation.zone.name}
                startsAtIso={reservation.startsAt.toISOString()}
                endsAtIso={reservation.endsAt.toISOString()}
                note={reservation.note}
                residentialName={residential?.name}
                zone={{
                  maxHoursPerReservation: reservation.zone.maxHoursPerReservation,
                  oneReservationPerDay: reservation.zone.oneReservationPerDay,
                  scheduleStartHour: reservation.zone.scheduleStartHour,
                  scheduleEndHour: reservation.zone.scheduleEndHour,
                }}
                occupiedSlots={zoneOccupiedSlots}
              />
            </div>
          ))}
          {reservations.length === 0 ? (
            <p className="text-sm text-slate-600">Aun no tienes reservas activas.</p>
          ) : null}
        </div>
      </Card>

    </>
  );
}
