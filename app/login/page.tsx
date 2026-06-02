import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dashboardPathByRole } from "@/lib/authorization";
import { ensureSuperAdminExists } from "@/lib/bootstrap";
import { LoginForm } from "@/app/login/login-form";
import { InstallAppGuide } from "@/app/components/install-app-guide";
import { BrandLockup } from "@/app/components/brand-lockup";
import { APP_DISPLAY_NAME, whiteLabelAttribution } from "@/lib/branding";

export const dynamic = "force-dynamic";

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const shouldOpenInstall = getSingleParam(params.install) === "1";
  const resetSuccess = getSingleParam(params.reset) === "ok";

  await ensureSuperAdminExists();
  const dbConfigured =
    Boolean(process.env.DATABASE_URL) ||
    Boolean(process.env.POSTGRES_PRISMA_URL) ||
    Boolean(process.env.POSTGRES_URL) ||
    Boolean(process.env.POSTGRES_URL_NON_POOLING);

  const session = await getSession();
  if (session) redirect(dashboardPathByRole(session.role));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10">
      <section className="grid w-full gap-6 lg:grid-cols-2">
        <article className="surface-card hidden p-8 lg:block">
          <BrandLockup showEngineNote />
          <p className="mt-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Control de acceso residencial
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">{APP_DISPLAY_NAME}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{whiteLabelAttribution()}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Multi residencial</p>
              <p className="mt-1 text-slate-600">Escalable para varios proyectos.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">QR seguro</p>
              <p className="mt-1 text-slate-600">Validez por uso o por tiempo.</p>
            </div>
          </div>
        </article>

        <article className="surface-card w-full max-w-xl justify-self-center p-6 md:p-8">
          <div className="mb-5">
            <div className="mb-3">
              <BrandLockup compact />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Iniciar sesion</h1>
            <p className="mt-1 text-sm text-slate-600">Accede a tu panel de {APP_DISPLAY_NAME}.</p>
          </div>
          {!dbConfigured ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Falta configurar la conexion a base de datos en variables de entorno.
            </div>
          ) : null}
          <div className="mb-4">
            <InstallAppGuide initialOpen={shouldOpenInstall} />
          </div>
          <LoginForm resetSuccess={resetSuccess} />
        </article>
      </section>
    </main>
  );
}
