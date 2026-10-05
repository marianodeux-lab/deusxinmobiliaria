import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { NuevoContratoForm } from "@/components/contratos/NuevoContratoForm";
export const dynamic = "force-dynamic";

export default function NuevoContratoPage() {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />

        <main className="flex-1 p-5 max-w-[1600px] w-full mx-auto">
          <NuevoContratoForm />
        </main>
      </div>
    </div>
  );
}
