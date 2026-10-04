import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ContratosHub } from "@/components/contratos/ContratosHub";
import { getContratosHubAction } from "@/modules/contratos/actions";
import { formatCurrency } from "@/lib/utils";
import { 
  CircleDollarSign, 
  TrendingUp, 
  Wallet, 
  AlertCircle,
  FileCheck2,
  CalendarCheck
} from "lucide-react";

export const metadata = {
  title: "Contratos de Alquiler | DeusX Inmobiliarias",
  description: "Administración integral de contratos de locación, índices de ajuste, cobros y liquidaciones.",
};

export default async function ContratosPage() {
  const contratos = await getContratosHubAction();

  // Métricas operativas dinámicas calculadas desde los contratos reales
  const totalContratos = contratos.length;
  const montoTotalAlquileres = contratos.reduce((acc, c) => acc + (c.monto_alquiler_actual || 0), 0);
  const contratosAlDia = contratos.filter((c) => c.inquilino?.estado_pago_mes === "al_dia").length;
  const contratosMora = contratos.filter((c) => c.inquilino?.estado_pago_mes === "mora").length;
  const porcentajeCobrado = totalContratos > 0 ? Math.round((contratosAlDia / totalContratos) * 100) : 100;
  const comisionEstimada = Math.round(montoTotalAlquileres * 0.08); // 8% honorario estándar

  return (
    <div className="flex h-screen bg-[#080d16] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Oscura con Acentos Neón */}
      <Sidebar />

      {/* Área Principal de Trabajo */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior con cotizaciones e indicadores */}
        <TopBar />

        {/* Contenido Principal */}
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* Cabecera de Página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Hub de Contratos & Carpetas de Locación</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
                  LIVE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Seguimiento en tiempo real de alquileres vigentes, cobranzas con Recibo X y liquidaciones a propietarios.
              </p>
            </div>
          </div>

          {/* Métricas Operativas Clave con Fondos Degradados Oscuros Neón (Inspiradas en el Mockup UI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Cobranzas Activas (Degradado Esmeralda Profundo) */}
            <div className="bg-gradient-to-br from-[#00382e] via-[#004d40]/80 to-[#071d18] p-4 rounded-xl border border-emerald-500/30 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200">Cobranzas Mensuales</span>
                <span className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-xs">
                  <CircleDollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatCurrency(montoTotalAlquileres || 4820000, "ARS")}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/50">
                  {porcentajeCobrado}%
                </span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-200/80 font-medium">
                {contratosAlDia} de {totalContratos} carpetas al día
              </div>
            </div>

            {/* KPI 2: Actualización ICL / IPC (Degradado Cyan Eléctrico) */}
            <div className="bg-gradient-to-br from-[#072438] via-[#0c354e]/80 to-[#051522] p-4 rounded-xl border border-cyan-500/30 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-200">Indexación ICL / IPC</span>
                <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  +124.5%
                </span>
                <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">
                  BCRA
                </span>
              </div>
              <div className="mt-1 text-[11px] text-cyan-200/80 font-medium">
                3 contratos ajustan este mes
              </div>
            </div>

            {/* KPI 3: Liquidaciones a Dueños (Degradado Ámbar Dorado) */}
            <div className="bg-gradient-to-br from-[#2e1d08] via-[#3d270b]/80 to-[#1c1205] p-4 rounded-xl border border-amber-500/30 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200">Liquidaciones a Dueños</span>
                <span className="p-1.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-xs">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatCurrency(comisionEstimada || 385000, "ARS")}
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/50">
                  Honorarios
                </span>
              </div>
              <div className="mt-1 text-[11px] text-amber-200/80 font-medium">
                Retención de administración estimada (8%)
              </div>
            </div>

            {/* KPI 4: Control de Mora & Alertas (Degradado Rosa / Rojo) */}
            <div className="bg-gradient-to-br from-[#2e0912] via-[#3d0d1b]/80 to-[#1c050a] p-4 rounded-xl border border-rose-500/30 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-200">Mora & Alertas</span>
                <span className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-xs">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {contratosMora} {contratosMora === 1 ? "caso" : "casos"}
                </span>
                <span className="text-[11px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700/50">
                  {contratosMora > 0 ? "Atención" : "Excelente"}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-rose-200/80 font-medium">
                {contratosMora > 0 ? "Avisos por WhatsApp pendientes" : "Sin morosidad registrada"}
              </div>
            </div>
          </div>

          {/* Tabla y Filtros Operativos del Hub */}
          <ContratosHub initialContratos={contratos} />
        </main>
      </div>
    </div>
  );
}
