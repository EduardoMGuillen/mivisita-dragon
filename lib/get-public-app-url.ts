/** Origen público de la app (sin barra final). Usado en SEO, sitemap y JSON-LD. */
export function getPublicAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const value = raw || "https://controldragon.vercel.app";
  // Garantiza que siempre tenga esquema para que `new URL()` no falle
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/$/, "");
}
