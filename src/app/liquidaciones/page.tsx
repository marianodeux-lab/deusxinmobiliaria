import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LiquidacionesHub } from "@/components/liquidaciones/LiquidacionesHub";
import { getLiquidacionesDashboardAction } from "@/modules/liquidaciones/actions";

export const metadata = {
  title: "Liquidaciones & Rendiciones a Dueños | DeusX Inmobiliarias",
  description:
    "Liquidación de alquileres percibidos, retención de honorarios de administración inmobiliaria y emisión de constancias oficiales de rendición.",
};

export const dynamic = "force-dynamic";

export default async function LiquidacionesPage() {
  const dashboardRes = await getLiquidacionesDashboardAction({ mes: 10, anio: 2026 });

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <LiquidacionesHub
            initialPendientes={dashboardRes.pendientes}
            initialHistorial={dashboardRes.historial}
            initialKpis={dashboardRes.kpis}
            initialPeriodo={dashboardRes.periodo_seleccionado}
          />
        </main>
      </div>
    </div>
  );
}
