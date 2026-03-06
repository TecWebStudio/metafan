import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MetaFan — Innovazione Elettronica di Precisione",
  description:
    "MetaFan è un'azienda manifatturiera leader nella produzione di schede elettroniche, dispositivi IoT, prototipazione 3D e sistemi AR/VR per l'industria.",
  keywords:
    "schede elettroniche, IoT, stampa 3D, realtà aumentata, firmware, manifattura",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
