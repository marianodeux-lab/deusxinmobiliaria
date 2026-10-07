"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSuperAdminUserAction } from "@/modules/auth/actions";
import { useMobileNav } from "@/context/MobileNavContext";
import { usePwa } from "@/context/PwaContext";
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
  BookOpen,
  X,
  Download,
  Smartphone,
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
      { label: "Contratos (Carpetas)", href: "/contratos", icon: FolderKanban },
      { label: "Cobranzas (Inquilinos)", href: "/cobranzas", icon: Receipt },
      { label: "Liquidaciones (Dueños)", href: "/liquidaciones", icon: Wallet },
      { label: "Alquileres Temporarios", href: "/temporarios", icon: CalendarDays },
    ],
  },
  {
    title: "GESTIÓN DE ACTIVOS & CRM",
    items: [
      { label: "Propiedades e Inmuebles", href: "/propiedades", icon: Building },
      { label: "Red MLS DeusX", href: "/mls", icon: Handshake, badge: "B2B", badgeVariant: "teal" },
      { label: "CRM Personas", href: "/personas", icon: Users },
      { label: "Mantenimiento & Tickets", href: "/mantenimiento", icon: Wrench },
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
      { label: "Manual de Instrucciones", href: "/manual", icon: BookOpen, badge: "Guía", badgeVariant: "teal" },
      { label: "Configuración Tenant", href: "/configuracion", icon: Settings },
      { label: "SuperAdmin Cockpit", href: "/superadmin", icon: ShieldCheck, badge: "Master", badgeVariant: "warning" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const { isMobileNavOpen, closeMobileNav } = useMobileNav();
  const { installApp, isInstalled } = usePwa();

  useEffect(() => {
    isSuperAdminUserAction().then(setIsSuperAdmin).catch(() => setIsSuperAdmin(false));
  }, []);

  // Cerrar menú móvil únicamente cuando cambia la ruta de navegación (pathname)
  useEffect(() => {
    closeMobileNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderNavContent = (isMobileDrawer: boolean) => (
    <>
      {/* Brand Header */}
      <div className="h-16 border-b border-[#0F1014] flex items-center justify-between px-4 bg-[#000000] shrink-0">
        <Link href="/" onClick={closeMobileNav} className="flex items-center gap-2.5 group">
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
            <span className="text-[9px] font-bold text-[#10B981] block font-mono">
              ERP PropTech Argentina
            </span>
          </div>
        </Link>

        {isMobileDrawer && (
          <button
            onClick={closeMobileNav}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16171C] transition-colors"
            title="Cerrar Menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Acceso Rápido / Búsqueda Global */}
      <div className="p-3 border-b border-[#0F1014] shrink-0">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-[#08090C] hover:bg-[#0E1015] hover:text-white rounded-lg border border-[#17181F] shadow-xs transition-colors">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="truncate">Buscar carpeta o DNI...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#000000] text-slate-400 border border-[#17181F] rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Botones de Alta Rápida */}
      <div className="px-3 pt-3 space-y-1.5 shrink-0">
        <Link
          href="/propiedades/nueva"
          onClick={closeMobileNav}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-black text-white bg-gradient-to-r from-[#004D40] via-[#00695C] to-[#10B981] hover:brightness-110 rounded-lg shadow-md transition-all active:scale-[0.98]"
        >
          <Building className="w-4 h-4 text-white" />
          <span>+ Nueva Propiedad</span>
        </Link>

        <Link
          href="/contratos/nuevo"
          onClick={closeMobileNav}
          className="flex items-center justify-center gap-2 w-full py-1.5 px-3 text-xs font-bold text-[#34D399] bg-[#08090C] hover:bg-[#0E1015] border border-[#10B981]/30 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#10B981]" />
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
                      onClick={closeMobileNav}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-gradient-to-r from-[#00382E] to-[#001D17] text-white font-bold shadow-md border-l-4 border-[#10B981]"
                          : "text-slate-400 hover:bg-[#08090C] hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive
                              ? "text-[#34D399]"
                              : "text-slate-500 group-hover:text-[#10B981]"
                          )}
                        />
                        <span>{item.label}</span>
                      </span>

                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-bold border",
                            item.badgeVariant === "warning"
                              ? "bg-amber-950/70 text-amber-300 border-amber-800/60"
                              : item.badgeVariant === "danger"
                              ? "bg-rose-950/70 text-rose-300 border-rose-800/60"
                              : "bg-[#004D40]/80 text-[#34D399] border border-[#10B981]/50"
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

      {/* Botón de Instalación PWA (Windows & Móvil) */}
      {!isInstalled && (
        <div className="px-3 pb-2 shrink-0">
          <button
            onClick={installApp}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[#34D399] bg-[#004D40]/40 hover:bg-[#004D40]/70 border border-[#10B981]/40 rounded-xl shadow-sm transition-all cursor-pointer group"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
            <span>Instalar App DeusX</span>
          </button>
        </div>
      )}

      {/* Footer Info / Estado del Sistema */}
      <div className="p-3 border-t border-[#0F1014] bg-[#000000] shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Supabase RLS Activo</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">v1.2.0</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. SIDEBAR DESKTOP (Docked permanentemente a partir de pantallas medianas md:) */}
      <aside className="hidden md:flex w-64 bg-[#030304] text-slate-300 flex-col shrink-0 h-screen sticky top-0 select-none border-r border-[#0F1014] shadow-2xl">
        {renderNavContent(false)}
      </aside>

      {/* 2. SIDEBAR MOBILE DRAWER (Deslizable y colapsable en celulares) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop con desenfoque suave */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              closeMobileNav();
            }}
          />

          {/* Panel Lateral Drawer Deslizable */}
          <div
            className="relative w-72 max-w-[85vw] bg-[#030304] text-slate-300 flex flex-col h-full shadow-2xl border-r border-[#17181F] animate-in slide-in-from-left duration-200 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
