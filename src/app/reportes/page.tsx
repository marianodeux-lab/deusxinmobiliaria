import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ReportesHub } from "@/components/reportes/ReportesHub";
import { getReportesHubAction } from "@/modules/reportes/actions";

export const metadata = {
  title: "Reportes Financieros & Rendición Anual | DeusX Inmobiliarias",
  description:
    "Balances contables mensuales, certificados impositivos para propietarios y exportación a Excel / CSV.",
};

export default async function ReportesPage() {
  const { anioSeleccionado, resumenMensual, resumenPropietarios, kpis } =
    await getReportesHubAction(2026);

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <ReportesHub
            initialResumenMensual={resumenMensual}
            initialResumenPropietarios={resumenPropietarios}
            initialKpis={kpis}
            anioSeleccionado={anioSeleccionado}
          />
        </main>
      </div>
    </div>
  );
}
