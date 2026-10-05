import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ConsorciosHub } from "@/components/consorcios/ConsorciosHub";
import { getConsorciosHubAction } from "@/modules/consorcios/actions";

export const metadata = {
  title: "Consorcios & Expensas | DeusX Inmobiliarias",
  description:
    "Gestión de consorcios de edificios, liquidación mensual de expensas ordinarias y extraordinarias, y avisos de cobro.",
};

export const dynamic = "force-dynamic";

export default async function ConsorciosPage() {
  const { consorcios, expensas, kpis } = await getConsorciosHubAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-5 max-w-[1600px] w-full mx-auto">
          <ConsorciosHub
            initialConsorcios={consorcios}
            initialExpensas={expensas}
            initialKpis={kpis}
          />
        </main>
      </div>
    </div>
  );
}
