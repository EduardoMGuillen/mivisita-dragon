import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/app/components/brand-lockup";
import { LandingLeadForm } from "@/app/components/landing-lead-form";
import { StandaloneLoginRedirect } from "@/app/components/standalone-login-redirect";
import {
  APP_DISPLAY_NAME,
  LOGO_PARTNER,
  PARTNER_NAME,
  PRODUCT_ENGINE_NAME,
  PRODUCT_ENGINE_URL,
  whiteLabelAttribution,
} from "@/lib/branding";
import { getPublicAppUrl } from "@/lib/get-public-app-url";

const APP_URL = getPublicAppUrl();

export const metadata: Metadata = {
  title: `${APP_DISPLAY_NAME} | Control de acceso residencial`,
  description:
    `${APP_DISPLAY_NAME}: plataforma MiVisita en colaboracion white label con ${PARTNER_NAME}. QR, reservas, push y reportes para residentes, guardias y administradores.`,
  keywords: [
    "mi visita",
    "dragon seguridad",
    "control de acceso",
    "residencial",
    "visitas",
    "qr",
    "white label",
    "reservas de zonas",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: `${APP_DISPLAY_NAME} | Seguridad y control de visitas`,
    description:
      "Gestiona visitas con QR, reservas de zonas y notificaciones en tiempo real. Motor MiVisita, operacion Dragon Seguridad.",
    siteName: APP_DISPLAY_NAME,
    images: [
      {
        url: LOGO_PARTNER,
        width: 1024,
        height: 1024,
        alt: APP_DISPLAY_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_DISPLAY_NAME} | Control de acceso residencial`,
    description:
      "Invitaciones QR, reservas de zonas y validacion en entrada. Plataforma MiVisita con Dragon Seguridad.",
    images: [LOGO_PARTNER],
  },
  icons: {
    icon: [{ url: LOGO_PARTNER, sizes: "any", type: "image/jpeg" }],
    shortcut: [LOGO_PARTNER],
    apple: [{ url: LOGO_PARTNER, sizes: "180x180", type: "image/jpeg" }],
  },
};

export default async function Home() {
  const landingJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_DISPLAY_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "HNL",
    },
    description:
      "Plataforma de control de acceso residencial con QR, reservas de zonas, notificaciones push y paneles para guardias, residentes y administradores.",
    url: APP_URL,
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
      <StandaloneLoginRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }}
      />
      <header className="surface-card flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <BrandLockup showEngineNote />
        <nav className="flex items-center gap-3">
          <Link
            href="/login?install=1"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Instalar app
          </Link>
          <Link href="/login" className="btn-primary text-sm">
            Iniciar sesion
          </Link>
        </nav>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="surface-card p-8">
          <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {PARTNER_NAME} · motor {PRODUCT_ENGINE_NAME}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Tu entrada residencial, digital y controlada
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {APP_DISPLAY_NAME} conecta residentes, guardias y administradores para controlar ingresos con QR,
            notificaciones en vivo y registro de evidencias. {whiteLabelAttribution()}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Acceso con QR seguro</p>
              <p className="mt-1 text-sm text-slate-600">
                Vigencia por tiempo o uso, validacion inmediata en la posta de seguridad.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Alertas en tiempo real</p>
              <p className="mt-1 text-sm text-slate-600">
                Residentes reciben aviso al momento de llegada o delivery.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Registro trazable</p>
              <p className="mt-1 text-sm text-slate-600">
                Historial de entradas, filtros por mes y exportacion por registro.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Reservas de zonas comunes</p>
              <p className="mt-1 text-sm text-slate-600">
                Calendario de reservas, bloqueos administrativos y control por horas maximas.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/login" className="btn-primary">
              Entrar al panel
            </Link>
            <Link
              href="/login?install=1"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Instalar app
            </Link>
          </div>
        </article>

        <article className="surface-card p-8">
          <h2 className="text-2xl font-bold text-slate-900">Como funciona {APP_DISPLAY_NAME}</h2>
          <ol className="mt-4 space-y-4 text-sm text-slate-700">
            <li>
              <p className="font-semibold text-slate-900">1) Residente crea la invitacion</p>
              <p>Genera QR con vigencia definida y lo comparte por WhatsApp o PDF.</p>
            </li>
            <li>
              <p className="font-semibold text-slate-900">2) Guardia valida en entrada</p>
              <p>Escanea QR, registra evidencia cuando aplica y confirma el ingreso.</p>
            </li>
            <li>
              <p className="font-semibold text-slate-900">3) Sistema notifica y registra</p>
              <p>Se envian alertas al residente y queda historial auditable para admin.</p>
            </li>
            <li>
              <p className="font-semibold text-slate-900">4) Gestion de zonas y reportes</p>
              <p>Los residentes reservan zonas y administracion controla bloqueos y reportes PDF.</p>
            </li>
          </ol>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nota operacional
            </p>
            <p className="mt-2 text-sm text-slate-600">
              El alta de usuarios la realiza el equipo administrador del residencial o super admin.
            </p>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Modulo Residente</p>
          <p className="mt-2 text-sm text-slate-600">
            Crea visitas, reserva zonas comunes y recibe avisos de llegada, delivery y recordatorios.
          </p>
        </article>
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Modulo Guardia</p>
          <p className="mt-2 text-sm text-slate-600">
            Escaneo rapido, validacion con evidencia y notificacion directa al residente.
          </p>
        </article>
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Modulo Administracion</p>
          <p className="mt-2 text-sm text-slate-600">
            Monitoreo de entradas, reservas y bloqueos, comunicados push y exportes para auditoria.
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Nuevas capacidades operativas</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- QR con validez infinita y descripcion opcional.</li>
            <li>- Evidencia de ID y placa para visitas en vehiculo.</li>
            <li>- Reporte mensual PDF de entradas y delivery.</li>
            <li>- Comunicados push por residencial (masivo o seleccionado).</li>
          </ul>
        </article>
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Para equipos administrativos</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Creacion de zonas y politicas por horas maximas.</li>
            <li>- Bloqueo de fechas/rangos de uso en calendario.</li>
            <li>- Notificacion inmediata al admin cuando hay nueva reserva.</li>
            <li>- Notificacion al residente por cancelaciones de reserva por admin.</li>
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Funciones para Super Admin</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Alta de residenciales y administradores.</li>
            <li>- Cotizaciones y contratos con PDF profesional e impresion posterior.</li>
            <li>- Suspension temporal de residencial con reactivacion por switch.</li>
            <li>- Backup manual de reportes (PDF por residencial).</li>
            <li>- Backup completo de base de datos en ZIP.</li>
          </ul>
        </article>
        <article className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-900">Trazabilidad, soporte y seguridad</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Registro de entradas con filtros avanzados y exportes por registro.</li>
            <li>- Evidencia de ID y placa integrada en reportes mensuales PDF.</li>
            <li>- Configuracion de WhatsApp de soporte por residencial.</li>
            <li>- Vista de sugerencias de residentes para administracion.</li>
            <li>- Retencion de evidencia sensible por politica de 60 dias.</li>
          </ul>
        </article>
      </section>

      <section className="mt-6 surface-card p-8">
        <h2 className="text-2xl font-bold text-slate-900">¿Te interesa para tu residencial?</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Deja tus datos y el equipo de {PARTNER_NAME} o {PRODUCT_ENGINE_NAME} te contactara. Esta instancia
          opera sobre{" "}
          <a href={PRODUCT_ENGINE_URL} className="font-semibold text-blue-700 hover:underline">
            {PRODUCT_ENGINE_NAME}.app
          </a>
          .
        </p>
        <div className="mt-6 max-w-lg">
          <LandingLeadForm />
        </div>
      </section>
    </main>
  );
}
