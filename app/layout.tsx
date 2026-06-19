import type { Metadata, Viewport } from "next";
import { Anton, Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/app/components/ServiceWorkerRegistration";

/* ── Sistema tipográfico profesional ──────────────────────────────
   Anton          → impacto / titulares gigantes / wordmark
   Oswald         → atlética condensada: secciones, nav, etiquetas, botones
   Inter          → texto de lectura (cuerpo)
   JetBrains Mono → cifras y estadísticas (ranking, récord, countdown)
------------------------------------------------------------------ */
const anton = Anton({
  variable: "--font-impact",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://piladerap.vercel.app"),
  title: {
    default: "Pila de Ra' | Freestyle en RD",
    template: "%s | Pila de Ra'",
  },
  description: "Liga de freestyle en República Dominicana. Barras, flow y competencia real.",
  openGraph: {
    title: "Pila de Ra'",
    description: "La plaza sigue viva. Freestyle, barras y competencia real en RD.",
    url: "https://piladerap.vercel.app",
    siteName: "Pila de Ra'",
    images: [{ url: "https://piladerap.vercel.app/api/og", width: 1200, height: 630, alt: "Pila de Ra'" }],
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pila de Ra'",
    description: "Liga de freestyle en República Dominicana. Barras, flow y competencia real.",
    images: ["https://piladerap.vercel.app/api/og"],
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pila de Ra'" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${anton.variable} ${oswald.variable} ${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
