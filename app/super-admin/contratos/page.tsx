import { Card } from "@/app/components/shell";
import { InvoiceGenerator } from "@/app/super-admin/invoice-generator";
import { QuotationGenerator } from "@/app/super-admin/quotation-generator";
import { ServiceContractForm } from "@/app/super-admin/service-contract-form";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { ServiceContractPrintButton } from "@/app/super-admin/service-contract-print-button";
import { requireRole } from "@/lib/authorization";
import { formatDateTimeTegucigalpa } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export default async function SuperAdminContractsPage() {
  await requireRole(["SUPER_ADMIN"]);

  const [residentials, recentContracts] = await Promise.all([
    prisma.residential.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceContract.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <>
      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Crear cotizacion</h2>
        <p className="mb-4 text-sm text-slate-600">
          Genera una cotizacion PDF para el servicio {APP_DISPLAY_NAME} (white label Dragon Seguridad sobre
          MiVisita).
        </p>
        <QuotationGenerator />
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Crear factura</h2>
        <p className="mb-4 text-sm text-slate-600">
          Factura PDF formal a nombre de Nexus Global: residencial, periodo de cobro e instrucciones de pago.
        </p>
        <InvoiceGenerator residentials={residentials.map((item) => ({ id: item.id, name: item.name }))} />
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Contrato de servicio (super admin)</h2>
        <p className="mb-4 text-sm text-slate-600">Crea contrato para conjunto residencial y genera su PDF.</p>
        <ServiceContractForm residentials={residentials.map((item) => ({ id: item.id, name: item.name }))} />
        <div className="mt-4 grid gap-2">
          {recentContracts.map((contract) => (
            <div key={contract.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-sm font-semibold text-slate-900">{contract.residentialName}</p>
              <p className="text-xs text-slate-600">
                Representante: {contract.legalRepresentative} | Plan: {contract.servicePlan}
              </p>
              <p className="text-xs text-slate-500">
                Inicio: {formatDateTimeTegucigalpa(contract.startsOn)} | Monto mensual: HNL{" "}
                {contract.monthlyAmount.toLocaleString("es-HN", { minimumFractionDigits: 2 })}
              </p>
              <ServiceContractPrintButton
                contractId={contract.id}
                residentialName={contract.residentialName}
                legalRepresentative={contract.legalRepresentative}
                representativeEmail={contract.representativeEmail}
                representativePhone={contract.representativePhone}
                servicePlan={contract.servicePlan}
                monthlyAmount={contract.monthlyAmount}
                startsOn={contract.startsOn.toISOString()}
                endsOn={contract.endsOn ? contract.endsOn.toISOString() : null}
                terms={contract.terms}
              />
            </div>
          ))}
        </div>
        {recentContracts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Aun no hay contratos registrados.</p>
        ) : null}
      </Card>
    </>
  );
}
