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

  return (
    <aside className="w-64 bg-[#B2DFDB] text-slate-800 flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#80CBC4]">
      {/* Brand Header con Logo Oficial DeusX (Fondo transparente, sin negro) */}
      <div className="h-16 border-b border-[#80CBC4]/80 flex items-center px-4 bg-transparent">
        <Link href="/" className="flex items-center gap-2 w-full group">
          {/* Logo transparente sin fondo negro */}
          <div className="flex items-center drop-shadow-[0_1px_1px_rgba(0,77,64,0.4)]">
            <img
              src="/Recursos/DeusX.png"
              alt="DeusX Inmobiliarias"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="leading-none ml-1">
            <span className="text-[12px] font-extrabold text-[#004d40] tracking-tight block">Inmobiliarias</span>
            <span className="text-[9px] font-bold text-[#00796b] block font-mono">ERP PropTech</span>
          </div>
        </Link>
      </div>

      {/* Acceso Rápido / Búsqueda Global */}
      <div className="p-3 border-b border-[#80CBC4]/60">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#004d40] bg-white/70 hover:bg-white rounded-lg border border-[#80CBC4] shadow-2xs transition-colors">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#004d40]" />
            <span className="truncate">Buscar carpeta o DNI...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4] rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Botones de Alta Rápida: Nueva Propiedad & Nuevo Contrato */}
      <div className="px-3 pt-3 space-y-1.5">
        <Link
          href="/propiedades/nueva"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-lg shadow-xs transition-all active:scale-[0.98]"
        >
          <Building className="w-4 h-4 text-white" />
          <span>+ Nueva Propiedad</span>
        </Link>

        <Link
          href="/contratos/nuevo"
          className="flex items-center justify-center gap-2 w-full py-1.5 px-3 text-xs font-semibold text-[#004d40] bg-white/80 hover:bg-white border border-[#80CBC4] rounded-lg shadow-2xs transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#004d40]" />
          <span>+ Nuevo Contrato</span>
        </Link>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAVIGATION.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-2 text-[10px] font-extrabold text-[#004d40]/75 tracking-wider uppercase">
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
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group",
                      isActive
                        ? "bg-white text-[#004d40] shadow-xs border-l-4 border-[#004d40]"
                        : "text-[#004d40] hover:bg-white/50 hover:text-[#002d25]"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-[#004d40]"
                            : "text-[#004d40]/80 group-hover:text-[#004d40]"
                        )}
                      />
                      <span>{item.label}</span>
                    </span>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-bold",
                          item.badgeVariant === "warning"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : item.badgeVariant === "danger"
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : "bg-white text-[#004d40] border border-[#80CBC4]"
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
      <div className="p-3 border-t border-[#80CBC4]/80 bg-transparent">
        <div className="flex items-center justify-between text-[11px] text-[#004d40]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#004d40] animate-pulse"></span>
            <span>Supabase RLS Activo</span>
          </span>
          <span className="font-mono text-[10px] text-[#004d40]/70 font-semibold">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
