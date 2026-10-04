"use client";

import React, { useState } from "react";
import { Check, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPricingProps {
  onOpenRegistro: () => void;
}

export function LandingPricing({ onOpenRegistro }: LandingPricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      badge: "Ideal Martilleros Independientes",
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-300",
      description: "Para profesionales y oficinas que inician la digitalización de su cartera de alquileres.",
      monthlyPrice: 39000,
      annualPrice: 31200, // 20% OFF
      isPopular: false,
      features: [
        "Hasta 30 contratos de alquiler activos",
        "Emisión legal de Recibo X (AFIP RG 4004-E)",
        "Indexación automática con ICL, IPC y Casa Propia",
        "Control de cobros en efectivo y transferencias",
        "Libro diario de caja",
        "1 usuario administrador",
        "Soporte técnico por WhatsApp",
      ],
      ctaText: "Iniciar Prueba de 14 Días",
    },
    {
      id: "pro",
      name: "Inmobiliaria Pro",
      badge: "Más Elegido por Inmobiliarias",
      badgeStyle: "bg-[#004d40] text-white border-[#004d40]",
      description: "Para inmobiliarias activas que necesitan automatizar liquidaciones a dueños y red de colegas.",
      monthlyPrice: 79000,
      annualPrice: 63200, // 20% OFF
      isPopular: true,
      features: [
        "Hasta 150 contratos de alquiler activos",
        "Todo lo del Plan Starter",
        "Liquidaciones automáticas a propietarios con retención",
        "Red MLS B2B (Comisión 50/50 con colegas)",
        "Módulo de Mantenimiento & Gremios matriculados",
        "Consorcios & Expensas (hasta 3 edificios)",
        "Hasta 5 asesores con permisos diferenciados",
        "Migración asistida de datos desde Excel / SPOT sin cargo",
        "Soporte prioritario directo con ejecutivos",
      ],
      ctaText: "Comenzar Prueba Pro Gratis",
    },
    {
      id: "enterprise",
      name: "Corporativo & Redes",
      badge: "Grandes Administraciones",
      badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
      description: "Para inmobiliarias líderes, administradoras de consorcios y redes con múltiples sucursales.",
      monthlyPrice: 149000,
      annualPrice: 119200, // 20% OFF
      isPopular: false,
      features: [
        "Contratos y propiedades ilimitadas",
        "Todo lo del Plan Inmobiliaria Pro",
        "Multi-sucursal y multi-empresa unificada",
        "Módulo Alquileres Temporarios en USD y ARS",
        "Módulo Consorcios & Expensas ilimitado",
        "Condiciones preferenciales en la Vidriera de Proveedores B2B",
        "Usuarios y roles ilimitados",
        "Onboarding personalizado 1 a 1 y capacitación a todo el equipo",
        "SLA garantizado y backup dedicado",
      ],
      ctaText: "Contactar a un Asesor",
    },
  ];

  return (
    <section id="precios" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#004d40] text-xs font-bold border border-[#80CBC4]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Precios Claros en Pesos Argentinos
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Invertí en tiempo, tranquilidad y cero errores de caja
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Sin costos ocultos ni comisiones sobre tus cobranzas. Factura A o B emitida mensualmente y deducible de impuestos.
          </p>

          {/* Toggle Mensual / Anual */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-xs font-bold cursor-pointer transition-colors",
                billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"
              )}
              onClick={() => setBillingCycle("monthly")}
            >
              Facturación Mensual
            </span>
            <button
              onClick={() =>
                setBillingCycle((prev) => (prev === "monthly" ? "annual" : "monthly"))
              }
              className="relative w-12 h-6 rounded-full bg-slate-200 transition-colors focus:outline-none p-0.5"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-[#004d40] shadow-sm transform transition-transform",
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
            <span
              className={cn(
                "text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5",
                billingCycle === "annual" ? "text-[#004d40]" : "text-slate-400"
              )}
              onClick={() => setBillingCycle("annual")}
            >
              Pago Anual
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                20% OFF
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const currentPrice =
              billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative",
                  plan.isPopular
                    ? "bg-white border-2 border-[#004d40] shadow-xl scale-[1.02] lg:-translate-y-2 z-10"
                    : "bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
                )}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#004d40] text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Opción Más Elegida
                  </div>
                )}

                <div>
                  {/* Top Details */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    <span
                      className={cn(
                        "text-[10px] font-extrabold px-2.5 py-1 rounded-full border",
                        plan.badgeStyle
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-5 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                        ${currentPrice.toLocaleString("es-AR")}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        + IVA / mes
                      </span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">
                        Facturado anualmente (Ahorro de $
                        {((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString("es-AR")} al año)
                      </p>
                    )}
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Qué incluye:
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={onOpenRegistro}
                  className={cn(
                    "w-full py-3.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2",
                    plan.isPopular
                      ? "bg-[#004d40] hover:bg-[#00382e] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  )}
                >
                  {plan.ctaText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Guarantee strip */}
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#004d40]" />
            Prueba gratis de 14 días sin ingresar datos bancarios
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#004d40]" />
            Cancelación en cualquier momento con un clic
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#004d40]" />
            Tus datos siempre te pertenecen (Exportación a Excel / CSV)
          </div>
        </div>
      </div>
    </section>
  );
}
