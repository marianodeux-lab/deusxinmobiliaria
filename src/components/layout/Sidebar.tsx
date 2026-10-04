"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSuperAdminUserAction } from "@/modules/auth/actions";
import {
  FolderKanban,
  Receipt,
  Wallet,
  Building,
  Users,
  Wrench,
  LineChart,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  CalendarDays,
  Building2,
  FileText,
  Search,
  Globe,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "warning" | "danger" | "teal";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAVIGATION: NavSection[] = [
  {
    title: "ALQUILERES & OPERACIONES",
    items: [
      { label: "Contratos (Carpetas)", href: "/contratos", icon: FolderKanban, badge: 12, badgeVariant: "teal" },
      { label: "Cobranzas (Inquilinos)", href: "/cobranzas", icon: Receipt },
      { label: "Liquidaciones (Dueños)", href: "/liquidaciones", icon: Wallet, badge: 3, badgeVariant: "warning" },
      { label: "Alquileres Temporarios", href: "/temporarios", icon: CalendarDays },
    ],
  },
  {
    title: "GESTIÓN DE ACTIVOS & CRM",
    items: [
      { label: "Propiedades e Inmuebles", href: "/propiedades", icon: Building },
      { label: "Red MLS DeusX", href: "/mls", icon: Handshake, badge: "B2B", badgeVariant: "teal" },
      { label: "CRM Personas", href: "/personas", icon: Users },
      { label: "Mantenimiento & Tickets", href: "/mantenimiento", icon: Wrench, badge: 1, badgeVariant: "danger" },
      { label: "Consorcios & Expensas", href: "/consorcios", icon: Building2 },
    ],
  },
  {
    title: "HERRAMIENTAS & CONTROL",
    items: [
      { label: "Vidriera Online & Web", href: "/configuracion/vidriera", icon: Globe, badge: "NIC.ar", badgeVariant: "teal" },
      { label: "Índices (ICL / IPC / UVA)", href: "/indices", icon: LineChart },
      { label: "Facturación & Caja AFIP", href: "/caja", icon: FileText },
      { label: "Reportes & Rendiciones", href: "/reportes", icon: FileSpreadsheet },
      { label: "Configuración Tenant", href: "/configuracion", icon: Settings },
      { label: "SuperAdmin Cockpit", href: "/superadmin", icon: ShieldCheck, badge: "Master", badgeVariant: "warning" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  useEffect(() => {
    isSuperAdminUserAction().then(setIsSuperAdmin).catch(() => setIsSuperAdmin(false));
  }, []);

  return (
    <aside className="w-64 bg-[#0B1320] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-slate-800 shadow-2xl">
      {/* Brand Header con Logo Oficial DeusX */}
      <div className="h-16 border-b border-slate-800/80 flex items-center px-4 bg-[#070c14]">
        <Link href="/" className="flex items-center gap-2.5 w-full group">
          <div className="flex items-center">
            <img
              src="/Recursos/DeusX.png"
              alt="DeusX Inmobiliarias"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="leading-tight ml-1">
            <span className="text-[12px] font-extrabold text-white tracking-tight block">
              DeusX Inmobiliarias
            </span>
            <span className="text-[9px] font-bold text-emerald-400 block font-mono">
              ERP PropTech Argentina
            </span>
          </div>
        </Link>
      </div>

      {/* Acceso Rápido / Búsqueda Global */}
      <div className="p-3 border-b border-slate-800/70">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-[#0F1A2A] hover:bg-[#132238] hover:text-white rounded-lg border border-slate-800 shadow-xs transition-colors">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Buscar carpeta o DNI...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Botones de Alta Rápida: Nueva Propiedad & Nuevo Contrato */}
      <div className="px-3 pt-3 space-y-1.5">
        <Link
          href="/propiedades/nueva"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 rounded-lg shadow-md transition-all active:scale-[0.98]"
        >
          <Building className="w-4 h-4 text-slate-950" />
          <span>+ Nueva Propiedad</span>
        </Link>

        <Link
          href="/contratos/nuevo"
          className="flex items-center justify-center gap-2 w-full py-1.5 px-3 text-xs font-bold text-emerald-300 bg-[#0F1A2A] hover:bg-[#132238] border border-emerald-500/30 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ Nuevo Contrato</span>
        </Link>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAVIGATION.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.href === "/superadmin") return isSuperAdmin;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <h4 className="px-2 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase font-mono">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-gradient-to-r from-[#004d40] to-[#00382e] text-white font-bold shadow-md border-l-4 border-emerald-400"
                          : "text-slate-400 hover:bg-[#0F1A2A] hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive
                              ? "text-emerald-300"
                              : "text-slate-500 group-hover:text-emerald-400"
                          )}
                        />
                        <span>{item.label}</span>
                      </span>

                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-bold border",
                            item.badgeVariant === "warning"
                              ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                              : item.badgeVariant === "danger"
                              ? "bg-rose-950/80 text-rose-300 border-rose-800/60"
                              : "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Info / Estado del Sistema */}
      <div className="p-3 border-t border-slate-800 bg-[#070c14]">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase RLS Activo</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
