"use client";

import React, { useState } from "react";
import { Calculator, Clock, DollarSign, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

interface LandingRoiCalculatorProps {
  onOpenRegistro: () => void;
}

export function LandingRoiCalculator({ onOpenRegistro }: LandingRoiCalculatorProps) {
  const [contratos, setContratos] = useState(60);
  const [alquilerPromedio, setAlquilerPromedio] = useState(380000);

  // Cálculos dinámicos
  const horasAhorradasMes = Math.round((contratos * 25) / 60); // 25 min ahorrados por contrato/mes
  const comisionAdministracionMes = Math.round(contratos * alquilerPromedio * 0.05); // 5% honorarios
  const ingresoExtraVidrieraMes = Math.round(contratos * 0.1 * 45000); // 10% renueva fianza/servicios al año (~$45k comisión)
  const costoPlanSugerido = contratos <= 30 ? 39000 : contratos <= 150 ? 79000 : 149000;
  const beneficioNetoMensual = ingresoExtraVidrieraMes + Math.round(horasAhorradasMes * 12000) - costoPlanSugerido;

  return (
    <section className="py-20 bg-gradient-to-b from-white via-[#F4FBF9] to-slate-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#004d40] text-xs font-bold border border-[#80CBC4]">
            <Calculator className="w-3.5 h-3.5 text-teal-700" />
            Calculadora de Impacto & Retorno (ROI)
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Descubrí cuánto tiempo y dinero ahorrás con DeusX
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Mové los controles según la realidad de tu inmobiliaria y mirá el impacto directo en tu rentabilidad mensual.
          </p>
        </div>

        {/* Card Principal de la Calculadora */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Columna Izquierda: Sliders interactivos */}
          <div className="lg:col-span-6 space-y-6">
            {/* Slider 1: Contratos */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Contratos de Alquiler en Administración
                </label>
                <span className="text-base font-black text-[#004d40] font-mono bg-[#E0F2F1] px-3 py-0.5 rounded-lg border border-[#80CBC4]">
                  {contratos} contratos
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={contratos}
                onChange={(e) => setContratos(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004d40]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10</span>
                <span>75</span>
                <span>150</span>
                <span>300+</span>
              </div>
            </div>

            {/* Slider 2: Canon Promedio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Alquiler Promedio por Inmueble
                </label>
                <span className="text-base font-black text-[#004d40] font-mono bg-[#E0F2F1] px-3 py-0.5 rounded-lg border border-[#80CBC4]">
                  ${alquilerPromedio.toLocaleString("es-AR")}
                </span>
              </div>
              <input
                type="range"
                min="150000"
                max="1200000"
                step="25000"
                value={alquilerPromedio}
                onChange={(e) => setAlquilerPromedio(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004d40]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$150.000</span>
                <span>$500.000</span>
                <span>$850.000</span>
                <span>$1.200.000+</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-medium">Honorarios de administración (5% estimado):</span>
                <span className="font-bold text-slate-900 font-mono">
                  ${comisionAdministracionMes.toLocaleString("es-AR")}/mes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Plan DeusX sugerido para tu cartera:</span>
                <span className="font-bold text-[#004d40]">
                  {contratos <= 30 ? "Starter ($39.000)" : contratos <= 150 ? "Inmobiliaria Pro ($79.000)" : "Corporativo ($149.000)"}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Métricas de Resultados */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#00332c] via-[#004d40] to-[#004d40] rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Retorno Estimado para tu Inmobiliaria
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30">
                  ROI +800%
                </span>
              </div>

              {/* Métrica 1: Horas ahorradas */}
              <div className="flex items-center gap-3.5 bg-white/10 p-3.5 rounded-xl border border-white/10 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black font-mono text-white">
                    {horasAhorradasMes} horas al mes
                  </span>
                  <p className="text-[11px] text-teal-100">
                    Ahorradas en emisión de Recibo X, cálculo de ICL y liquidaciones a dueños.
                  </p>
                </div>
              </div>

              {/* Métrica 2: Ingresos extra por Vidriera B2B */}
              <div className="flex items-center gap-3.5 bg-white/10 p-3.5 rounded-xl border border-white/10 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black font-mono text-white">
                    +${ingresoExtraVidrieraMes.toLocaleString("es-AR")}/mes
                  </span>
                  <p className="text-[11px] text-teal-100">
                    Generados en comisiones pasivas por derivación a garantías de fianza y escribanías.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Directo desde la calculadora */}
            <div className="pt-2">
              <button
                onClick={onOpenRegistro}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-xs shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Comenzar a Ahorrar con Prueba Gratis (14 Días)
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[10px] text-teal-200 mt-2">
                Sin costo de alta • Migración de tus contratos desde Excel incluida
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
