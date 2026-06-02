import type { Metadata } from "next";
import { LandingMarketing } from "@/app/components/landing-marketing";
import { StandaloneLoginRedirect } from "@/app/components/standalone-login-redirect";
import {
  APP_DISPLAY_NAME,
  LOGO_PARTNER,
  PARTNER_NAME,
  PRODUCT_ENGINE_NAME,
  PRODUCT_ENGINE_URL,
} from "@/lib/branding";
import { getPublicAppUrl } from "@/lib/get-public-app-url";

const APP_URL = getPublicAppUrl();

export const metadata: Metadata = {
  title: `${APP_DISPLAY_NAME} | Control de acceso residencial`,
  description: `${PARTNER_NAME} opera la seguridad residencial sobre la plataforma ${PRODUCT_ENGINE_NAME}. QR, reservas, push y reportes — colaboracion white label.`,
  keywords: [
    APP_DISPLAY_NAME,
    PARTNER_NAME,
    PRODUCT_ENGINE_NAME,
    "control de acceso residencial",
    "porteria digital Honduras",
    "seguridad residencial",
    "app residencial QR",
    "visitas QR",
    "reservas zonas comunes",
    "notificaciones push residencial",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: `${APP_DISPLAY_NAME} | Seguridad y control de visitas`,
    description: `${PARTNER_NAME} × ${PRODUCT_ENGINE_NAME} — plataforma white label para control de acceso residencial con QR, push y reportes.`,
    siteName: APP_DISPLAY_NAME,
    images: [{ url: LOGO_PARTNER, width: 512, height: 512, alt: APP_DISPLAY_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_DISPLAY_NAME} | Control de acceso residencial`,
    description: `${PARTNER_NAME} × ${PRODUCT_ENGINE_NAME} — white label para residenciales.`,
    images: [LOGO_PARTNER],
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        name: APP_DISPLAY_NAME,
        url: APP_URL,
        inLanguage: "es-HN",
        description: `${PARTNER_NAME} opera sobre la plataforma ${PRODUCT_ENGINE_NAME}.`,
      },
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: APP_DISPLAY_NAME,
        url: APP_URL,
        logo: `${APP_URL}${LOGO_PARTNER}`,
        sameAs: [PRODUCT_ENGINE_URL],
      },
      {
        "@type": "SoftwareApplication",
        name: APP_DISPLAY_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Android, iOS",
        description: `Control de acceso residencial — ${PARTNER_NAME} sobre ${PRODUCT_ENGINE_NAME}.`,
        url: APP_URL,
        downloadUrl: APP_URL,
        publisher: { "@id": `${APP_URL}/#organization` },
        featureList: [
          "Invitaciones QR con vigencia y control de usos",
          "Evidencia de identificacion y placa vehicular",
          "Reservas de zonas comunes y bloqueos administrativos",
          "Notificaciones push a residentes y administracion",
          "Reportes PDF mensuales y backup completo",
        ],
      },
    ],
  };

  return (
    <>
      <StandaloneLoginRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingMarketing />
    </>
  );
}
