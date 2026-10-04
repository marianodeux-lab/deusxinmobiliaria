"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Calculator,
  Search,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  User,
  Building,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IndicePunto,
  ContratoParaAjuste,
  IndicesKpis,
  calcularAjusteAction,
  aplicarAjusteAContratoAction,
  guardarIndiceManualAction,
} from "@/modules/indices/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

export function getIndiceColorProps(tipo: string) {
  const upper = tipo?.toUpperCase() || "";
  if (upper.includes("ICL")) {
    return {
      badge: "bg-amber-950/60 text-[#FBBF24] border border-amber-500/40",
      text: "text-[#FBBF24]",
      val: "text-[#FDE68A]",
      border: "border-amber-500/35",
      bgSubtle: "bg-amber-950/20",
      name: "ICL (BCRA)"
    };
  }
  if (upper.includes("IPC")) {
    return {
      badge: "bg-orange-950/60 text-[#FB923C] border border-orange-500/40",
      text: "text-[#FB923C]",
      val: "text-[#FED7AA]",
      border: "border-orange-500/35",
      bgSubtle: "bg-orange-950/20",
      name: "IPC (INDEC)"
    };
  }
  if (upper.includes("UVA")) {
    return {
      badge: "bg-purple-950/60 text-[#C084FC] border border-purple-500/40",
      text: "text-[#C084FC]",
      val: "text-[#E9D5FF]",
      border: "border-purple-500/35",
      bgSubtle: "bg-purple-950/20",
      name: "UVA (BCRA)"
    };
  }
  if (upper.includes("BLUE")) {
    return {
      badge: "bg-sky-950/60 text-[#38BDF8] border border-sky-500/40",
      text: "text-[#38BDF8]",
      val: "text-[#BAE6FD]",
      border: "border-sky-500/35",
      bgSubtle: "bg-sky-950/20",
      name: "USD Blue"
    };
  }
  if (upper.includes("OFICIAL")) {
    return {
      badge: "bg-emerald-950/60 text-[#34D399] border border-emerald-500/40",
      text: "text-[#34D399]",
      val: "text-[#A7F3D0]",
      border: "border-emerald-500/35",
      bgSubtle: "bg-emerald-950/20",
      name: "USD Oficial"
    };
  }
  return {
    badge: "bg-slate-800 text-slate-300 border border-slate-700",
    text: "text-slate-200",
    val: "text-white",
    border: "border-slate-700",
    bgSubtle: "bg-slate-900/40",
    name: tipo
  };
}

interface IndicesHubProps {
  initialIndices: IndicePunto[];
  initialContratos: ContratoParaAjuste[];
  initialKpis: IndicesKpis;
}

