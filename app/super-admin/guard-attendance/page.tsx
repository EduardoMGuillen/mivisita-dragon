import Link from "next/link";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { Card } from "@/app/components/shell";
import { formatDateTimeTegucigalpa } from "@/lib/datetime";

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function calculateWorkedHours(startedAt: Date, endedAt: Date | null) {
  const end = endedAt ?? new Date();
  const durationMs = Math.max(0, end.getTime() - startedAt.getTime());
  return durationMs / (1000 * 60 * 60);
}

export default async function GuardAttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["SUPER_ADMIN"]);
  const params = await searchParams;
  const residentialId = getSingleParam(params.residentialId).trim();
  const guardId = getSingleParam(params.guardId).trim();
  const anomalyOnly = getSingleParam(params.anomaly) === "1";
  const fromRaw = getSingleParam(params.from).trim();
  const toRaw = getSingleParam(params.to).trim();
  const now = new Date();

  const from = fromRaw ? new Date(`${fromRaw}T00:00:00.000`) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const to = toRaw ? new Date(`${toRaw}T23:59:59.999`) : now;

  const [residentials, guards, shifts] = await Promise.all([
    prisma.residential.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        role: "GUARD",
        ...(residentialId ? { residentialId } : {}),
      },
      select: {
        id: true,
        fullName: true,
        residentialId: true,
        residential: { select: { name: true } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.guardShift.findMany({
      where: {
        startedAt: { gte: from, lte: to },
        ...(residentialId ? { residentialId } : {}),
        ...(guardId ? { guardId } : {}),
        ...(anomalyOnly
          ? {
              OR: [
                { startIsAnomalous: true },
                { endIsAnomalous: true },
                { marks: { some: { isAnomalous: true } } },
              ],
            }
          : {}),
      },
      include: {
        guard: { select: { fullName: true } },
        residential: { select: { name: true } },
        marks: {
          select: {
            id: true,
            markedAt: true,
            distanceMeters: true,
            isAnomalous: true,
            anomalyReason: true,
          },
          orderBy: { markedAt: "asc" },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 200,
    }),
  ]);

  const totalHours = shifts.reduce((acc, shift) => acc + calculateWorkedHours(shift.startedAt, shift.endedAt), 0);
  const totalHeartbeats = shifts.reduce((acc, shift) => acc + shift.marks.length, 0);
  const anomalyCount = shifts.reduce((acc, shift) => {
    let value = acc;
    if (shift.startIsAnomalous) value += 1;
    if (shift.endIsAnomalous) value += 1;
    value += shift.marks.filter((mark) => mark.isAnomalous).length;
    return value;
  }, 0);
  const expectedHeartbeats = shifts.reduce((acc, shift) => {
    const workedHours = calculateWorkedHours(shift.startedAt, shift.endedAt);
    return acc + Math.max(0, Math.floor(workedHours / 2));
  }, 0);
  const missedHeartbeats = Math.max(0, expectedHeartbeats - totalHeartbeats);

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Filtro de asistencia</h2>
          <Link
            href="/super-admin/residenciales"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Volver a residenciales
          </Link>
        </div>
        <form className="mt-4 grid gap-2 md:grid-cols-3">
          <select name="residentialId" defaultValue={residentialId} className="field-base">
            <option value="">Todas las residenciales</option>
            {residentials.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select name="guardId" defaultValue={guardId} className="field-base">
            <option value="">Todos los guardias</option>
            {guards.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName} ({item.residential?.name ?? "Sin residencial"})
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" name="anomaly" value="1" defaultChecked={anomalyOnly} />
            Solo marcajes anómalos
          </label>
          <input type="date" name="from" defaultValue={fromRaw || from.toISOString().slice(0, 10)} className="field-base" />
          <input type="date" name="to" defaultValue={toRaw || to.toISOString().slice(0, 10)} className="field-base" />
          <button className="btn-primary w-full">Aplicar filtros</button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">KPIs de asistencia</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Turnos</p>
            <p className="text-2xl font-bold text-slate-900">{shifts.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Horas registradas</p>
            <p className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Checkpoints faltantes</p>
            <p className="text-2xl font-bold text-slate-900">{missedHeartbeats}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Eventos anómalos</p>
            <p className="text-2xl font-bold text-amber-700">{anomalyCount}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Detalle de marcajes laborales</h2>
        <div className="grid gap-3">
          {shifts.map((shift) => (
            <article key={shift.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="font-semibold text-slate-900">{shift.guard.fullName}</p>
              <p className="text-sm text-slate-600">Residencial: {shift.residential.name}</p>
              <p className="text-xs text-slate-500">
                Entrada: {formatDateTimeTegucigalpa(shift.startedAt)} | Salida:{" "}
                {shift.endedAt ? formatDateTimeTegucigalpa(shift.endedAt) : "Turno abierto"}
              </p>
              <p className="text-xs text-slate-500">
                Distancia entrada:{" "}
                {shift.startDistanceMeters != null ? `${Math.round(shift.startDistanceMeters)}m` : "Sin referencia"} |{" "}
                Distancia salida:{" "}
                {shift.endDistanceMeters != null ? `${Math.round(shift.endDistanceMeters)}m` : "Sin referencia"}
              </p>
              {shift.startIsAnomalous ? (
                <p className="mt-1 text-xs font-semibold text-amber-700">
                  Anomalia entrada: {shift.startAnomalyReason || "Marcaje anomalo."}
                </p>
              ) : null}
              {shift.endIsAnomalous ? (
                <p className="text-xs font-semibold text-amber-700">
                  Anomalia salida: {shift.endAnomalyReason || "Marcaje anomalo."}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={`/api/guard-shift/start-selfie/${shift.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Ver selfie entrada
                </a>
                {shift.endedAt ? (
                  <a
                    href={`/api/guard-shift/end-selfie/${shift.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Ver selfie salida
                  </a>
                ) : null}
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Checkpoints ({shift.marks.length})
                </summary>
                <div className="mt-2 grid gap-2">
                  {shift.marks.map((mark) => (
                    <div key={mark.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs text-slate-700">
                        {formatDateTimeTegucigalpa(mark.markedAt)} | Distancia:{" "}
                        {mark.distanceMeters != null ? `${Math.round(mark.distanceMeters)}m` : "Sin referencia"}
                      </p>
                      {mark.isAnomalous ? (
                        <p className="text-xs font-semibold text-amber-700">
                          Anomalia: {mark.anomalyReason || "Marcaje fuera de politica."}
                        </p>
                      ) : null}
                      <a
                        href={`/api/guard-shift/mark-selfie/${mark.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Ver selfie checkpoint
                      </a>
                    </div>
                  ))}
                  {shift.marks.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin checkpoints registrados.</p>
                  ) : null}
                </div>
              </details>
            </article>
          ))}
          {shifts.length === 0 ? <p className="text-sm text-slate-600">No hay turnos para los filtros aplicados.</p> : null}
        </div>
      </Card>
    </>
  );
}
