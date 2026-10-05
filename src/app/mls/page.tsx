import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { RedMlsHub } from "@/components/mls/RedMlsHub";
import { getMlsDataAction } from "@/modules/mls/actions";

export const metadata = {
  title: "Red MLS DeusX | Co-Brokering Inmobiliario & Reverse Matching",
  description: "Red colaborativa de inmobiliarias: inventario compartido al 50% de comisión y matching de demandas insatisfechas.",
};

export const dynamic = "force-dynamic";

export default async function RedMlsPage() {
  const { propiedades, busquedas } = await getMlsDataAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-6 max-w-[1600px] w-full mx-auto">
          <RedMlsHub initialPropiedades={propiedades} initialBusquedas={busquedas} />
        </main>
      </div>
    </div>
  );
}
