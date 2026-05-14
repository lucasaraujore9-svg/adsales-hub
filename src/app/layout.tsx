import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ConfirmProvider } from "@/components/ui/confirm-provider";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";

const SITE_URL = "https://adsaleshub.7iegroup.com.br";
const OG_IMAGE = `${SITE_URL}/brand-assets/png/lockup-horizontal-primary-2x.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AdSales·Hub — Anúncio, lead e venda num sistema só",
    template: "%s · AdSales·Hub",
  },
  description:
    "Plataforma SaaS brasileira que unifica marketing pago, CRM, atendimento, SDR de voz IA e contratos eletrônicos. ROAS aferido na receita real. 14 dias grátis sem cartão.",
  applicationName: "AdSales·Hub",
  keywords: [
    "CRM brasileiro",
    "plataforma de marketing e vendas",
    "tráfego pago com IA",
    "Meta Ads automatizado",
    "SDR de voz com IA",
    "atribuição de marketing",
    "ROAS aferido",
    "alternativa a agência de marketing",
    "alternativa a RD Station",
    "alternativa a Pipedrive",
    "CRM com WhatsApp",
    "automação de marketing PME",
    "SaaS de vendas Brasil",
    "marketing unificado",
    "agente de voz IA",
    "assinatura eletrônica Lei 14.063",
    "landing page builder",
    "Conversions API Meta",
  ],
  authors: [{ name: "7iE Group", url: "https://7iegroup.com.br" }],
  creator: "7iE Group",
  publisher: "7iE Group",
  category: "Business Software",
  alternates: {
    canonical: SITE_URL,
    languages: { "pt-BR": SITE_URL },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AdSales·Hub",
    title: "AdSales·Hub — Anúncio, lead e venda num sistema só",
    description:
      "Substitui agência + gestor de tráfego + 5 ferramentas. Cria campanhas, captura leads, liga com IA de voz, fecha contrato e mostra ROAS aferido na receita real. 14 dias grátis.",
    locale: "pt_BR",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 320,
        alt: "AdSales·Hub — plataforma unificada de marketing e vendas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdSales·Hub — Anúncio, lead e venda num sistema só",
    description:
      "Plataforma brasileira que unifica marketing pago, CRM, atendimento, SDR de voz IA e contratos. ROAS aferido na receita real. 14 dias grátis.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand-assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand-assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand-assets/svg/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand-assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/brand-assets/apple-touch-icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    "msapplication-TileColor": "#FF5A1F",
    "msapplication-config": "none",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E10" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <ConfirmProvider>
            {children}
            <CookieBanner />
            <ServiceWorkerRegister />
            <Toaster position="top-right" richColors closeButton />
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
