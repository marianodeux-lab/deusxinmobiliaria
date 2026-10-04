"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Play,
  Receipt,
  LineChart,
  MessageCircle,
  Building,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingHeroProps {
  onOpenRegistro: () => void;
}

export function LandingHero({ onOpenRegistro }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#F4FBF9] via-white to-slate-50">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-[#B2DFDB]/40 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tagline */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] border border-[#80CBC4] text-[#004d40] text-xs font-bold shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            La Plataforma PropTech Nº 1 para Inmobiliarias Argentinas post-DNU 70/2023
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mt-6 max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            El ERP que automatiza{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004d40] via-[#00796b] to-emerald-600">
              cobranzas, indexación y liquidaciones
            </span>{" "}
            a dueños sin errores.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Diseñado exclusivamente para martilleros y corredores inmobiliarios. Cobrá con{" "}
            <strong className="text-slate-900 font-bold">Recibo X AFIP (RG 4004-E)</strong>, actualizá cánones con{" "}
            <strong className="text-slate-900 font-bold">ICL e IPC en 1 clic</strong>, liquidá a propietarios reteniendo tus honorarios y enviá todo por WhatsApp.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={onOpenRegistro}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#004d40] hover:bg-[#00382e] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Comenzar Prueba Gratis (14 Días)
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/contratos"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            Ingreso Diario al Sistema
          </Link>
        </div>

        {/* Trust Points */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Sin tarjeta de crédito
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Migración asistida desde Excel / SPOT
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            100% Homologado AFIP / ARCA
          </div>
        </div>

        {/* Hero Visual Showcase */}
        <div className="mt-12 relative max-w-5xl mx-auto">
          {/* Main Mockup Box */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/20 shadow-2xl bg-slate-900 group">
            <img
              src="/landing_hero.jpg"
              alt="DeusX Inmobiliarias ERP Dashboard"
              className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* Floating Live Badge 1: Cobranza Recibo X */}
            <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-teal-100 shadow-xl">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 block">
                  Cobranza Exitosa
                </span>
                <span className="font-mono font-extrabold text-xs text-slate-900">
                  $550.000 · Recibo X AFIP
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Enviado por WhatsApp al inquilino
                </span>
              </div>
            </div>

            {/* Floating Live Badge 2: Indexación ICL */}
            <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-teal-100 shadow-xl">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-[#004d40] flex items-center justify-center">
                <LineChart className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-extrabold text-[#004d40] block">
                  Ajuste ICL Trimestral
                </span>
                <span className="font-mono font-extrabold text-xs text-slate-900">
                  +47.6% Calculado en 1 Clic
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Sincronizado con serie oficial BCRA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof / Stats Strip */}
        <div className="mt-14 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">+4.500</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Contratos de locación gestionados
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#004d40] font-mono">99.8%</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Efectividad en cobranza y control de mora
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono">100%</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Cumplimiento fiscal AFIP RG 4004-E
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 font-mono">1 Clic</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Para liquidar honorarios y enviar WhatsApp
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
