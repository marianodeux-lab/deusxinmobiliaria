"use client";

import React from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  UserCheck, 
  Bell, 
  Building2, 
  ChevronDown, 
  Globe 
} from "lucide-react";

interface MacroIndicatorProps {
  label: string;
  value: string;
  date: string;
  trend?: "up" | "neutral" | "down";
}

function MacroIndicator({ label, value, date, trend = "up" }: MacroIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0F1A2A] border border-slate-800 rounded-lg text-xs shadow-2xs">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="font-mono tabular-nums font-bold text-slate-100">{value}</span>
      <span className="text-[10px] text-slate-500">({date})</span>
    </div>
  );
}

export function TopBar() {
  return (
    <header className="h-16 border-b border-slate-800/90 bg-[#070c14]/90 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between text-slate-200">
      {/* Indicadores Económicos Oficiales (Ticker en cabecera) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Índices:</span>
        </div>
        <MacroIndicator label="ICL" value="14.82" date="Octubre" />
        <MacroIndicator label="IPC" value="3.9%" date="Mensual" />
        <MacroIndicator label="UVA" value="$ 1.485,20" date="Hoy" />
        <MacroIndicator label="USD Blue" value="$ 1.385" date="Venta" />
        <MacroIndicator label="USD Oficial" value="$ 1.080" date="BNA" />
      </div>

      {/* Alertas Operativas y Perfil del Tenant */}
      <div className="flex items-center gap-3 pl-4">
        {/* Badges de Alerta Operativa & Vidriera Online */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/portal/deus-propiedades"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-[#004d40] to-teal-900 text-emerald-300 hover:text-white border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Mi Vidriera Online</span>
          </Link>

          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Liquidaciones Pendientes: <strong className="tabular-nums font-mono">3</strong>
          </button>
          
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50 transition-colors">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Vencimientos en 90d: <strong className="tabular-nums font-mono">2</strong>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        {/* Tenant Activo & Usuario */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer hover:bg-[#0F1A2A] px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-xs">
            <img src="/Recursos/icons/icon-192x192.png" alt="DX" className="w-5 h-5 object-contain" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-100 leading-tight">DeusX Inmobiliarias</p>
            <p className="text-[10px] text-emerald-400 leading-tight">Mariano (Administrador)</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
