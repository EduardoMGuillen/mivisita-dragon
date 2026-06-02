import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaBootstrap } from "@/app/components/pwa-bootstrap";
import { GlobalSiteBanner } from "@/app/components/global-site-banner";
import { SiteFooter } from "@/app/components/site-footer";
import { getActiveSiteBanner } from "@/lib/site-banner";
import { getPublicAppUrl } from "@/lib/get-public-app-url";
import { APP_DISPLAY_NAME, LOGO_PARTNER } from "@/lib/branding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: APP_DISPLAY_NAME,
  applicationName: APP_DISPLAY_NAME,
  description:
    "Control de visitas residenciales con QR. Plataforma MiVisita en colaboracion white label con Dragon Seguridad.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_DISPLAY_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: LOGO_PARTNER, sizes: "192x192", type: "image/jpeg" },
      { url: LOGO_PARTNER, sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: LOGO_PARTNER, sizes: "180x180", type: "image/jpeg" }],
    shortcut: [LOGO_PARTNER],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1d4ed8",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteBanner = await getActiveSiteBanner();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PwaBootstrap />
        <div className="flex min-h-screen flex-col">
          {siteBanner ? (
            <GlobalSiteBanner message={siteBanner.message} variant={siteBanner.variant} />
          ) : null}
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
