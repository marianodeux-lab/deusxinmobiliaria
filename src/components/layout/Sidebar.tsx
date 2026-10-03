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
  Search
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
    <aside className="w-64 bg-slate-50/90 backdrop-blur-xs text-slate-700 flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-slate-200">
      {/* Brand Header con Logo Oficial DeusX */}
      <div className="h-16 border-b border-slate-200/90 flex items-center px-3.5 bg-white">
        <Link href="/" className="flex items-center gap-2.5 w-full">
          <div className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 shadow-2xs">
            {/* Logo oficial DeusX */}
            <img
              src="/Recursos/DeusX.png"
              alt="DeusX Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="leading-none">
            <span className="text-[11px] font-bold text-slate-800 tracking-tight block">Inmobiliarias</span>
            <span className="text-[9px] font-medium text-[#26a69a] block mt-0.5 font-mono">ERP PropTech</span>
          </div>
        </Link>
      </div>

      {/* Acceso Rápido / Búsqueda Global */}
      <div className="p-3 border-b border-slate-100 bg-white/40">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/90 shadow-2xs transition-colors">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#26a69a]" />
            <span className="truncate">Buscar carpeta o DNI...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Botón de Alta Rápida en Teal #26A69A */}
      <div className="px-3 pt-3">
        <Link
          href="/contratos/nuevo"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-white bg-[#26a69a] hover:bg-[#1e8e84] rounded-lg shadow-2xs transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>Nuevo Contrato / Carpeta</span>
        </Link>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAVIGATION.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider">
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
                        ? "bg-[#e0f2f1] text-[#00695c] font-semibold border-l-3 border-[#26a69a] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-[#00695c]"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span>{item.label}</span>
                    </span>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-bold",
                          item.badgeVariant === "warning"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : item.badgeVariant === "danger"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-[#e0f2f1] text-[#00695c] border border-[#80cbc4]"
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
      <div className="p-3 border-t border-slate-200/80 bg-white/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#26a69a] animate-pulse"></span>
            <span className="text-slate-700 font-medium">Supabase RLS Activo</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
