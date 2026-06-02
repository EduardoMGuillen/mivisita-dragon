import Link from "next/link";
import {
  APP_DISPLAY_NAME,
  FOOTER_MIVISITA_LABEL,
  FOOTER_NEXUS_LABEL,
  FOOTER_NEXUS_URL,
  PARTNER_NAME,
  PRODUCT_ENGINE_NAME,
  PRODUCT_ENGINE_URL,
  whiteLabelAttribution,
} from "@/lib/branding";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/70 px-4 py-5 text-center text-sm text-slate-600 backdrop-blur">
      <p className="font-medium text-slate-800">{APP_DISPLAY_NAME}</p>
      <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
        {whiteLabelAttribution()}
      </p>
      <p className="mt-3 text-xs text-slate-500">
        Operación local: <span className="font-semibold text-slate-700">{PARTNER_NAME}</span>
        {" · "}
        Motor:{" "}
        <a
          href={PRODUCT_ENGINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-700 hover:underline"
        >
          {PRODUCT_ENGINE_NAME}
        </a>
      </p>
      <p className="mt-3">
        Powered by{" "}
        <a
          href={FOOTER_NEXUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-900 transition hover:text-blue-700 hover:underline"
        >
          {FOOTER_NEXUS_LABEL}
        </a>
        {" · "}
        <a
          href={PRODUCT_ENGINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-900 transition hover:text-blue-700 hover:underline"
        >
          {FOOTER_MIVISITA_LABEL}
        </a>
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
        <Link href="/politicas-de-privacidad" className="text-slate-700 transition hover:text-blue-700 hover:underline">
          Politicas de Privacidad
        </Link>
        <span className="text-slate-400">|</span>
        <Link href="/terminos-de-uso" className="text-slate-700 transition hover:text-blue-700 hover:underline">
          Terminos de Uso
        </Link>
      </div>
    </footer>
  );
}
