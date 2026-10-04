"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  Camera,
  Wrench,
  FileCheck,
  Truck,
  Building,
  Star,
  ArrowRight,
  Send,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingB2BMarketplaceProps {
  onOpenRegistro: () => void;
  onOpenProveedorModal?: () => void;
}

export function LandingB2BMarketplace({
  onOpenRegistro,
  onOpenProveedorModal,
}: LandingB2BMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  const categories = [
    { id: "todas", label: "Todos los Proveedores" },
    { id: "garantias", label: "Garantías de Fianza" },
    { id: "escribanias", label: "Escribanías & Notarial" },
    { id: "gremios", label: "Gremios & Reparaciones" },
    { id: "fotografia", label: "Foto 360 & Dron" },
    { id: "mudanzas", label: "Mudanzas & Fletes" },
  ];

  const providers = [
    {
      id: "finaer",
      category: "garantias",
      name: "Finaer Garantías",
      tagline: "Garantía de fianza número 1 de Argentina",
      rating: 4.9,
      reviewsCount: 380,
      badge: "Partner Oficial",
      description:
        "Calificación crediticia en 2 horas. Cobertura integral de canon locativo, expensas, impuestos y honorarios legales ante cualquier incumplimiento.",
      offer: "15% de comisión para la inmobiliaria en cada póliza emitida",
      coverage: "Nacional (CABA, GBA e Interior)",
      contactAction: "Solicitar Fianza",
    },
    {
      id: "garantor",
      category: "garantias",
      name: "Garantor Seguros",
      tagline: "Seguros de caución para alquileres comerciales y residenciales",
      rating: 4.8,
      reviewsCount: 210,
      badge: "Verificado",
      description:
        "Fianza exprés con recibo de sueldo o monotributo. Aprobación 100% online y firma electrónica homologada para contratos inmediatos.",
      offer: "Bonificación en el primer mes para nuevos inquilinos",
      coverage: "CABA y Provincia de Buenos Aires",
      contactAction: "Cotizar en 2 Minutos",
    },
    {
      id: "escribania-martinez",
      category: "escribanias",
      name: "Estudio Notarial Martínez & Asoc.",
      tagline: "Certificación de firmas a domicilio y boletos de compraventa",
      rating: 4.9,
      reviewsCount: 145,
      badge: "Colegiado",
      description:
        "Escribanía con guardia activa para firmas de contratos de locación, poderes especiales, informes de inhibición y cesiones de derechos en 24hs hábiles.",
      offer: "Tarifas preferenciales para inmobiliarias adheridas a DeusX",
      coverage: "CABA y Zona Norte GBA",
      contactAction: "Coordinar Firma",
    },
    {
      id: "gremios-pro",
      category: "gremios",
      name: "Servicios Técnicos Integrales",
      tagline: "Gasistas y Electricistas matriculados para entregas y urgencias",
      rating: 4.8,
      reviewsCount: 290,
      badge: "Matrícula Verificada",
      description:
        "Inspección de artefactos a gas, pruebas de hermeticidad con formulario oficial Metrogas/Naturgy, informes de puesta a tierra y reparaciones de urgencia 24hs.",
      offer: "Facturación A y B con informe fotográfico para propietarios",
      coverage: "CABA, Zona Oeste y Zona Norte",
      contactAction: "Pedir Presupuesto",
    },
    {
      id: "matterport-studio",
      category: "fotografia",
      name: "360 Real Estate Media",
      tagline: "Tours virtuales 3D Matterport, video con dron y planos 2D",
      rating: 5.0,
      reviewsCount: 175,
      badge: "Recomendado",
      description:
        "Elevá el impacto visual de tus propiedades en portales. Pack completo de fotografía profesional HDR, recorrido interactivo y video para reels de Instagram.",
      offer: "20% OFF en el primer pack de 3 propiedades",
      coverage: "AMBA y principales capitales del país",
      contactAction: "Ver Portfolio",
    },
    {
      id: "express-mudanzas",
      category: "mudanzas",
      name: "TransLog Mudanzas Premium",
      tagline: "Traslados urbanos y guardamuebles con seguro de carga",
      rating: 4.7,
      reviewsCount: 160,
      badge: "Partner Exclusivo",
      description:
        "Flota con seguimiento satelital, embalaje especializado de vajilla y mobiliario, y personal de estiba calificado. Descuento directo para inquilinos DeusX.",
      offer: "10% de descuento automático presentando contrato DeusX",
      coverage: "Todo el país y traslados interurbanos",
      contactAction: "Cotizar Mudanza",
    },
  ];

  const filteredProviders =
    selectedCategory === "todas"
      ? providers
      : providers.filter((p) => p.category === selectedCategory);

  return (
    <section id="proveedores" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#E0F2F1]/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B2DFDB]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#004d40] text-xs font-bold border border-[#80CBC4]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            Ecosistema de Confianza
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Vidriera de Proveedores Verificados para Inmobiliarias
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Una plataforma de servicios y beneficios comerciales integrada al ERP. Accedé a garantías de caución, escribanías, gremios matriculados y fotógrafos con tarifas corporativas exclusivas para usuarios de DeusX.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
                selectedCategory === cat.id
                  ? "bg-[#004d40] text-white border-[#004d40] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Providers Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#80CBC4] hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#004d40] transition-colors">
                      {provider.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                      {provider.tagline}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                    {provider.badge}
                  </span>
                </div>

                {/* Rating & Location */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{provider.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({provider.reviewsCount})
                    </span>
                  </div>
                  <span>•</span>
                  <span className="text-[11px] font-medium text-slate-600 truncate">
                    {provider.coverage}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {provider.description}
                </p>

                {/* Benefit / Special Offer */}
                <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 flex items-start gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#00796b] shrink-0 mt-0.5" />
                  <span className="text-[11px] font-bold text-[#004d40] leading-tight">
                    {provider.offer}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Convenio DeusX
                </span>
                <button
                  onClick={onOpenRegistro}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#004d40] hover:bg-[#E0F2F1] transition-colors flex items-center gap-1.5"
                >
                  {provider.contactAction}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA B2B PARA PROVEEDORES DE INMOBILIARIAS */}
        <div className="mt-14 bg-gradient-to-br from-slate-900 via-slate-800 to-[#00332c] rounded-2xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-[#80CBC4] text-xs font-bold border border-teal-500/30">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Oportunidad Comercial para Empresas del Sector
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                ¿Ofrecés servicios a inmobiliarias, propietarios o inquilinos?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sumate a la <strong>Vidriera B2B de DeusX</strong> y promocioná tus servicios de forma directa frente a más de <strong>450 inmobiliarias activas</strong> y miles de contratos en administración diaria en todo el país.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-teal-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Presencia directa en el ERP diario
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Campañas segmentadas por localidad
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Leads calificados en tiempo real
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              <button
                onClick={onOpenRegistro}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                Postular mi Empresa como Proveedor
              </button>

              <a
                href="https://wa.me/5491100000000?text=Hola,%20quisiera%20anunciar%20mi%20empresa%20en%20la%20vidriera%20de%20proveedores%20de%20DeusX%20Inmobiliarias"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 text-center"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Hablar con Gerencia Comercial
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
