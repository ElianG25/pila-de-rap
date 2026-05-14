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
    default: "Pila de Rap | Freestyle RD",
    template: "%s | Pila de Rap",
  },

  description:
    "Eventos de plaza de freestyle en República Dominicana. Barras, flow y competencia real.",

  openGraph: {
    title: "Pila de Rap",
    description: "La plaza sigue viva. Freestyle, barras y competencia real en RD.",
    url: "https://pila-de-rap.vercel.app",
    siteName: "Pila de Rap",
    images: [
      {
        url: "https://pila-de-rap.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "Roster revelado de Pila de Rap",
      },
    ],
    locale: "es_DO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pila de Rap",
    description:
      "Eventos de freestyle en RD. Próximo evento: 30 de mayo a las 3:00 PM.",
    images: ["https://pila-de-rap.vercel.app/api/og"],
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
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
