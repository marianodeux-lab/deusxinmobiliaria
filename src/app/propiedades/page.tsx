import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PropiedadesHub } from "@/components/propiedades/PropiedadesHub";
import { getPropiedadesHubAction } from "@/modules/propiedades/actions";

export const metadata = {
  title: "Propiedades e Inmuebles | DeusX Inmobiliarias",
  description:
    "Catálogo e inventario de propiedades, contratos vigentes, estado de ocupación y vidriera web pública.",
};

export default async function PropiedadesPage() {
  const { items, kpis } = await getPropiedadesHubAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <PropiedadesHub initialItems={items} initialKpis={kpis} />
        </main>
      </div>
    </div>
  );
}
