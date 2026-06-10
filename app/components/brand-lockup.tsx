import Image from "next/image";
import {
  APP_DISPLAY_NAME,
  LOGO_MIVISITA_UI,
  LOGO_PARTNER,
  PARTNER_NAME,
  PRODUCT_ENGINE_NAME,
  PRODUCT_ENGINE_URL,
} from "@/lib/branding";

type BrandLockupProps = {
  compact?: boolean;
  showEngineNote?: boolean;
};

export function BrandLockup({ compact = false, showEngineNote = false }: BrandLockupProps) {
  const logoSize = compact ? 36 : 40;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center -space-x-1">
        <Image
          src={LOGO_MIVISITA_UI}
          alt={PRODUCT_ENGINE_NAME}
          width={logoSize}
          height={logoSize}
          className="rounded-lg border border-slate-200 bg-white"
          priority
          sizes={`${logoSize}px`}
        />
        <Image
          src={LOGO_PARTNER}
          alt={PARTNER_NAME}
          width={logoSize}
          height={logoSize}
          className="rounded-lg border border-slate-200"
          loading="lazy"
          sizes={`${logoSize}px`}
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{APP_DISPLAY_NAME}</p>
        <p className="text-xs text-slate-500">
          {compact ? "Acceso residencial" : "White label · Dragon Seguridad"}
        </p>
        {showEngineNote ? (
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            Motor{" "}
            <a href={PRODUCT_ENGINE_URL} className="font-medium text-blue-700 hover:underline">
              {PRODUCT_ENGINE_NAME}.app
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
