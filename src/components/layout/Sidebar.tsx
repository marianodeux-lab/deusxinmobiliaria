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
  ShieldCheck,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "warning" | "danger";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAVIGATION: NavSection[] = [
  {
    title: "OPERACIONES",
    items: [
      { label: "Contratos (Carpetas)", href: "/contratos", icon: FolderKanban, badge: 12 },
      { label: "Cobranzas (Inquilinos)", href: "/cobranzas", icon: Receipt },
      { label: "Liquidaciones (Dueños)", href: "/liquidaciones", icon: Wallet, badge: 3, badgeVariant: "warning" },
    ],
  },
  {
    title: "GESTIÓN DE ACTIVOS",
    items: [
      { label: "Propiedades e Inmuebles", href: "/propiedades", icon: Building },
      { label: "CRM Personas", href: "/personas", icon: Users },
      { label: "Mantenimiento & Tickets", href: "/mantenimiento", icon: Wrench, badge: 1, badgeVariant: "danger" },
    ],
  },
  {
    title: "HERRAMIENTAS & CONTROL",
    items: [
      { label: "Índices Económicos (ICL/IPC)", href: "/indices", icon: LineChart },
      { label: "Reportes & Cuentas", href: "/reportes", icon: FileSpreadsheet },
      { label: "Configuración Tenant", href: "/configuracion", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-14 border-b border-slate-200 flex items-center px-4 gap-2.5 bg-slate-900 text-white">
        <div className="w-7 h-7 rounded-md bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-black text-blue-300 text-sm">
          DX
        </div>
        <div>
          <span className="font-bold tracking-tight text-sm text-slate-100">DeusX</span>
          <span className="text-xs text-blue-400 font-medium ml-1.5">Inmobiliaria</span>
        </div>
      </div>

      {/* Acceso Rápido / Búsqueda Global */}
      <div className="p-3 border-b border-slate-100">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-md border border-slate-200/80 transition-colors">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-600" />
            <span>Buscar carpeta o DNI...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded font-mono shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Botón de Alta Rápida */}
      <div className="px-3 pt-3">
        <Link
          href="/contratos/nuevo"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/90 border border-slate-300 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-slate-700" />
          <span>Nuevo Contrato / Carpeta</span>
        </Link>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAVIGATION.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-600 tracking-wider">
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
                      "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors group",
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-slate-900"
                            : "text-slate-600 group-hover:text-slate-800"
                        )}
                      />
                      <span>{item.label}</span>
                    </span>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-semibold",
                          item.badgeVariant === "warning"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : item.badgeVariant === "danger"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-slate-200 text-slate-700"
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
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>RLS Multi-tenant</span>
          </span>
          <span className="font-mono text-[10px] text-slate-600">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
