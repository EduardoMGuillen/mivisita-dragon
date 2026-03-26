import { logoutAction } from "@/app/login/actions";
import { RefreshButton } from "@/app/components/refresh-button";
import { ConfirmPendingSubmitButton } from "@/app/components/pending-submit-button";

export function DashboardShell({
  title,
  subtitle,
  user,
  children,
}: {
  title: string;
  subtitle: string;
  user: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:py-8">
      <header className="surface-card flex flex-wrap items-end justify-between gap-4 p-5 md:p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-700">Control Dragon</p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
          <p className="text-sm text-slate-600">{subtitle}</p>
          <p className="mt-2 text-xs text-slate-500">Sesion activa: {user}</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <form action={logoutAction}>
            <ConfirmPendingSubmitButton
              confirmMessage="¿Seguro que deseas cerrar sesion?"
              pendingText="Cerrando sesion..."
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60"
            >
              Cerrar sesion
            </ConfirmPendingSubmitButton>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <section className="surface-card p-5 md:p-6">{children}</section>;
}
