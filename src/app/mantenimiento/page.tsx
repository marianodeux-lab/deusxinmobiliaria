import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MantenimientoHub } from "@/components/mantenimiento/MantenimientoHub";
import { getTicketsMantenimientoAction } from "@/modules/mantenimiento/actions";

export const metadata = {
  title: "Mantenimiento & Órdenes de Servicio | DeusX Inmobiliarias",
  description:
    "Gestión integral de incidencias técnicas, reparaciones, gremios y liquidación financiera.",
};

export const dynamic = "force-dynamic";

export default async function MantenimientoPage() {
  const { items, kpis, propiedadesList, proveedoresList, contratosList } =
    await getTicketsMantenimientoAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <MantenimientoHub
            initialItems={items}
            initialKpis={kpis}
            propiedadesList={propiedadesList}
            proveedoresList={proveedoresList}
            contratosList={contratosList}
          />
        </main>
      </div>
    </div>
  );
}
