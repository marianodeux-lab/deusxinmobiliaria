import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ConfiguracionHub } from "@/components/configuracion/ConfiguracionHub";
import { getConfiguracionAction } from "@/modules/configuracion/actions";

export const metadata = {
  title: "Configuración | DeusX Inmobiliarias",
  description: "Configuración de emisores de comprobantes, AFIP WSFE, links de servicios y memos masivos.",
};

export default async function ConfiguracionPage() {
  const configData = await getConfiguracionAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-6 max-w-[1400px] w-full mx-auto">
          <ConfiguracionHub initialConfig={configData} />
        </main>
      </div>
    </div>
  );
}
