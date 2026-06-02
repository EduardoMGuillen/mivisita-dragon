"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  APP_DISPLAY_NAME,
  FOOTER_NEXUS_LABEL,
  FOOTER_NEXUS_URL,
  LOGO_MIVISITA_UI,
  LOGO_PARTNER,
  PARTNER_NAME,
  PRODUCT_ENGINE_NAME,
  PRODUCT_ENGINE_URL,
} from "@/lib/branding";

const LandingLeadForm = dynamic(
  () => import("@/app/components/landing-lead-form").then((m) => m.LandingLeadForm),
  {
    loading: () => (
      <p className="text-sm text-slate-500" aria-busy="true">
        Cargando formulario…
      </p>
    ),
  },
);

const MARQUEE_ITEMS = [
  "Control de acceso con QR",
  "Invitaciones por WhatsApp",
  "Evidencia de ingreso",
  "Reservas de zonas comunes",
  "Notificaciones push",
  "Reportes PDF mensuales",
  "OTP para residentes",
  "Recuperacion de contraseña",
  "Backup de base de datos",
  "Delivery y paquetes",
  "Comunicados masivos",
  "Administracion multi-residencial",
];

function IconCheck() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconQr() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm14 0h2v2h-2v-2Zm-4 0h2v2h-2v-2Zm-2 4h2v2h-2v-2Zm4 0h2v2h-2v-2Z" fill="currentColor" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2V19h16v-1l-2-2Z" fill="currentColor" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 2h9l3 3v17H6V2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2 4 5v7c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V5l-8-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const TRUST_ITEMS = [
  "Acceso seguro con QR de vigencia configurable: por tiempo, por usos o permanente.",
  "Evidencia de identidad y placa vehicular integrada en el historial y reporte mensual.",
  "Notificaciones push inmediatas al residente cuando llega su visita o un delivery.",
  "Backup completo de base de datos y reportes descargables para administracion.",
];

