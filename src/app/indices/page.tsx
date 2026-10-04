import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { IndicesHub } from "@/components/indices/IndicesHub";
import { getIndicesHubAction } from "@/modules/indices/actions";

export const metadata = {
  title: "Índices Económicos & Indexación | DeusX Inmobiliarias",
  description:
    "Cálculo de ajustes de contratos de locación con series oficiales BCRA e INDEC (ICL, IPC, UVA, Dólar).",
};

export default async function IndicesPage() {
  const { indicesList, contratosAjustables, kpis } = await getIndicesHubAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <IndicesHub
            initialIndices={indicesList}
            initialContratos={contratosAjustables}
            initialKpis={kpis}
          />
        </main>
      </div>
    </div>
  );
}
