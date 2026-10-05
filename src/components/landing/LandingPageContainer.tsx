"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingModulesGrid } from "@/components/landing/LandingModulesGrid";
import { LandingRoiCalculator } from "@/components/landing/LandingRoiCalculator";
import { LandingB2BMarketplace } from "@/components/landing/LandingB2BMarketplace";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { RegistroModal } from "@/components/landing/RegistroModal";
import { LandingWhatsAppFloating } from "@/components/landing/LandingWhatsAppFloating";

export function LandingPageContainer() {
  const router = useRouter();
  const [isRegistroOpen, setIsRegistroOpen] = useState(false);

  const handleOpenRegistro = () => {
    router.push("/registro");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#80CBC4] selection:text-[#004d40]">
      {/* Barra de navegación superior fija con logo y botón de acceso diario */}
      <LandingNavbar onOpenRegistro={handleOpenRegistro} />

      {/* Hero Principal de Ventas */}
      <LandingHero onOpenRegistro={handleOpenRegistro} />

      {/* Grid Interactivo de Módulos ERP */}
      <LandingModulesGrid onOpenRegistro={handleOpenRegistro} />

      {/* Calculadora Interactiva de ROI & Ahorro Operativo */}
      <LandingRoiCalculator onOpenRegistro={handleOpenRegistro} />

      {/* Vidriera B2B de Proveedores para Inmobiliarias & Usuarios Activos */}
      <LandingB2BMarketplace
        onOpenRegistro={handleOpenRegistro}
      />

      {/* Testimonios & Prueba Social de Inmobiliarias Matriculadas */}
      <LandingTestimonials />

      {/* Precios & Planes Comerciales */}
      <LandingPricing onOpenRegistro={handleOpenRegistro} />

      {/* Preguntas Frecuentes Normativas & Operativas */}
      <LandingFaq />

      {/* Footer Integral con accesos y enlaces comerciales */}
      <LandingFooter onOpenRegistro={handleOpenRegistro} />

      {/* Botón flotante de WhatsApp para tráfico de anuncios */}
      <LandingWhatsAppFloating />

      {/* Modal de Captura de Leads / Prueba 14 Días */}
      <RegistroModal
        isOpen={isRegistroOpen}
        onClose={() => setIsRegistroOpen(false)}
      />
    </div>
  );
}
