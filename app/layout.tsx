import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pila-de-rap.vercel.app"),

  title: {
    default: "🔋 Pila de Ra' | 🔜",
    template: "%s | Pila de Ra'",
  },

  description:
    "Eventos de plaza de freestyle en República Dominicana. Barras, flow y competencia real.",

  openGraph: {
    title: "🔋 Pila de Ra'",
    description: "¡La plaza sigue viva!",
    url: "https://pila-de-rap.vercel.app",
    siteName: "Pila de Ra'",
    images: [
      {
        url: "https://pila-de-rap.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Pila de Rap - Freestyle en RD",
      },
    ],
    locale: "es_DO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "🔋 Pila de Ra'",
    description:
      "Eventos de freestyle en RD. Próximo evento: 30 de mayo.",
    images: ["https://pila-de-rap.vercel.app/og.png"],
  },

  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