export function IndicesHub({
  initialIndices,
  initialContratos,
  initialKpis,
}: IndicesHubProps) {
  const [indices, setIndices] = useState<IndicePunto[]>(initialIndices);
  const [contratos, setContratos] = useState<ContratoParaAjuste[]>(initialContratos);
  const [kpis, setKpis] = useState<IndicesKpis>(initialKpis);

  const [activeTab, setActiveTab] = useState<"calculadora" | "pendientes" | "series">("calculadora");

  // Estados de Calculadora de Indexación
  const [calcMonto, setCalcMonto] = useState<number>(450000);
  const [calcIndice, setCalcIndice] = useState<"ICL" | "IPC" | "UVA">("ICL");
  const [calcFechaIni, setCalcFechaIni] = useState("2026-03-01");
  const [calcFechaFin, setCalcFechaFin] = useState("2026-10-01");
  const [calcResult, setCalcResult] = useState<{
    coeficiente: number;
    nuevoMonto: number;
    porcentajeVariacion: number;
    valorIni: number;
    valFin: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Estados para modal de ajuste de contrato
  const [selectedContratoAjuste, setSelectedContratoAjuste] = useState<ContratoParaAjuste | null>(null);
  const [isCrearIndiceOpen, setIsCrearIndiceOpen] = useState(false);

  // Ejecutar cálculo interactivo
  const handleCalcular = async () => {
    setIsCalculating(true);
    try {
      const res = await calcularAjusteAction(calcMonto, calcIndice, calcFechaIni, calcFechaFin);
      if (res.success) {
        setCalcResult({
          coeficiente: res.coeficiente,
          nuevoMonto: res.nuevoMonto,
          porcentajeVariacion: res.porcentajeVariacion,
          valorIni: res.valorIndiceInicial,
          valFin: res.valorIndiceFinal,
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Filtrado de contratos pendientes
  const [searchContratos, setSearchContratos] = useState("");
  const filteredContratos = useMemo(() => {
    return contratos.filter((c) => {
      if (searchContratos.trim()) {
        const q = searchContratos.toLowerCase();
        const matchCarpeta = c.carpeta_numero.toLowerCase().includes(q);
        const matchDir = c.direccion_inmueble.toLowerCase().includes(q);
        const matchInq = c.inquilino_nombre?.toLowerCase().includes(q);
        return matchCarpeta || matchDir || matchInq;
      }
      return true;
    });
  }, [contratos, searchContratos]);

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-teal-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-[#004d40]">
              <LineChart className="w-6 h-6 text-[#004d40]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Índices Económicos & Motor de Indexación
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                  BCRA · INDEC
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Cálculo oficial de indexación de contratos locativos (ICL, IPC, UVA post-DNU 70/2023) y cotizaciones de divisas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("calculadora")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "calculadora"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculadora de Ajuste
            </button>
            <button
              onClick={() => setActiveTab("pendientes")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 relative",
                activeTab === "pendientes"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Contratos a Indexar
              {kpis.contratosPendientesAjuste > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {kpis.contratosPendientesAjuste}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("series")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "series"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Series Oficiales ({indices.length})
            </button>
          </div>

          <button
            onClick={() => setIsCrearIndiceOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Cargar Dato
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* ICL: Dorado */}
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-amber-500/35 shadow-[0_0_12px_-3px_rgba(245,158,11,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FBBF24]">ICL (BCRA)</span>
            <span className="text-[10px] font-bold text-[#FDE68A] bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/40">
              +{kpis.iclVariacionInteranual}% i.a.
            </span>
          </div>
          <div className="text-2xl font-black text-[#FBBF24] mt-2 font-mono">
            {kpis.iclUltimo.toFixed(2)}
          </div>
          <div className="text-[11px] text-amber-200/70 mt-0.5 font-medium">
            Índice Contratos de Locación
          </div>
        </div>

        {/* IPC: Naranja */}
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-orange-500/35 shadow-[0_0_12px_-3px_rgba(249,115,22,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FB923C]">IPC (INDEC)</span>
            <span className="text-[10px] font-bold text-[#FED7AA] bg-orange-950/70 px-1.5 py-0.5 rounded border border-orange-500/40">
              +{kpis.ipcVariacionMensual}% m/m
            </span>
          </div>
          <div className="text-2xl font-black text-[#FB923C] mt-2 font-mono">
            {kpis.ipcUltimo.toFixed(1)}
          </div>
          <div className="text-[11px] text-orange-200/70 mt-0.5 font-medium">
            Inflación Minorista Oficial
          </div>
        </div>

        {/* UVA: Morado */}
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-purple-500/35 shadow-[0_0_12px_-3px_rgba(168,85,247,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C084FC]">UVA (BCRA)</span>
            <div className="w-6 h-6 rounded-lg bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-[#C084FC]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#C084FC] mt-2 font-mono">
            ${kpis.uvaUltimo.toFixed(2)}
          </div>
          <div className="text-[11px] text-purple-200/70 mt-0.5 font-medium">
            Unidad de Valor Adquisitivo
          </div>
        </div>

        {/* Dólar Oficial (Verde) / Blue (Azul) */}
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-sky-500/35 shadow-[0_0_12px_-3px_rgba(56,189,248,0.12)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-[#34D399]">USD Oficial</span>
              <span className="text-slate-500">/</span>
              <span className="text-[#38BDF8]">Blue</span>
            </div>
            <div className="w-6 h-6 rounded-lg bg-sky-950/70 border border-sky-500/40 flex items-center justify-center text-[#38BDF8]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black mt-2 font-mono flex items-baseline gap-1.5">
            <span className="text-[#34D399] font-bold">${kpis.usdOficial}</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-[#38BDF8] font-bold">${kpis.usdBlue}</span>
          </div>
          <div className="text-[11px] text-sky-200/80 mt-0.5 font-medium">
            Brecha: {Math.round(((kpis.usdBlue - kpis.usdOficial) / kpis.usdOficial) * 100)}%
          </div>
        </div>

        {/* Ajustes Requeridos */}
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-amber-500/35 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200">Ajustes Requeridos</span>
            <div className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
            {kpis.contratosPendientesAjuste} Carpetas
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Período cumplido para actualizar
          </div>
        </div>
      </div>

      {/* VISTA 1: CALCULADORA DE INDEXACIÓN */}
      {activeTab === "calculadora" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Panel Izquierdo: Formulario de Parámetros */}
          <div className="md:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-lg bg-[#E0F2F1] text-[#004d40]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Simulador de Indexación Locativa
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cálculo automático de coeficiente según normativa vigente
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Monto Actual de Alquiler (ARS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={calcMonto}
                    onChange={(e) => setCalcMonto(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Índice de Contrato
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ICL", "IPC", "UVA"] as const).map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setCalcIndice(ind)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all border",
                        calcIndice === ind
                          ? ind === "ICL"
                            ? "bg-amber-950/60 text-[#FBBF24] border-amber-500 shadow-sm"
                            : ind === "IPC"
                            ? "bg-orange-950/60 text-[#FB923C] border-orange-500 shadow-sm"
                            : "bg-purple-950/60 text-[#C084FC] border-purple-500 shadow-sm"
                          : ind === "ICL"
                          ? "bg-[#141519] text-slate-400 border-[#262832] hover:bg-[#1E1F26] hover:text-[#FBBF24] hover:border-amber-500/30"
                          : ind === "IPC"
                          ? "bg-[#141519] text-slate-400 border-[#262832] hover:bg-[#1E1F26] hover:text-[#FB923C] hover:border-orange-500/30"
                          : "bg-[#141519] text-slate-400 border-[#262832] hover:bg-[#1E1F26] hover:text-[#C084FC] hover:border-purple-500/30"
                      )}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Fecha Inicial (Base)</label>
                  <input
                    type="date"
                    value={calcFechaIni}
                    onChange={(e) => setCalcFechaIni(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Fecha de Ajuste</label>
                  <input
                    type="date"
                    value={calcFechaFin}
                    onChange={(e) => setCalcFechaFin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>
              </div>

              <button
                disabled={isCalculating}
                onClick={handleCalcular}
                className="w-full py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {isCalculating ? "Calculando..." : "Calcular Nuevo Alquiler"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Derecho: Resultado y Plantilla de Notificación */}
          <div className="md:col-span-7 space-y-4">
            {calcResult ? (
              <div className={cn(
                "rounded-xl border shadow-xs p-6 space-y-5 bg-[#1C1D23]",
                calcIndice === "ICL"
                  ? "border-amber-500/40"
                  : calcIndice === "IPC"
                  ? "border-orange-500/40"
                  : "border-purple-500/40"
              )}>
                <div className="flex items-center justify-between border-b border-[#262832] pb-4">
                  <div>
                    <span className={cn(
                      "text-[11px] font-bold uppercase block tracking-wider",
                      calcIndice === "ICL"
                        ? "text-[#FBBF24]"
                        : calcIndice === "IPC"
                        ? "text-[#FB923C]"
                        : "text-[#C084FC]"
                    )}>
                      Resultado de Indexación ({calcIndice})
                    </span>
                    <h3 className="text-2xl font-black text-white font-mono mt-1">
                      ${calcResult.nuevoMonto.toLocaleString("es-AR")}
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full ml-2 border",
                        calcIndice === "ICL"
                          ? "text-[#FDE68A] bg-amber-950/70 border-amber-500/40"
                          : calcIndice === "IPC"
                          ? "text-[#FED7AA] bg-orange-950/70 border-orange-500/40"
                          : "text-[#E9D5FF] bg-purple-950/70 border-purple-500/40"
                      )}>
                        +{calcResult.porcentajeVariacion}%
                      </span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Diferencia mensual</span>
                    <span className="text-sm font-bold text-[#34D399] font-mono">
                      +${(calcResult.nuevoMonto - calcMonto).toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Parámetros Técnicos */}
                <div className="grid grid-cols-3 gap-3 text-xs bg-[#141519] p-3.5 rounded-xl border border-[#262832]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Índice Inicial ({calcFechaIni})
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {calcResult.valorIni}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Índice Final ({calcFechaFin})
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {calcResult.valFin}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Coeficiente Multiplicador
                    </span>
                    <span className={cn(
                      "font-mono font-black",
                      calcIndice === "ICL"
                        ? "text-[#FBBF24]"
                        : calcIndice === "IPC"
                        ? "text-[#FB923C]"
                        : "text-[#C084FC]"
                    )}>
                      {calcResult.coeficiente.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Notificación para enviar al inquilino / propietario */}
                <div className={cn(
                  "p-4 rounded-xl border space-y-3",
                  calcIndice === "ICL"
                    ? "bg-amber-950/20 border-amber-500/30"
                    : calcIndice === "IPC"
                    ? "bg-orange-950/20 border-orange-500/30"
                    : "bg-purple-950/20 border-purple-500/30"
                )}>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[11px] font-extrabold uppercase tracking-wide",
                      calcIndice === "ICL"
                        ? "text-[#FBBF24]"
                        : calcIndice === "IPC"
                        ? "text-[#FB923C]"
                        : "text-[#C084FC]"
                    )}>
                      Texto de Notificación de Actualización
                    </span>
                    <button
                      onClick={() => {
                        const txt = `Estimado/a Inquilino/a: Le notificamos la actualización de su contrato de locación según índice ${calcIndice}. El valor anterior de $${calcMonto.toLocaleString("es-AR")} se incrementa a $${calcResult.nuevoMonto.toLocaleString("es-AR")} (+${calcResult.porcentajeVariacion}%) para los próximos meses. DeusX Inmobiliaria.`;
                        navigator.clipboard.writeText(txt);
                        setCopiedNotification(true);
                        setTimeout(() => setCopiedNotification(false), 2000);
                      }}
                      className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded border transition-colors",
                        calcIndice === "ICL"
                          ? "bg-[#141519] text-[#FBBF24] border-amber-500/40 hover:bg-amber-950/50"
                          : calcIndice === "IPC"
                          ? "bg-[#141519] text-[#FB923C] border-orange-500/40 hover:bg-orange-950/50"
                          : "bg-[#141519] text-[#C084FC] border-purple-500/40 hover:bg-purple-950/50"
                      )}
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar Texto
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 bg-[#141519] p-3 rounded-lg border border-[#262832] leading-relaxed font-mono">
                    "Estimado/a: Le notificamos la actualización de su canon locativo según índice {calcIndice} ({calcResult.valorIni} → {calcResult.valFin}). Su nuevo valor mensual a partir del período corriente es de ${calcResult.nuevoMonto.toLocaleString("es-AR")} (variación del {calcResult.porcentajeVariacion}%). Atentamente, DeusX Inmobiliaria."
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-2">
                <Calculator className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-500">
                  Completá los datos a la izquierda y hacé clic en "Calcular Nuevo Alquiler".
                </p>
                <p className="text-[11px] text-slate-400">
                  El sistema cruzará la serie histórica oficial en Supabase y generará la liquidación exacta.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: CONTRATOS PENDIENTES DE INDEXACIÓN */}
      {activeTab === "pendientes" && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por carpeta, inquilino o dirección..."
                value={searchContratos}
                onChange={(e) => setSearchContratos(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:bg-white"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              {filteredContratos.length} Contratos Vigentes Evaluados
            </span>
          </div>

          <div className="bg-[#1C1D23] rounded-xl border border-[#262832] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#101115] border-b border-[#262832] text-[11px] font-bold text-slate-100 uppercase tracking-wider">
                    <th className="py-3 px-4">Carpeta & Inmueble</th>
                    <th className="py-3 px-4">Inquilino</th>
                    <th className="py-3 px-4">Índice & Frecuencia</th>
                    <th className="py-3 px-4">Canon Actual</th>
                    <th className="py-3 px-4">Último Ajuste</th>
                    <th className="py-3 px-4">Estado Indexación</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredContratos.map((c) => (
                    <tr key={c.id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          Carpeta #{c.carpeta_numero}
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {c.direccion_inmueble}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{c.inquilino_nombre}</div>
                        {c.inquilino_telefono && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {c.inquilino_telefono}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded text-xs font-bold border",
                          getIndiceColorProps(c.tipo_ajuste).badge
                        )}>
                          {c.tipo_ajuste} ({c.frecuencia_meses} meses)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        ${c.valor_actual.toLocaleString("es-AR")}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                        {c.fecha_ultimo_ajuste || c.fecha_inicio}
                        <span className="block text-[10px] text-slate-400">
                          hace {c.meses_desde_ajuste} meses
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.debe_ajustar ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-2.5 h-2.5" /> Requiere Ajuste
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Al Día
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.inquilino_telefono && (
                            <a
                              href={buildWhatsAppLink(
                                c.inquilino_telefono,
                                `Hola ${c.inquilino_nombre}, te contactamos de DeusX Inmobiliaria sobre la próxima actualización de alquiler de Carpeta #${c.carpeta_numero}.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Avisar por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedContratoAjuste(c)}
                            className="px-2.5 py-1 text-xs font-bold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-md transition-colors"
                          >
                            Indexar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: SERIES HISTÓRICAS OFICIALES */}
      {activeTab === "series" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Puntos de Series Económicas Almacenadas
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Base histórica cargada en Supabase para el cálculo retroactivo de contratos.
              </p>
            </div>
            <button
              onClick={() => setIsCrearIndiceOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[#004d40] text-white rounded-lg hover:bg-[#00382e]"
            >
              + Agregar Punto
            </button>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#101115] z-10">
                <tr className="border-b border-[#262832] text-[11px] font-bold text-slate-100 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Índice</th>
                  <th className="py-2.5 px-4">Fecha de Publicación</th>
                  <th className="py-2.5 px-4">Valor Registrado</th>
                  <th className="py-2.5 px-4">Organismo / Fuente Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {indices.map((ind) => {
                  const colorProps = getIndiceColorProps(ind.tipo_indice);
                  return (
                    <tr key={ind.id} className="hover:bg-[#141519]/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className={cn("font-sans font-bold px-2.5 py-1 rounded text-xs", colorProps.badge)}>
                          {ind.tipo_indice}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{ind.fecha}</td>
                      <td className={cn("py-2.5 px-4 font-bold text-sm font-mono", colorProps.val)}>
                        {ind.tipo_indice.includes("USD") || ind.tipo_indice === "UVA" ? "$" : ""}
                        {ind.valor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        {ind.fuente}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL INDEXAR CONTRATO ESPECÍFICO */}
      {selectedContratoAjuste && (
        <ModalIndexarContrato
          contrato={selectedContratoAjuste}
          onClose={() => setSelectedContratoAjuste(null)}
          onApplied={() => {
            setSelectedContratoAjuste(null);
            window.location.reload();
          }}
        />
      )}

      {/* MODAL CARGA MANUAL DE ÍNDICE */}
      {isCrearIndiceOpen && (
        <ModalCargarIndice
          isOpen={isCrearIndiceOpen}
          onClose={() => setIsCrearIndiceOpen(false)}
          onCreated={() => {
            setIsCrearIndiceOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL PARA APLICAR AJUSTE AL CONTRATO
// -----------------------------------------------------------------------------

function ModalIndexarContrato({
  contrato,
  onClose,
  onApplied,
}: {
  contrato: ContratoParaAjuste;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [nuevoMonto, setNuevoMonto] = useState<number>(Math.round(contrato.valor_actual * 1.476));
  const [coeficiente, setCoeficiente] = useState<number>(1.476164);
  const [valorIndice, setValorIndice] = useState<number>(26.94);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await aplicarAjusteAContratoAction(
        contrato.id,
        Number(nuevoMonto),
        contrato.tipo_ajuste,
        Number(valorIndice),
        Number(coeficiente)
      );

      if (res.success) {
        alert(
          `¡Ajuste aplicado con éxito! El nuevo valor locativo de Carpeta #${contrato.carpeta_numero} es de $${nuevoMonto.toLocaleString("es-AR")}. Se actualizó el período pendiente en Cobranzas.`
        );
        onApplied();
      } else {
        alert("Error al aplicar: " + res.error);
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E0F2F1] text-[#004d40]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Indexar Carpeta #{contrato.carpeta_numero}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {contrato.direccion_inmueble}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                Valor Actual
              </span>
              <span className="font-bold text-slate-800 text-sm">
                ${contrato.valor_actual.toLocaleString("es-AR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                Índice Pactado
              </span>
              <span className={cn(
                "font-bold text-xs px-2.5 py-1 rounded border inline-block mt-1",
                getIndiceColorProps(contrato.tipo_ajuste).badge
              )}>
                {contrato.tipo_ajuste} (cada {contrato.frecuencia_meses} meses)
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              Nuevo Valor Locativo Calculado (ARS) *
            </label>
            <input
              type="number"
              value={nuevoMonto}
              onChange={(e) => setNuevoMonto(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-base text-emerald-700 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Variación calculada: +
              {Math.round(((nuevoMonto - contrato.valor_actual) / contrato.valor_actual) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Coeficiente Multiplicador</label>
              <input
                type="number"
                step="0.000001"
                value={coeficiente}
                onChange={(e) => setCoeficiente(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Valor Índice al Ajuste</label>
              <input
                type="number"
                step="0.01"
                value={valorIndice}
                onChange={(e) => setValorIndice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            disabled={isApplying}
            onClick={handleApply}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white transition-colors disabled:opacity-50"
          >
            {isApplying ? "Aplicando..." : "Confirmar & Aplicar Ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL PARA CARGAR NUEVO PUNTO DE ÍNDICE
// -----------------------------------------------------------------------------

function ModalCargarIndice({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tipo, setTipo] = useState<any>("ICL");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [valor, setValor] = useState<number>(27.5);
  const [fuente, setFuente] = useState("Banco Central (BCRA)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await guardarIndiceManualAction(tipo, fecha, Number(valor), fuente);
      if (res.success) {
        onCreated();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#004d40]" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Registrar Nuevo Valor Oficial
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Tipo de Índice</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
            >
              <option value="ICL">ICL (Índice Contratos de Locación - BCRA)</option>
              <option value="IPC">IPC (Inflación Minorista - INDEC)</option>
              <option value="UVA">UVA (Unidad Valor Adquisitivo - BCRA)</option>
              <option value="USD_OFICIAL">Dólar Oficial (BNA)</option>
              <option value="USD_BLUE">Dólar Blue</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Fecha de Publicación</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Valor Oficial</label>
              <input
                type="number"
                step="0.0001"
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Fuente / Organismo</label>
            <input
              type="text"
              value={fuente}
              onChange={(e) => setFuente(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
