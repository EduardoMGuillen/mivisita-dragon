/** Identidad white-label: MiVisita (motor) + Dragon Seguridad (operación local). */

export const APP_DISPLAY_NAME = "MiVisita - Dragon Seguridad";
export const APP_SHORT_NAME = "MiVisita Dragon";
export const PRODUCT_ENGINE_NAME = "MiVisita";
export const PRODUCT_ENGINE_URL = "https://mivisita.app";
export const PARTNER_NAME = "Dragon Seguridad";
export const PARTNER_TAGLINE = "Colaboración white label";

/** Logo completo (PDF, OG). */
export const LOGO_MIVISITA = "/logomivisita.png";
/** Logo liviano para UI web (evita PNG de varios MB en landing). */
export const LOGO_MIVISITA_UI = "/icon-192.png";
export const LOGO_PARTNER = "/dragonlogo.jpg";

export const FOOTER_MIVISITA_LABEL = "MiVisita.app";
export const FOOTER_NEXUS_URL = "https://www.nexusglobalsuministros.com/";
export const FOOTER_NEXUS_LABEL = "Nexus Global";

export function whiteLabelAttribution(es = true) {
  if (es) {
    return `${APP_DISPLAY_NAME} funciona sobre la plataforma ${PRODUCT_ENGINE_NAME} (${PRODUCT_ENGINE_URL.replace(/^https?:\/\//, "")}), en colaboración con ${PARTNER_NAME}.`;
  }
  return `${APP_DISPLAY_NAME} runs on ${PRODUCT_ENGINE_NAME} (${PRODUCT_ENGINE_URL}), in collaboration with ${PARTNER_NAME}.`;
}
