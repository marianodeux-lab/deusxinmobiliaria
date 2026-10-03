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
    <div className="flex items-center gap-2 px-3 py-1 bg-white/70 border border-slate-200/90 rounded-md text-xs shadow-xs">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="font-mono tabular-nums font-bold text-slate-800">{value}</span>
      <span className="text-[10px] text-slate-600">({date})</span>
    </div>
  );
}

export function TopBar() {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
      {/* Indicadores Económicos Oficiales (Ticker en cabecera para el operador) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mr-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
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
        {/* Badges de Alerta Operativa Inmediata (Estilo SPOT pero limpios) */}
        <div className="hidden lg:flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Liquidaciones Pendientes: <strong className="tabular-nums font-mono">3</strong>
          </button>
          
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Fin de Período / Vencen: <strong className="tabular-nums font-mono">2</strong>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Tenant Activo & Usuario */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-xs shadow-xs">
            DX
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">DeusX Inmobiliarias</p>
            <p className="text-[10px] text-slate-600 leading-tight">Mariano (Administrador)</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>
    </header>
  );
}
