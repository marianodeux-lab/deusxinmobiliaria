import React from "react";
import type { Metadata } from "next";
import { LandingPageContainer } from "@/components/landing/LandingPageContainer";

export const metadata: Metadata = {
  title: "DeusX Inmobiliarias | ERP PropTech Nº 1 para Inmobiliarias Argentinas",
  description:
    "El software inmobiliario que automatiza cobranzas con Recibo X AFIP (RG 4004-E), indexación ICL/IPC en 1 clic y liquidaciones a propietarios. Red MLS B2B y Vidriera de Proveedores.",
  keywords: [
    "software inmobiliario argentina",
    "erp inmobiliarias",
    "recibo x afip rg 4004-e",
    "calculo icl alquileres",
    "indexacion ipc alquileres dnu 70",
    "liquidaciones a propietarios",
    "red mls argentina 50 50",
    "proptech argentina",
    "administracion de alquileres",
  ],
  openGraph: {
    title: "DeusX Inmobiliarias | ERP PropTech Nº 1 de Argentina",
    description:
      "Automatizá cobranzas, indexación ICL/IPC y liquidaciones a propietarios sin errores. 14 días de prueba gratuita.",
    url: "https://deusx.com.ar",
    siteName: "DeusX Inmobiliarias",
    images: [
      {
        url: "/landing_hero.jpg",
        width: 1200,
        height: 630,
        alt: "DeusX Inmobiliarias ERP Dashboard",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPageContainer />;
}
