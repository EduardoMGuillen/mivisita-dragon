import { DashboardShell } from "@/app/components/shell";
import { SuperAdminNav } from "@/app/super-admin/admin-nav";
import { requireRole } from "@/lib/authorization";

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireRole(["SUPER_ADMIN"]);

  return (
    <DashboardShell
      title="Super Admin"
      subtitle="Residenciales, contratos, registros, estadisticas y asistencia de guardias."
      user={session.fullName}
    >
      <SuperAdminNav />
      {children}
    </DashboardShell>
  );
}