export function LandingMarketing() {
  const marqueeTrack = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="relative overflow-x-hidden">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center -space-x-1 shrink-0">
              <Image
                src={LOGO_MIVISITA_UI}
                alt={PRODUCT_ENGINE_NAME}
                width={36}
                height={36}
                className="rounded-lg border border-slate-200 bg-white"
                priority
                sizes="36px"
              />
              <Image
                src={LOGO_PARTNER}
                alt={PARTNER_NAME}
                width={36}
                height={36}
                className="rounded-lg border border-slate-200"
                loading="lazy"
                sizes="36px"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{APP_DISPLAY_NAME}</p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Motor:{" "}
                <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                  {PRODUCT_ENGINE_NAME}.app
                </a>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={PRODUCT_ENGINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:block"
            >
              MiVisita.app
            </a>
            <Link
              href="/login?install=1"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 sm:text-sm"
            >
              Instalar
            </Link>
            <Link href="/login" className="btn-primary px-3 py-2 text-xs sm:text-sm">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 px-4 pb-20 pt-12 text-white sm:pt-16 md:pb-28 md:pt-20">
        <div
          className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/40 blur-3xl animate-landing-float"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-indigo-500/35 blur-3xl animate-landing-float [animation-delay:1.2s]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl">
          {/* Collaboration badge */}
          <div className="landing-reveal mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <span className="flex items-center gap-1.5">
              <Image src={LOGO_PARTNER} alt={PARTNER_NAME} width={18} height={18} className="rounded-sm" loading="lazy" sizes="18px" />
              {PARTNER_NAME}
            </span>
            <span className="text-white/40">×</span>
            <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
              <Image src={LOGO_MIVISITA_UI} alt={PRODUCT_ENGINE_NAME} width={18} height={18} className="rounded-sm" loading="lazy" sizes="18px" />
              {PRODUCT_ENGINE_NAME}
            </a>
            <span className="text-white/40">·</span>
            <span>Colaboracion white label</span>
          </div>

          <h1 className="landing-reveal max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl [animation-delay:80ms]">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Tu residencial, protegido por Dragon. Potenciado por MiVisita.
            </span>
          </h1>

          <p className="landing-reveal mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/90 sm:text-xl [animation-delay:140ms]">
            {PARTNER_NAME} opera la seguridad residencial sobre la plataforma{" "}
            <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-300 hover:underline">
              {PRODUCT_ENGINE_NAME}.app
            </a>
            {" "}— QR, notificaciones push, reservas y reportes en un solo lugar.
          </p>

          <div className="landing-reveal mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center [animation-delay:200ms]">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-700/30 hover:bg-blue-500"
            >
              Solicitar demo
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20"
            >
              Entrar al panel
            </Link>
            <a
              href={PRODUCT_ENGINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3.5 text-base font-semibold text-white/80 hover:bg-white/10"
            >
              Conocer MiVisita.app →
            </a>
          </div>

          <div className="landing-reveal mt-14 grid gap-4 sm:grid-cols-3 [animation-delay:260ms]">
            {[
              { label: "QR con vigencia configurada", icon: <IconQr /> },
              { label: "Push al instante al residente", icon: <IconBell /> },
              { label: "Reportes PDF y backup completo", icon: <IconDoc /> },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10"
              >
                <div className="mb-2 text-blue-200/90">{item.icon}</div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white py-4">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Funciones incluidas
        </p>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-landing-marquee gap-3 pr-3 motion-reduce:animate-none">
            {marqueeTrack.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm sm:text-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERSHIP STORY ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Colaboracion estrategica</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Tres actores, una solucion integrada
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Esta instancia es el resultado de una colaboracion entre Dragon Seguridad, la plataforma MiVisita y el equipo de desarrollo de Nexus Global.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Dragon */}
          <article className="relative overflow-hidden rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-400/20 blur-2xl" aria-hidden />
            <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-red-200 bg-white shadow">
              <Image src={LOGO_PARTNER} alt={PARTNER_NAME} width={56} height={56} className="object-cover" loading="lazy" sizes="56px" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Operacion local</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{PARTNER_NAME}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Empresa de seguridad responsable de operar el sistema en campo: guardias, posteo, monitoreo y atencion al cliente residencial.
            </p>
          </article>

          {/* MiVisita */}
          <article className="relative overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg shadow-blue-200/50">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl" aria-hidden />
            <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-blue-200 bg-white shadow">
              <Image src={LOGO_MIVISITA_UI} alt={PRODUCT_ENGINE_NAME} width={56} height={56} className="object-cover" loading="lazy" sizes="56px" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Motor tecnologico</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{PRODUCT_ENGINE_NAME}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Plataforma SaaS de control de acceso residencial: QR, push, reservas, reportes PDF y gestion multi-residencial.
            </p>
            <a
              href={PRODUCT_ENGINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
            >
              {PRODUCT_ENGINE_NAME}.app →
            </a>
          </article>

          {/* Nexus */}
          <article className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-100 p-6 shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-400/20 blur-2xl" aria-hidden />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-800 shadow">
              <span className="text-lg font-black text-white">N</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Soporte y desarrollo</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{FOOTER_NEXUS_LABEL}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Equipo de desarrollo e integracion detras de la plataforma. Soporte tecnico, mantenimiento y evoluciones de producto.
            </p>
            <a
              href={FOOTER_NEXUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:underline"
            >
              nexusglobalsuministros.com →
            </a>
          </article>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Un panel para cada rol
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Residentes, guardias y administracion trabajan en la misma plataforma, cada uno con su vista optimizada.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                label: "Residente",
                desc: "Crea invitaciones QR, reserva zonas comunes, recibe push de llegada y delivery, ve comunicados y gestiona su perfil.",
                accent: "from-blue-500 to-indigo-600",
                icon: <IconHome />,
              },
              {
                label: "Guardia",
                desc: "Escanea QR en la entrada, captura evidencia de ID y placa, notifica al residente y registra el ingreso en tiempo real.",
                accent: "from-emerald-500 to-teal-600",
                icon: <IconShield />,
              },
              {
                label: "Administracion",
                desc: "Gestiona usuarios, bloquea zonas, envia comunicados masivos, descarga reportes PDF y administra configuracion del residencial.",
                accent: "from-violet-500 to-purple-600",
                icon: <IconSettings />,
              },
            ].map((card) => (
              <article
                key={card.label}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/40"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${card.accent} opacity-20 blur-2xl transition group-hover:opacity-35`}
                  aria-hidden
                />
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-md`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{card.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 md:text-4xl">
          Como funciona
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          {[
            ["1", "Residente crea la invitacion", "Genera un QR con vigencia definida y lo comparte por WhatsApp o PDF."],
            ["2", "Guardia valida en la entrada", "Escanea el QR, registra evidencia de ID y placa cuando aplica."],
            ["3", "Sistema notifica y registra", "Push inmediato al residente e historial auditable para administracion."],
            ["4", "Gestion y reportes", "Admin controla zonas, bloqueos y descarga reportes mensuales PDF."],
          ].map(([step, title, desc]) => (
            <div key={step} className="relative text-center md:text-left">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/30 md:mx-0">
                {step}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 md:text-4xl">
            Construido para la operacion real
          </h2>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4">
            {TRUST_ITEMS.map((text) => (
              <li key={text} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <IconCheck />
                </span>
                <p className="text-sm leading-relaxed text-slate-700">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 px-4 py-16 text-center text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            ¿Tu residencial con {PARTNER_NAME}?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Usa la tecnologia de{" "}
            <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-300 hover:underline">
              {PRODUCT_ENGINE_NAME}.app
            </a>
            {" "}operada localmente por {PARTNER_NAME}.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-blue-800 shadow-xl hover:bg-blue-50 sm:w-auto"
            >
              Solicitar informacion
            </a>
            <a
              href={PRODUCT_ENGINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-white/70 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 sm:w-auto"
            >
              Conocer MiVisita.app →
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contacto" className="scroll-mt-24 bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              Ponerse en contacto
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Dejanos tus datos y el equipo de {PARTNER_NAME} o {PRODUCT_ENGINE_NAME} te contactara a la brevedad.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
              <LandingLeadForm />
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Motor de la plataforma</p>
                <h3 className="mt-2 text-lg font-bold text-blue-950">Conoce MiVisita.app</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
                  La plataforma que potencia esta instancia. Visita{" "}
                  <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">
                    mivisita.app
                  </a>
                  {" "}para conocer todas las capacidades del motor y otras instancias disponibles.
                </p>
                <a
                  href={PRODUCT_ENGINE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-3.5 text-base font-bold text-white shadow-lg hover:bg-blue-600"
                >
                  Ir a MiVisita.app →
                </a>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 md:p-8">
                <p className="font-semibold text-slate-900">Nota importante</p>
                <p className="mt-2 leading-relaxed">
                  El alta de usuarios y residenciales la gestiona directamente el equipo de {PARTNER_NAME} o el super administrador de la plataforma. Completa el formulario para iniciar la conversacion.
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  Desarrollado por{" "}
                  <a href={FOOTER_NEXUS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 hover:underline">
                    {FOOTER_NEXUS_LABEL}
                  </a>
                  {" · "}
                  Motor{" "}
                  <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 hover:underline">
                    {PRODUCT_ENGINE_NAME}.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM BAR ──────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-slate-900">{APP_DISPLAY_NAME}</p>
            <p className="mt-1 text-sm text-slate-500">
              Operado por{" "}
              <span className="font-semibold text-slate-700">{PARTNER_NAME}</span>
              {" · "}Motor{" "}
              <a href={PRODUCT_ENGINE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                MiVisita.app
              </a>
              {" · "}
              <a href={FOOTER_NEXUS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:underline">
                {FOOTER_NEXUS_LABEL}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?install=1"
              className="rounded-2xl border border-slate-300 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              Instalar app
            </Link>
            <Link href="/login" className="btn-primary px-6 py-3 text-sm">
              Iniciar sesion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
