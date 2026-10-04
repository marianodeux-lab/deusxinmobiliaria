import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { SuperAdminDashboard } from "@/components/superadmin/SuperAdminDashboard";
import { getSuperAdminDataAction } from "@/modules/superadmin/actions";
import { isSuperAdminUserAction } from "@/modules/auth/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "SuperAdmin Cockpit | DeusX Inmobiliarias",
  description: "Gobierno de suscripciones, licencias multi-tenant y métricas SaaS globales.",
};

export default async function SuperAdminPage() {
  const isSuperAdmin = await isSuperAdminUserAction();
  if (!isSuperAdmin) {
    // Si no es el administrador de la plataforma, redirige sin revelar existencia del panel
    redirect("/");
  }

  const adminData = await getSuperAdminDataAction();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />
        <main className="flex-1 p-5 space-y-6 max-w-[1600px] w-full mx-auto">
          <SuperAdminDashboard initialData={adminData} />
        </main>
      </div>
    </div>
  );
}
