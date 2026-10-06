import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ManualViewer } from "@/components/manual/ManualViewer";

export const metadata = {
  title: "Manual de Instrucciones | DeusX Inmobiliarias",
  description: "Guía práctica, didáctica y resumida para el uso integral de la plataforma DeusX Inmobiliarias.",
};

export default function ManualPage() {
  return (
    <div className="flex h-screen bg-[#141519] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar de navegación */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />

        <main className="flex-1 p-5 space-y-5 max-w-[1500px] w-full mx-auto">
          <ManualViewer />
        </main>
      </div>
    </div>
  );
}
