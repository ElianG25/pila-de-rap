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

export const metadata = {
  title: {
    default: "Pila de Ra'",
    template: "%s | Pila de Ra'",
  },
  description:
    "Eventos de freestyle en República Dominicana. Barras, flow y competencia real.",
  openGraph: {
    title: "Pila de Ra'",
    description:
      "Competencias de freestyle y cultura urbana en RD.",
    url: "https://pila-de-rap.vercel.app",
    siteName: "Pila de Ra'",
    images: [
      {
        url: "/icon.png", // usa tu logo
        width: 512,
        height: 512,
      },
    ],
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pila de Ra'",
    description:
      "Eventos de freestyle en RD. Próximo evento: 30 de mayo.",
    images: ["/icon.ico"],
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
