"use client";

import React from "react";
import { 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  UserCheck, 
  Bell, 
  Building2,
  ChevronDown
} from "lucide-react";

interface MacroIndicatorProps {
  label: string;
  value: string;
  date: string;
  trend?: "up" | "neutral" | "down";
}

function MacroIndicator({ label, value, date, trend = "up" }: MacroIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 border border-slate-200 rounded-lg text-xs shadow-2xs">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-mono tabular-nums font-bold text-slate-800">{value}</span>
      <span className="text-[10px] text-slate-400">({date})</span>
    </div>
  );
}

export function TopBar() {
  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/70 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
      {/* Indicadores Económicos Oficiales (Ticker en cabecera) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-[#26a69a]" />
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
        {/* Badges de Alerta Operativa */}
        <div className="hidden lg:flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Liquidaciones Pendientes: <strong className="tabular-nums font-mono">3</strong>
          </button>
          
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100 transition-colors">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Vencimientos en 90d: <strong className="tabular-nums font-mono">2</strong>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Tenant Activo & Usuario */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer hover:bg-white px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xs">
            <img src="/Recursos/icons/icon-192x192.png" alt="DX" className="w-5 h-5 object-contain" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">DeusX Inmobiliarias</p>
            <p className="text-[10px] text-slate-500 leading-tight">Mariano (Administrador)</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
