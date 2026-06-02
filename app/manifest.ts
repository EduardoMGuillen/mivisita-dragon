import type { MetadataRoute } from "next";
import { APP_DISPLAY_NAME, APP_SHORT_NAME, LOGO_PARTNER } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_SHORT_NAME,
    description: "Control de visitas residenciales con QR. MiVisita + Dragon Seguridad.",
    start_url: "/login",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: LOGO_PARTNER,
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: LOGO_PARTNER,
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: LOGO_PARTNER,
        sizes: "1024x1024",
        type: "image/jpeg",
      },
    ],
  };
}
