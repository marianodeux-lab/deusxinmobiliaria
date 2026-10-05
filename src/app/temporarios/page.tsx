import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TemporariosHub } from "@/components/temporarios/TemporariosHub";
import { getTemporariosHubAction } from "@/modules/temporarios/actions";

export const metadata = {
  title: "Alquileres Temporarios & Vacacionales | DeusX Inmobiliarias",
  description:
    "Gestión integral de reservas temporarias, calendario de ocupación, check-in/out y housekeeping.",
};

export const dynamic = "force-dynamic";

export default async function TemporariosPage() {
  const { items, kpis, propiedadesTemporales, todasPropiedades } =
    await getTemporariosHubAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <TemporariosHub
            initialItems={items}
            initialKpis={kpis}
            propiedadesTemporales={propiedadesTemporales}
            todasPropiedades={todasPropiedades}
          />
        </main>
      </div>
    </div>
  );
}
