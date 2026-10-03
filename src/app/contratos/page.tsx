import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ContratosHub } from "@/components/contratos/ContratosHub";
import { getContratosHubAction } from "@/modules/contratos/actions";

export const metadata = {
  title: "Contratos de Alquiler | DeusX Inmobiliarias",
  description: "Administración integral de contratos de locación, índices de ajuste, cobros y liquidaciones.",
};

export default async function ContratosPage() {
  const contratos = await getContratosHubAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Hub de Contratos & Carpetas de Locación
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento en tiempo real de alquileres vigentes, cobranzas a inquilinos y liquidaciones a propietarios.
              </p>
            </div>
          </div>
          <ContratosHub initialContratos={contratos} />
        </main>
      </div>
    </div>
  );
}
