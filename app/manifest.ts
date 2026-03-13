import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Control Dragon",
    short_name: "Control Dragon",
    description: "Control de visitas y accesos residenciales con QR.",
    start_url: "/login",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/dragonlogo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/dragonlogo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/dragonlogo.jpg",
        sizes: "1024x1024",
        type: "image/jpeg",
      },
    ],
  };
}
