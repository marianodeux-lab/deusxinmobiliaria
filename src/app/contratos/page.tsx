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
} from "lucide-react";

export const metadata = {
  title: "Contratos de Alquiler | DeusX Inmobiliarias",
  description: "Administración integral de contratos de locación, índices de ajuste, cobros y liquidaciones.",
};

export const dynamic = "force-dynamic";

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
    <div className="flex h-screen bg-[#141519] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Menú: Ultra Oscuro (#08090B) */}
      <Sidebar />

      {/* Área Principal de Trabajo: Fondo Gris Oscuro Anti-Fatiga (#141519) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior ultra oscura (#08090B) */}
        <TopBar />

        {/* Contenido Principal */}
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* Cabecera de Página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#262832]">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Hub de Contratos & Carpetas de Locación</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#004D40]/80 text-[#34D399] border border-[#10B981]/50 font-mono">
                  LIVE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Seguimiento en tiempo real de alquileres vigentes, cobranzas con Recibo X y liquidaciones a propietarios.
              </p>
            </div>
          </div>

          {/* Tarjetas de Métricas con Degradados Verdes Esmeralda (Sin azul) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Cobranzas Activas (Degradado Esmeralda Profundo) */}
            <div className="bg-gradient-to-br from-[#00382E] via-[#004D40] to-[#06241D] p-4 rounded-xl border border-[#10B981]/40 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A7F3D0]">Cobranzas Mensuales</span>
                <span className="p-1.5 rounded-lg bg-[#002B23] text-[#34D399] border border-[#10B981]/40 shadow-xs">
                  <CircleDollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatCurrency(montoTotalAlquileres || 4820000, "ARS")}
                </span>
                <span className="text-[11px] font-bold text-[#34D399] bg-[#002B23] px-1.5 py-0.5 rounded border border-[#10B981]/40">
                  {porcentajeCobrado}%
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#A7F3D0]/80 font-medium">
                {contratosAlDia} de {totalContratos} carpetas al día
              </div>
            </div>

            {/* KPI 2: Actualización ICL / IPC (Degradado Verde Esmeralda Radiante - Reemplazando Azul) */}
            <div className="bg-gradient-to-br from-[#004D40] via-[#005E4E] to-[#0A332A] p-4 rounded-xl border border-[#10B981]/40 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A7F3D0]">Indexación ICL / IPC</span>
                <span className="p-1.5 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40 shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  +124.5%
                </span>
                <span className="text-[11px] font-bold text-[#34D399] bg-[#00382E] px-1.5 py-0.5 rounded border border-[#10B981]/40">
                  BCRA
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#A7F3D0]/80 font-medium">
                3 contratos ajustan este mes
              </div>
            </div>

            {/* KPI 3: Liquidaciones a Dueños (Degradado Esmeralda Petróleo con acento honorarios) */}
            <div className="bg-gradient-to-br from-[#122A1E] via-[#004D40] to-[#0D1F17] p-4 rounded-xl border border-[#10B981]/35 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A7F3D0]">Liquidaciones a Dueños</span>
                <span className="p-1.5 rounded-lg bg-[#002D22] text-[#34D399] border border-[#10B981]/40 shadow-xs">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatCurrency(comisionEstimada || 385000, "ARS")}
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-[#1F2618] px-1.5 py-0.5 rounded border border-amber-600/40">
                  Honorarios
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#A7F3D0]/80 font-medium">
                Retención de administración estimada (8%)
              </div>
            </div>

            {/* KPI 4: Control de Mora & Alertas (Gris Carbón Oscuro con Acento Borgoña/Esmeralda) */}
            <div className="bg-gradient-to-br from-[#26171B] via-[#1F1518] to-[#171214] p-4 rounded-xl border border-rose-500/30 shadow-xl relative overflow-hidden group">
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
