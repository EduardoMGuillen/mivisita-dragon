import Link from "next/link";
import { Card } from "@/app/components/shell";
import { DatabaseBackupButton } from "@/app/super-admin/database-backup-button";
import { ReportsBackupButton } from "@/app/super-admin/reports-backup-button";
import { requireRole } from "@/lib/authorization";

export default async function SuperAdminBackupsPage() {
  await requireRole(["SUPER_ADMIN"]);

  return (
    <>
      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Backup manual</h2>
        <p className="mb-4 text-sm text-slate-600">
          Descarga respaldos de reportes PDF y snapshot completo de datos para archivo interno.
        </p>
        <div className="grid gap-3">
          <ReportsBackupButton />
          <DatabaseBackupButton />
        </div>
      </Card>
      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Asistencia laboral</h2>
        <p className="mb-4 text-sm text-slate-600">
          Los turnos y checkpoints de guardias se consultan en el modulo dedicado (evidencia y geolocalizacion).
        </p>
        <Link
          href="/super-admin/guard-attendance"
          className="btn-primary inline-flex items-center justify-center md:w-max"
        >
          Ir a asistencia de guardias
        </Link>
      </Card>
    </>
  );
}
