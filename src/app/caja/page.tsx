import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CajaHub } from "@/components/caja/CajaHub";
import { getCajaHubAction } from "@/modules/caja/actions";

export const metadata = {
  title: "Facturación AFIP / ARCA & Caja Diaria | DeusX Inmobiliarias",
  description:
    "Control de tesorería, arqueo de caja diaria, facturación electrónica con CAE y comprobantes fiscales con código QR oficial.",
};

export default async function CajaPage() {
  const { movimientos, facturas, kpis } = await getCajaHubAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <CajaHub
            initialMovimientos={movimientos}
            initialFacturas={facturas}
            initialKpis={kpis}
          />
        </main>
      </div>
    </div>
  );
}
