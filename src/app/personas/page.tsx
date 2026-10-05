import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PersonasHub } from "@/components/personas/PersonasHub";
import { getPersonasCRMAction } from "@/modules/personas/actions";

export const metadata = {
  title: "CRM de Personas | DeusX Inmobiliarias",
  description:
    "Directorio integral de propietarios, inquilinos, garantes y proveedores de servicios.",
};

export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const { items, kpis } = await getPersonasCRMAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <PersonasHub initialItems={items} initialKpis={kpis} />
        </main>
      </div>
    </div>
  );
}
