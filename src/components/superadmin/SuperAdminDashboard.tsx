"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Building,
  CircleDollarSign,
  TrendingUp,
  FolderKanban,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Globe,
  Plus,
  RefreshCw,
  Sliders,
  MoreVertical,
  Layers,
  ArrowUpRight,
  Database
} from "lucide-react";
import {
  SuperAdminMetrics,
  TenantAdminItem,
  toggleTenantEstadoAction,
  updateTenantPlanAction,
} from "@/modules/superadmin/actions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function SuperAdminDashboard({ initialData }: { initialData: SuperAdminMetrics }) {
  const [data, setData] = useState<SuperAdminMetrics>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("todos");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtrado de tenants
  const filteredTenants = useMemo(() => {
    return data.tenants.filter((t) => {
      const matchText =
        t.nombre_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cuit.includes(searchTerm) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPlan = filterPlan === "todos" || t.plan_saas === filterPlan;
      const matchEstado = filterEstado === "todos" || t.estado_licencia === filterEstado;

      return matchText && matchPlan && matchEstado;
    });
  }, [data.tenants, searchTerm, filterPlan, filterEstado]);

  const handleToggleEstado = async (tenantId: string, currentEstado: string) => {
    const nextEstado = currentEstado === "activa" ? "suspendida" : "activa";
    setLoadingId(tenantId);
    try {
      const res = await toggleTenantEstadoAction(tenantId, nextEstado);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          tenants: prev.tenants.map((t) =>
            t.id === tenantId ? { ...t, estado_licencia: nextEstado as any } : t
          ),
          activeTenants: nextEstado === "activa" ? prev.activeTenants + 1 : prev.activeTenants - 1,
          suspendedTenants: nextEstado === "suspendida" ? prev.suspendedTenants + 1 : prev.suspendedTenants - 1,
        }));
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdatePlan = async (tenantId: string, newPlan: "starter" | "pro" | "enterprise") => {
    setLoadingId(tenantId);
    try {
      const res = await updateTenantPlanAction(tenantId, newPlan);
      if (res.success) {
        const precio = newPlan === "enterprise" ? 120000 : newPlan === "pro" ? 75000 : 45000;
        setData((prev) => ({
          ...prev,
          tenants: prev.tenants.map((t) =>
            t.id === tenantId ? { ...t, plan_saas: newPlan, precio_mensual: precio } : t
          ),
        }));
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Panel SuperAdmin */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#80CBC4]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#004d40] border border-[#80CBC4]/40 rounded-xl shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[#80CBC4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  DeusX SuperAdmin & Control de Licencias
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-[#004d40] text-[#80CBC4] border border-[#80CBC4]/40 rounded-full">
                  Master Cockpit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gobierno multi-inquilino centralizado, facturación de suscripciones MRR y cuotas de nube.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#80CBC4]" />
              <span>Estado Nube Supabase</span>
            </button>
            <button className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#80CBC4] hover:bg-[#4db6ac] rounded-lg shadow-md transition-all flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>+ Alta Manual Licencia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas SaaS Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: MRR */}
        <div className="bg-gradient-to-r from-[#80CBC4]/60 via-[#B2DFDB]/50 to-[#E0F7FA] p-4 rounded-xl border border-[#80CBC4]/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#004d40]">MRR (Ingresos Recurrentes)</span>
            <span className="p-1.5 rounded-lg bg-white/90 text-[#004d40] border border-[#80CBC4]">
              <CircleDollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(data.mrr, "ARS")}
            </span>
            <span className="text-[10px] font-bold text-[#004d40] bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
              / mes
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#004d40]/80 font-medium">
            ARR estimado: <strong className="font-mono text-slate-900">{formatCurrency(data.arr, "ARS")}</strong>
          </div>
        </div>

        {/* KPI 2: Licencias Activas */}
        <div className="bg-gradient-to-r from-[#B39DDB]/60 via-[#D1C4E9]/50 to-[#EDE7F6] p-4 rounded-xl border border-[#B39DDB]/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#311B92]">Inmobiliarias Clientes</span>
            <span className="p-1.5 rounded-lg bg-white/90 text-[#4A148C] border border-[#B39DDB]">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {data.totalTenants}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-white/90 px-1.5 py-0.5 rounded">
              {data.activeTenants} Activas
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#311B92]/80 font-medium">
            {data.trialTenants} en prueba • {data.suspendedTenants} suspendidas
          </div>
        </div>

        {/* KPI 3: Propiedades en la Red */}
        <div className="bg-gradient-to-r from-[#4DD0E1]/50 via-[#80DEEA]/50 to-[#E0F7FA] p-4 rounded-xl border border-[#80DEEA]/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#006064]">Propiedades en Cartera</span>
            <span className="p-1.5 rounded-lg bg-white/90 text-[#006064] border border-[#80DEEA]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {data.totalPropiedades}
            </span>
            <span className="text-[11px] text-[#006064] font-semibold">Inmuebles Activos</span>
          </div>
          <div className="mt-1 text-[11px] text-[#006064]/80 font-medium">
            Base consolidada en Postgres RLS
          </div>
        </div>

        {/* KPI 4: Contratos de Alquiler */}
        <div className="bg-gradient-to-r from-[#F48FB1]/60 via-[#F8BBD0]/50 to-[#FCE4EC] p-4 rounded-xl border border-[#F48FB1]/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#880E4F]">Carpetas de Locación</span>
            <span className="p-1.5 rounded-lg bg-white/90 text-[#880E4F] border border-[#F48FB1]">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {data.totalContratos}
            </span>
            <span className="text-[11px] font-bold text-[#880E4F] bg-white/90 px-1.5 py-0.5 rounded">
              Expedientes
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#880E4F]/80 font-medium">
            Administradas con índice ICL / IPC
          </div>
        </div>
      </div>

      {/* Tabla de Inmobiliarias Suscriptas */}
      <div className="bg-[#1C1D23] rounded-xl border border-[#262832] shadow-sm overflow-hidden">
        {/* Barra de Filtros */}
        <div className="p-4 border-b border-[#262832] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141519]">
          <div className="flex-1 relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar inmobiliaria, CUIT o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796b]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00796b]"
            >
              <option value="todos">Todos los Planes</option>
              <option value="starter">Plan Starter</option>
              <option value="pro">Plan Pro (Vidriera + NIC)</option>
              <option value="enterprise">Plan Enterprise MLS</option>
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00796b]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activa">Activa</option>
              <option value="prueba">En Prueba</option>
              <option value="suspendida">Suspendida</option>
            </select>
          </div>
        </div>

        {/* Tabla Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#101115] border-b border-[#262832] text-slate-100 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Inmobiliaria / Cliente</th>
                <th className="py-3 px-4">CUIT & Contacto</th>
                <th className="py-3 px-4">Portal / Dominio</th>
                <th className="py-3 px-4">Plan SaaS</th>
                <th className="py-3 px-4">Abono Mensual</th>
                <th className="py-3 px-4 text-center">Inmuebles</th>
                <th className="py-3 px-4 text-center">Carpetas</th>
                <th className="py-3 px-4 text-center">Estado Licencia</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron licencias que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const isActiva = t.estado_licencia === "activa";
                  const isPrueba = t.estado_licencia === "prueba";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.nombre_fantasia}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {t.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700">{t.cuit}</div>
                        <div className="text-[11px] text-slate-500">{t.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {t.custom_domain ? (
                          <div className="flex items-center gap-1.5 text-[#00796b] font-medium">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{t.custom_domain}</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 font-mono text-[11px]">
                            /{t.slug || "portal"}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={t.plan_saas}
                          disabled={loadingId === t.id}
                          onChange={(e) => handleUpdatePlan(t.id, e.target.value as any)}
                          className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px] focus:outline-none"
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro (NIC.ar)</option>
                          <option value="enterprise">Enterprise MLS</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {formatCurrency(t.precio_mensual, "ARS")}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {t.propiedades_count}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {t.contratos_count}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                            isActiva && "bg-emerald-100 text-emerald-800 border border-emerald-300",
                            isPrueba && "bg-amber-100 text-amber-800 border border-amber-300",
                            !isActiva && !isPrueba && "bg-rose-100 text-rose-800 border border-rose-300"
                          )}
                        >
                          {isActiva && <CheckCircle2 className="w-3 h-3" />}
                          {isPrueba && <AlertTriangle className="w-3 h-3" />}
                          {!isActiva && !isPrueba && <XCircle className="w-3 h-3" />}
                          <span className="capitalize">{t.estado_licencia}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          disabled={loadingId === t.id}
                          onClick={() => handleToggleEstado(t.id, t.estado_licencia)}
                          className={cn(
                            "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors border shadow-2xs",
                            isActiva
                              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          )}
                        >
                          {isActiva ? "Suspender" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
