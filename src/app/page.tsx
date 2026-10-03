import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ContratosHub } from "@/components/contratos/ContratosHub";
import { 
  FolderKanban, 
  CircleDollarSign, 
  Wallet, 
  AlertCircle,
  FileCheck2,
  CalendarCheck
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar fijo de navegación */}
      <Sidebar />

      {/* Área Principal de Trabajo */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior con cotizaciones e indicadores */}
        <TopBar />

        {/* Contenido Principal */}
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* Métricas Operativas Clave (KPIs Anti-Fatiga) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Cobranzas Inquilinos */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Cobranzas Octubre</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CircleDollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">$ 4.820.000</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">78%</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                10 de 12 cuotas percibidas
              </div>
            </div>

            {/* KPI 2: Liquidaciones Pendientes */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Fondos x Rendir a Dueños</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">$ 1.950.000</span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">3 pendientes</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                Comisión estimada: <strong className="font-mono tabular-nums text-slate-800">$ 80.535</strong>
              </div>
            </div>

            {/* KPI 3: Próximos Vencimientos */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Vencen en 90 Días</span>
                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  <CalendarCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">2</span>
                <span className="text-[11px] text-slate-600">Carpetas (#4, #6)</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                Iniciar propuesta de renovación
              </div>
            </div>

            {/* KPI 4: Contratos en Mora */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Mora Activa</span>
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-rose-700">1</span>
                <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">8 días de atraso</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                Carpeta #6 (Punitorio: 0.1% diario)
              </div>
            </div>
          </div>

          {/* Hub Operativo Central de Contratos */}
          <ContratosHub />
        </main>
      </div>
    </div>
  );
}
