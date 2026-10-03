"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "warning" | "danger" | "info";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAVIGATION: NavSection[] = [
  {
    title: "ALQUILERES & OPERACIONES",
    items: [
      { label: "Contratos (Carpetas)", href: "/contratos", icon: FolderKanban, badge: 12 },
      { label: "Cobranzas (Inquilinos)", href: "/cobranzas", icon: Receipt },
      { label: "Liquidaciones (Dueños)", href: "/liquidaciones", icon: Wallet, badge: 3, badgeVariant: "warning" },
      { label: "Alquileres Temporarios", href: "/temporarios", icon: CalendarDays },
    ],
  },
  {
    title: "GESTIÓN DE ACTIVOS & CRM",
    items: [
      { label: "Propiedades e Inmuebles", href: "/propiedades", icon: Building },
      { label: "CRM Personas", href: "/personas", icon: Users },
      { label: "Mantenimiento & Tickets", href: "/mantenimiento", icon: Wrench, badge: 1, badgeVariant: "danger" },
      { label: "Consorcios & Expensas", href: "/consorcios", icon: Building2 },
    ],
  },
  {
    title: "HERRAMIENTAS & CONTROL",
    items: [
      { label: "Índices (ICL / IPC / UVA)", href: "/indices", icon: LineChart },
      { label: "Facturación & Caja AFIP", href: "/caja", icon: FileText },
      { label: "Reportes & Rendiciones", href: "/reportes", icon: FileSpreadsheet },
      { label: "Configuración Tenant", href: "/configuracion", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1e38] text-slate-100 flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#1a3258]">
      {/* Brand Header: DeusX Inmobiliarias */}
      <div className="h-14 border-b border-[#1b345b] flex items-center px-4 gap-2.5 bg-[#091527]">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/50 flex items-center justify-center font-black text-sky-400 text-sm shadow-xs">
          DX
        </div>
        <div>
          <span className="font-bold tracking-tight text-sm text-white">DeusX</span>
          <span className="text-xs text-sky-300 font-semibold ml-1.5">Inmobiliarias</span>
        </div>
      </div>

      {/* Acceso Rápido / Búsqueda Global */}
      <div className="p-3 border-b border-[#172c4c]">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 bg-[#132644] hover:bg-[#1a3359] rounded-lg border border-[#1e3b68] transition-colors">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Buscar carpeta o DNI...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#0b172a] text-slate-400 border border-[#274677] rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Botón de Alta Rápida */}
      <div className="px-3 pt-3">
        <Link
          href="/contratos/nuevo"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Nuevo Contrato / Carpeta</span>
        </Link>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAVIGATION.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-sky-300/60 tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-sky-500/20 text-sky-200 font-semibold border-l-2 border-sky-400 shadow-2xs"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-sky-300"
                            : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      <span>{item.label}</span>
                    </span>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-bold",
                          item.badgeVariant === "warning"
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : item.badgeVariant === "danger"
                            ? "bg-rose-400/20 text-rose-300 border border-rose-400/30"
                            : "bg-sky-400/20 text-sky-300 border border-sky-400/30"
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
        ))}
      </nav>

      {/* Footer Info / Estado del Sistema */}
      <div className="p-3 border-t border-[#172c4c] bg-[#091527]">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">RLS Supabase Activo</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
