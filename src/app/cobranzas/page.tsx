import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CobranzasHub } from "@/components/cobranzas/CobranzasHub";
import {
  getPeriodosCobranzaAction,
  getHistorialRecibosAction,
} from "@/modules/cobranzas/actions";

export const metadata = {
  title: "Cobranzas a Inquilinos | DeusX Inmobiliarias",
  description:
    "Gestión integral de cobranzas de alquileres, emisión de Recibos X (RG AFIP 4004-E), control de mora y avisos automáticos por WhatsApp.",
};

export default async function CobranzasPage() {
  const [periodosRes, historialRes] = await Promise.all([
    getPeriodosCobranzaAction({ mes: 10, anio: 2026 }),
    getHistorialRecibosAction(50),
  ]);

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <CobranzasHub
            initialItems={periodosRes.items}
            initialKpis={periodosRes.kpis}
            initialPeriodo={periodosRes.periodo_seleccionado}
            initialHistorial={historialRes.recibos}
          />
        </main>
      </div>
    </div>
  );
}
