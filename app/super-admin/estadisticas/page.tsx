import { Card } from "@/app/components/shell";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

type ResidentialConsumption = {
  residentialId: string;
  residentialName: string;
  entries: number;
  deliveries: number;
  qrCreated: number;
  total: number;
};

type TrendItem = {
  monthKey: string;
  label: string;
  entries: number;
  deliveries: number;
  qrCreated: number;
};

function monthKey(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${value.getFullYear()}-${month}`;
}

function monthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function monthShortLabel(value: Date) {
  return value.toLocaleDateString("es-HN", { month: "short", year: "2-digit" });
}

export default async function SuperAdminStatsPage() {
  await requireRole(["SUPER_ADMIN"]);

  const now = new Date();
  const currentMonthStart = monthStart(now);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const sixMonthsStart = addMonths(currentMonthStart, -5);

  const [
    residentials,
    entriesMonth,
    deliveriesMonth,
    qrCreatedMonth,
    idEvidenceMonth,
    pendingExitMonth,
    scansForConsumption,
    deliveriesForConsumption,
    qrsForConsumption,
    scansForTrend,
    deliveriesForTrend,
    qrsForTrend,
  ] = await Promise.all([
    prisma.residential.findMany({
      select: { id: true, name: true, isSuspended: true },
      orderBy: { name: "asc" },
    }),
    prisma.qrScan.count({
      where: {
        isValid: true,
        scannedAt: { gte: currentMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.deliveryAnnouncement.count({
      where: {
        createdAt: { gte: currentMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.qrCode.count({
      where: {
        createdAt: { gte: currentMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.qrScan.count({
      where: {
        isValid: true,
        scannedAt: { gte: currentMonthStart, lt: nextMonthStart },
        idPhotoData: { not: null },
      },
    }),
    prisma.qrScan.count({
      where: {
        isValid: true,
        scannedAt: { gte: currentMonthStart, lt: nextMonthStart },
        exitedAt: null,
      },
    }),
    prisma.qrScan.findMany({
      where: {
        isValid: true,
        scannedAt: { gte: currentMonthStart, lt: nextMonthStart },
      },
      select: {
        code: {
          select: {
            residentialId: true,
            residential: { select: { name: true } },
          },
        },
      },
    }),
    prisma.deliveryAnnouncement.findMany({
      where: {
        createdAt: { gte: currentMonthStart, lt: nextMonthStart },
      },
      select: {
        residentialId: true,
        residential: { select: { name: true } },
      },
    }),
    prisma.qrCode.findMany({
      where: {
        createdAt: { gte: currentMonthStart, lt: nextMonthStart },
      },
      select: {
        residentialId: true,
        residential: { select: { name: true } },
      },
    }),
    prisma.qrScan.findMany({
      where: {
        isValid: true,
        scannedAt: { gte: sixMonthsStart, lt: nextMonthStart },
      },
      select: { scannedAt: true },
    }),
    prisma.deliveryAnnouncement.findMany({
      where: {
        createdAt: { gte: sixMonthsStart, lt: nextMonthStart },
      },
      select: { createdAt: true },
    }),
    prisma.qrCode.findMany({
      where: {
        createdAt: { gte: sixMonthsStart, lt: nextMonthStart },
      },
      select: { createdAt: true },
    }),
  ]);

  const usageRate = qrCreatedMonth > 0 ? Math.round((entriesMonth / qrCreatedMonth) * 100) : 0;
  const idEvidenceRate = entriesMonth > 0 ? Math.round((idEvidenceMonth / entriesMonth) * 100) : 0;

  const residentialNameMap = new Map(residentials.map((item) => [item.id, item.name]));
  const consumptionMap = new Map<string, ResidentialConsumption>();

  const ensureResidentialBucket = (residentialId: string, residentialName: string) => {
    if (!consumptionMap.has(residentialId)) {
      consumptionMap.set(residentialId, {
        residentialId,
        residentialName,
        entries: 0,
        deliveries: 0,
        qrCreated: 0,
        total: 0,
      });
    }
    return consumptionMap.get(residentialId)!;
  };

  for (const scan of scansForConsumption) {
    const id = scan.code.residentialId;
    const bucket = ensureResidentialBucket(id, scan.code.residential.name);
    bucket.entries += 1;
  }
  for (const delivery of deliveriesForConsumption) {
    const bucket = ensureResidentialBucket(delivery.residentialId, delivery.residential.name);
    bucket.deliveries += 1;
  }
  for (const qr of qrsForConsumption) {
    const id = qr.residentialId;
    const name = qr.residential?.name ?? residentialNameMap.get(id) ?? "Residencial";
    const bucket = ensureResidentialBucket(id, name);
    bucket.qrCreated += 1;
  }

  const topConsumption = Array.from(consumptionMap.values())
    .map((item) => ({ ...item, total: item.entries + item.deliveries }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const maxTotalConsumption = Math.max(...topConsumption.map((item) => item.total), 1);
  const maxEntries = Math.max(...topConsumption.map((item) => item.entries), 1);
  const maxDeliveries = Math.max(...topConsumption.map((item) => item.deliveries), 1);

  const trend: TrendItem[] = [];
  const trendMap = new Map<string, TrendItem>();
  for (let index = 0; index < 6; index += 1) {
    const monthDate = addMonths(sixMonthsStart, index);
    const key = monthKey(monthDate);
    const base: TrendItem = {
      monthKey: key,
      label: monthShortLabel(monthDate),
      entries: 0,
      deliveries: 0,
      qrCreated: 0,
    };
    trendMap.set(key, base);
    trend.push(base);
  }
  for (const scan of scansForTrend) {
    const key = monthKey(scan.scannedAt);
    const bucket = trendMap.get(key);
    if (bucket) bucket.entries += 1;
  }
  for (const delivery of deliveriesForTrend) {
    const key = monthKey(delivery.createdAt);
    const bucket = trendMap.get(key);
    if (bucket) bucket.deliveries += 1;
  }
  for (const qr of qrsForTrend) {
    const key = monthKey(qr.createdAt);
    const bucket = trendMap.get(key);
    if (bucket) bucket.qrCreated += 1;
  }
  const maxTrendValue = Math.max(
    ...trend.flatMap((item) => [item.entries, item.deliveries, item.qrCreated]),
    1,
  );

  const activeResidentials = residentials.filter((item) => !item.isSuspended).length;
  const suspendedResidentials = residentials.length - activeResidentials;

  return (
    <>
      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Estadisticas globales (mes actual)</h2>
        <p className="mb-4 text-sm text-slate-600">
          Resumen operativo de consumo por residenciales sin modificar estructura de base de datos.
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Residenciales</p>
            <p className="text-2xl font-bold text-slate-900">{residentials.length}</p>
            <p className="text-xs text-slate-600">
              Activas: {activeResidentials} | Suspendidas: {suspendedResidentials}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Entradas</p>
            <p className="text-2xl font-bold text-slate-900">{entriesMonth}</p>
            <p className="text-xs text-slate-600">Con evidencia ID: {idEvidenceRate}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Deliveries</p>
            <p className="text-2xl font-bold text-slate-900">{deliveriesMonth}</p>
            <p className="text-xs text-slate-600">Pendientes de salida: {pendingExitMonth}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">QRs creados</p>
            <p className="text-2xl font-bold text-slate-900">{qrCreatedMonth}</p>
            <p className="text-xs text-slate-600">Tasa de uso: {usageRate}%</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Consumo total por residencial (mes actual)
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Ranking por volumen de actividad combinada (entradas + delivery).
        </p>
        <div className="space-y-3">
          {topConsumption.map((item) => (
            <div key={item.residentialId} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{item.residentialName}</p>
                <p className="text-xs text-slate-600">
                  Total: {item.total} | QRs: {item.qrCreated}
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.min(100, Math.round((item.total / maxTotalConsumption) * 100))}%` }}
                />
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Entradas: {item.entries}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, Math.round((item.entries / maxEntries) * 100))}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Deliveries: {item.deliveries}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.min(100, Math.round((item.deliveries / maxDeliveries) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {topConsumption.length === 0 ? (
            <p className="text-sm text-slate-600">Aun no hay consumo registrado en este mes.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Tendencia de 6 meses</h2>
        <p className="mb-4 text-sm text-slate-600">
          Evolucion de entradas, deliveries y QRs creados para seguimiento de crecimiento.
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trend.map((item) => (
            <div key={item.monthKey} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="mt-2 text-xs text-slate-600">Entradas: {item.entries}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.min(100, Math.round((item.entries / maxTrendValue) * 100))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">Deliveries: {item.deliveries}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.min(100, Math.round((item.deliveries / maxTrendValue) * 100))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">QRs creados: {item.qrCreated}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, Math.round((item.qrCreated / maxTrendValue) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
