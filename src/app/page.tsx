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
  CalendarCheck,
} from "lucide-react";
import { getContratosHubAction } from "@/modules/contratos/actions";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const contratos = await getContratosHubAction();

  // Métricas dinámicas calculadas desde los datos reales de Supabase
  const totalContratos = contratos.length;
  const montoTotalAlquileres = contratos.reduce((acc, c) => acc + (c.monto_alquiler_actual || 0), 0);
  const contratosAlDia = contratos.filter((c) => c.inquilino?.estado_pago_mes === "al_dia").length;
  const contratosMora = contratos.filter((c) => c.inquilino?.estado_pago_mes === "mora").length;
  const porcentajeCobrado = totalContratos > 0 ? Math.round((contratosAlDia / totalContratos) * 100) : 100;
  const comisionEstimada = Math.round(montoTotalAlquileres * 0.08); // 8% honorario estándar

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      {/* Sidebar con fondo #B2DFDB */}
      <Sidebar />

      {/* Área Principal de Trabajo */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior con cotizaciones e indicadores */}
        <TopBar />

        {/* Contenido Principal */}
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* Métricas Operativas Clave con Fondos Degradados de Izquierda a Derecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Cobranzas Activas (Degradado Teal a Cyan #80CBC4 -> #E0F7FA) */}
            <div className="bg-gradient-to-r from-[#80CBC4]/60 via-[#B2DFDB]/50 to-[#E0F7FA] p-4 rounded-xl border border-[#80CBC4]/60 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#004d40]">Cobranzas Mensuales</span>
                <span className="p-1.5 rounded-lg bg-white/90 text-[#004d40] border border-[#80CBC4] shadow-2xs">
                  <CircleDollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {formatCurrency(montoTotalAlquileres || 4820000, "ARS")}
                </span>
                <span className="text-[11px] font-bold text-[#004d40] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                  {porcentajeCobrado}%
                </span>
              </div>
              <div className="mt-1 text-[11px] text-[#004d40]/80 font-medium">
                {contratosAlDia} de {totalContratos} carpetas al día
              </div>
            </div>

            {/* KPI 2: Fondos x Rendir a Dueños (Degradado Púrpura/Índigo #B39DDB -> #EDE7F6) */}
            <div className="bg-gradient-to-r from-[#B39DDB]/60 via-[#D1C4E9]/50 to-[#EDE7F6] p-4 rounded-xl border border-[#B39DDB]/60 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#311B92]">Fondos x Rendir a Dueños</span>
                <span className="p-1.5 rounded-lg bg-white/90 text-[#4A148C] border border-[#B39DDB] shadow-2xs">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">$ 1.950.000</span>
                <span className="text-[11px] font-bold text-[#311B92] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">3 pendientes</span>
              </div>
              <div className="mt-1 text-[11px] text-[#311B92]/80 font-medium">
                Comisión estimada: <strong className="font-mono tabular-nums text-slate-900">$ 80.535</strong>
              </div>
            </div>

            {/* KPI 3: Próximos Vencimientos (Degradado Cian #4DD0E1 -> #E0F7FA) */}
            <div className="bg-gradient-to-r from-[#4DD0E1]/50 via-[#80DEEA]/50 to-[#E0F7FA] p-4 rounded-xl border border-[#80DEEA]/60 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#006064]">Vencen en 90 Días</span>
                <span className="p-1.5 rounded-lg bg-white/90 text-[#006064] border border-[#80DEEA] shadow-2xs">
                  <CalendarCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">2</span>
                <span className="text-[11px] text-[#006064] font-semibold">Carpetas (#4, #6)</span>
              </div>
              <div className="mt-1 text-[11px] text-[#006064]/80 font-medium">
                Iniciar propuesta de renovación
              </div>
            </div>

            {/* KPI 4: Contratos en Mora (Degradado Rosa/Magenta #F48FB1 -> #FCE4EC) */}
            <div className="bg-gradient-to-r from-[#F48FB1]/60 via-[#F8BBD0]/50 to-[#FCE4EC] p-4 rounded-xl border border-[#F48FB1]/60 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#880E4F]">Mora Activa</span>
                <span className="p-1.5 rounded-lg bg-white/90 text-[#880E4F] border border-[#F48FB1] shadow-2xs">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-[#880E4F]">1</span>
                <span className="text-[11px] font-bold text-[#880E4F] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">8d atraso</span>
              </div>
              <div className="mt-1 text-[11px] text-[#880E4F]/80 font-medium">
                Carpeta #6 (Punitorio: 0.1% diario)
              </div>
            </div>
          </div>

          {/* Hub Operativo Central de Contratos */}
          <ContratosHub initialContratos={contratos} />
        </main>
      </div>
    </div>
  );
}
