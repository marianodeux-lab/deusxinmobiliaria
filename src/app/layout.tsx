import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNavProvider } from "@/context/MobileNavContext";
import { PwaProvider } from "@/context/PwaContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#004D40",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "DeusX Inmobiliarias | ERP SaaS PropTech",
  description: "Plataforma integral de gestión de alquileres, cobranzas, liquidaciones y contratos inmobiliarios.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DeusX Inmobiliarias",
  },
  icons: {
    icon: [
      { url: "/Recursos/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/Recursos/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/Recursos/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <MobileNavProvider>
          <PwaProvider>{children}</PwaProvider>
        </MobileNavProvider>
      </body>
    </html>
  );
}

