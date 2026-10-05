"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Search,
  Filter,
  Download,
  Receipt,
  Wallet,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  Phone,
  FileText,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { generarReciboPdf } from "@/lib/pdf/reciboGenerator";
import {
  PeriodoCobranzaItem,
  CobranzasKpis,
  HistorialReciboItem,
  registrarCobranzaAction,
  getPeriodosCobranzaAction,
  getHistorialRecibosAction,
} from "@/modules/cobranzas/actions";
import {
  buildWhatsAppLink,
  crearMensajeReciboAlquiler,
  crearMensajeAvisoVencimiento,
  crearMensajeLiquidacionPropietario,
} from "@/lib/whatsapp/whatsappHelper";

interface CobranzasHubProps {
  initialItems: PeriodoCobranzaItem[];
  initialKpis: CobranzasKpis;
  initialPeriodo: { mes: number; anio: number };
  initialHistorial: HistorialReciboItem[];
}

const MESES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function CobranzasHub({
  initialItems,
  initialKpis,
  initialPeriodo,
  initialHistorial,
}: CobranzasHubProps) {
  const [activeTab, setActiveTab] = useState<"periodos" | "historial">("periodos");
  const [filterStatus, setFilterStatus] = useState<"todos" | "pendientes" | "mora" | "cobrados" | "a_rendir">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const [periodo, setPeriodo] = useState(initialPeriodo);
  const [items, setItems] = useState<PeriodoCobranzaItem[]>(initialItems);
  const [kpis, setKpis] = useState<CobranzasKpis>(initialKpis);
  const [historial, setHistorial] = useState<HistorialReciboItem[]>(initialHistorial);

  const [isPending, startTransition] = useTransition();
  const [selectedPeriodoForCobro, setSelectedPeriodoForCobro] = useState<PeriodoCobranzaItem | null>(null);

  // Cambiar de mes / año
  const cambiarPeriodo = (nuevoMes: number, nuevoAnio: number) => {
    let m = nuevoMes;
    let a = nuevoAnio;

    if (m < 1) {
      m = 12;
      a -= 1;
    } else if (m > 12) {
      m = 1;
      a += 1;
    }

    setPeriodo({ mes: m, anio: a });

    startTransition(async () => {
      const res = await getPeriodosCobranzaAction({ mes: m, anio: a });
      if (res.success) {
        setItems(res.items);
        setKpis(res.kpis);
      }
    });
  };

  // Filtrado de la lista
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filtro de Estado
      if (filterStatus === "pendientes" && item.estado_cobranza !== "pendiente") return false;
      if (filterStatus === "mora" && item.estado_cobranza !== "mora") return false;
      if (filterStatus === "cobrados" && item.estado_cobranza !== "cobrado") return false;
      if (filterStatus === "a_rendir" && (item.estado_cobranza !== "cobrado" || item.estado_liquidacion === "liquidado")) return false;

      // Filtro de Búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCarpeta = item.carpeta_numero.toLowerCase().includes(query);
        const matchInquilino = item.inquilino.nombre.toLowerCase().includes(query) || item.inquilino.documento.includes(query);
        const matchDireccion = item.inmueble.direccion.toLowerCase().includes(query);
        const matchPropietario = item.propietario.nombre.toLowerCase().includes(query);
        return matchCarpeta || matchInquilino || matchDireccion || matchPropietario;
      }

      return true;
    });
  }, [items, filterStatus, searchQuery]);

  // Manejar éxito de cobranza
  const handleCobranzaSuccess = (periodoId: string, reciboNum: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === periodoId
          ? {
              ...it,
              estado_cobranza: "cobrado",
              dias_mora: 0,
              recibo_emitido: {
                numero: reciboNum,
                fecha: new Date().toISOString().split("T")[0],
                medio_pago: "transferencia",
              },
            }
          : it
      )
    );

    // Recargar historial
    getHistorialRecibosAction().then((h) => {
      if (h.success) setHistorial(h.recibos);
    });
  };

  // Descarga del Recibo X PDF existente
  const handleDescargarReciboExistente = (item: PeriodoCobranzaItem) => {
    generarReciboPdf({
      numeroRecibo: item.recibo_emitido?.numero || `0001-${item.id.slice(-6)}`,
      fechaEmision: item.recibo_emitido?.fecha || item.fecha_vencimiento,
      carpetaNumero: item.carpeta_numero,
      inmobiliaria: {
        nombre: "Mi Inmobiliaria",
        cuit: "30-00000000-0",
        domicilio: "Domicilio Comercial",
        localidad: "Ciudad",
        telefono: "",
        matricula: "Col. Martilleros",
        condicionIva: "Monotributo",
      },
      inquilino: {
        nombre: item.inquilino.nombre,
        documento: item.inquilino.documento,
        telefono: item.inquilino.telefono,
      },
      propietario: {
        nombre: item.propietario.nombre,
        documento: item.propietario.documento,
      },
      inmueble: {
        direccion: item.inmueble.direccion,
        localidad: item.inmueble.localidad,
      },
      periodoMesAnio: `${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`,
      conceptos: [
        { detalle: `Canon locativo correspondiente a ${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`, importe: item.monto_alquiler },
        ...(item.monto_expensas > 0 ? [{ detalle: "Expensas ordinarias", importe: item.monto_expensas }] : []),
        ...(item.monto_servicios > 0 ? [{ detalle: "Servicios e impuestos", importe: item.monto_servicios }] : []),
        ...(item.monto_punitorios > 0 ? [{ detalle: "Intereses punitorios por mora", importe: item.monto_punitorios }] : []),
      ],
      total: item.total_exigible,
      moneda: item.moneda,
      medioPago: item.recibo_emitido?.medio_pago || "Transferencia Bancaria",
    });
  };

  // Exportar a CSV
  const handleExportCsv = () => {
    const headers = ["Carpeta", "Inmueble", "Inquilino", "DNI", "Alquiler", "Expensas", "Servicios", "Punitorios", "Total", "Estado", "Vencimiento"];
    const rows = filteredItems.map((i) => [
      `#${i.carpeta_numero}`,
      `"${i.inmueble.direccion}"`,
      `"${i.inquilino.nombre}"`,
      i.inquilino.documento,
      i.monto_alquiler,
      i.monto_expensas,
      i.monto_servicios,
      i.monto_punitorios,
      i.total_exigible,
      i.estado_cobranza.toUpperCase(),
      i.fecha_vencimiento,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cobranzas_${MESES_NOMBRES[periodo.mes - 1]}_${periodo.anio}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER PRINCIPAL CON SELECTOR DE PERÍODO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E0F2F1] text-[#004d40]">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Módulo de Cobranzas a Inquilinos
              </h1>
              <p className="text-xs text-slate-500">
                Control de vencimientos mensuales, emisión de Recibos X (RG AFIP 4004-E) y avisos automáticos por WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Período y Botón de Recarga */}
        <div className="flex items-center gap-2">
          {/* Navegador Mes Anterior / Siguiente */}
          <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => cambiarPeriodo(periodo.mes - 1, periodo.anio)}
              disabled={isPending}
              title="Mes Anterior"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#004d40]" />
              <span>{MESES_NOMBRES[periodo.mes - 1]} {periodo.anio}</span>
            </div>

            <button
              onClick={() => cambiarPeriodo(periodo.mes + 1, periodo.anio)}
              disabled={isPending}
              title="Mes Siguiente"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => cambiarPeriodo(periodo.mes, periodo.anio)}
            disabled={isPending}
            title="Actualizar datos"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin text-[#004d40]")} />
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 2. TARJETAS KPI EJECUTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Exigible */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#262832] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total a Recaudar
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141519] text-slate-300 border border-[#262832] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalExigibleArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            {kpis.cantidadTotal} contratos devengados en el mes
          </div>
        </div>

        {/* KPI 2: Total Efectivizado / Cobrado */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#10B981]/35 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Cobrado / Recaudado
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-[#A7F3D0] bg-[#00382E] px-1.5 py-0.5 rounded border border-[#10B981]/40 whitespace-nowrap">
                {kpis.porcentajeCobrado}%
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-[#34D399] font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalCobradoArs, "ARS")}
          </div>
          {/* Barra de Progreso */}
          <div className="mt-2 w-full bg-[#101115] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#10B981] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.porcentajeCobrado)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            {kpis.cantidadCobrados} de {kpis.cantidadTotal} alquileres cancelados
          </div>
        </div>

        {/* KPI 3: Pendientes a Vencer */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-amber-500/35 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Pendientes de Cobro
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-700/50 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-amber-300 font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalPendienteArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 font-medium">
            {kpis.cantidadPendientes} contratos por vencer antes del día 10
          </div>
        </div>

        {/* KPI 4: Cartera en Mora */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-rose-500/35 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider">
              Cartera en Mora
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {kpis.cantidadMora > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 shrink-0 whitespace-nowrap">
                  {kpis.cantidadMora} en mora
                </span>
              )}
              <div className="w-7 h-7 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-700/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-rose-300 font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalMoraArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 font-medium">
            {kpis.cantidadMora === 0
              ? "0 atrasos registrados ¡Al día!"
              : `${kpis.cantidadMora} alquileres vencidos con punitorios`}
          </div>
        </div>
      </div>

      {/* 3. SWITCHER DE VISTAS (PERÍODOS VS HISTORIAL DE RECIBOS) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("periodos")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "periodos"
                ? "bg-[#004d40] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            Tablero de Cobranzas del Período ({filteredItems.length})
          </button>

          <button
            onClick={() => setActiveTab("historial")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "historial"
                ? "bg-[#004d40] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            Auditoría de Recibos Emitidos ({historial.length})
          </button>
        </div>

        {activeTab === "periodos" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Se han preparado los recordatorios de WhatsApp para los ${kpis.cantidadPendientes + kpis.cantidadMora} inquilinos con saldos pendientes.`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Avisos Masivos WhatsApp ({kpis.cantidadPendientes + kpis.cantidadMora})</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === "periodos" ? (
        <>
          {/* 4. BARRA DE FILTROS & BÚSQUEDA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Input de Búsqueda */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por Carpeta, Inquilino, Domicilio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-colors"
              />
            </div>

            {/* Píldoras de Filtro por Estado */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus("todos")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
                  filterStatus === "todos"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Todos ({items.length})
              </button>

              <button
                onClick={() => setFilterStatus("pendientes")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
                  filterStatus === "pendientes"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
                )}
              >
                <span>Pendientes</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/60 font-bold">
                  {kpis.cantidadPendientes}
                </span>
              </button>

              <button
                onClick={() => setFilterStatus("mora")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
                  filterStatus === "mora"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60"
                )}
              >
                <span>En Mora</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/60 font-bold">
                  {kpis.cantidadMora}
                </span>
              </button>

              <button
                onClick={() => setFilterStatus("cobrados")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
                  filterStatus === "cobrados"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
                )}
              >
                <span>Cobrados</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/60 font-bold">
                  {kpis.cantidadCobrados}
                </span>
              </button>

              <button
                onClick={() => setFilterStatus("a_rendir")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
                  filterStatus === "a_rendir"
                    ? "bg-teal-700 text-white"
                    : "bg-[#E0F2F1] text-[#004d40] hover:bg-teal-100"
                )}
              >
                <span>A Rendir</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#B2DFDB] font-bold">
                  {kpis.cantidadARendir}
                </span>
              </button>
            </div>
          </div>

          {/* 5. TABLA DE PERÍODOS DE COBRANZA */}
          <div className="bg-[#1C1D23] rounded-2xl border border-[#262832] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#101115] border-b border-[#262832] text-slate-100 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 min-w-[5.5rem] w-24">Carpeta</th>
                    <th className="py-3 px-4">Inmueble / Domicilio</th>
                    <th className="py-3 px-4">Inquilino (Locatario)</th>
                    <th className="py-3 px-4">Vencimiento</th>
                    <th className="py-3 px-4">Desglose & Total Exigible</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No se encontraron períodos que coincidan con el filtro</p>
                        <p className="text-xs text-slate-400 mt-1">Pruebe seleccionando otro mes o borrando los filtros de búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. CARPETA */}
                        <td className="py-3 px-3 align-top">
                          <span
                            title={`Carpeta #${item.carpeta_numero}`}
                            className="inline-flex items-center justify-center min-w-[2.25rem] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 font-mono font-bold text-xs shadow-2xs whitespace-nowrap"
                          >
                            #{item.carpeta_numero.length > 5 ? item.carpeta_numero.slice(-4) : item.carpeta_numero}
                          </span>
                        </td>

                        {/* 2. INMUEBLE */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-bold text-white">
                            {item.inmueble.direccion}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.inmueble.localidad}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Dueño: <span className="font-medium text-slate-300">{item.propietario.nombre}</span>
                          </div>
                        </td>

                        {/* 3. INQUILINO */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-semibold text-white">
                            {item.inquilino.nombre}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.inquilino.documento}
                          </div>
                          {item.inquilino.telefono && (
                            <a
                              href={buildWhatsAppLink(item.inquilino.telefono, `Hola ${item.inquilino.nombre}, le escribimos de DeusX Inmobiliaria respecto al alquiler de ${item.inmueble.direccion}.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-[#34D399] hover:text-white font-medium mt-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{item.inquilino.telefono}</span>
                            </a>
                          )}
                        </td>

                        {/* 4. VENCIMIENTO */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono font-medium text-slate-200">
                            {formatDate(item.fecha_vencimiento)}
                          </div>
                          {item.estado_cobranza === "mora" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/60 border border-rose-700/60 px-1.5 py-0.5 rounded mt-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              Atraso {item.dias_mora} días
                            </span>
                          )}
                          {item.estado_cobranza === "pendiente" && (
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Vence este mes
                            </span>
                          )}
                          {item.estado_cobranza === "cobrado" && (
                            <span className="text-[10px] text-[#34D399] font-medium mt-0.5 block">
                              Recibo Oficial Emitido
                            </span>
                          )}
                        </td>

                        {/* 5. DESGLOSE & TOTAL EXIGIBLE */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono font-extrabold text-white text-sm">
                            {formatCurrency(item.total_exigible, item.moneda)}
                          </div>
                          <div className="text-[10px] text-slate-300 mt-0.5 space-y-0.5">
                            <div>Alq: {formatCurrency(item.monto_alquiler, item.moneda)}</div>
                            {item.monto_expensas > 0 && <div>Exp: +{formatCurrency(item.monto_expensas, item.moneda)}</div>}
                            {item.monto_punitorios > 0 && (
                              <div className="text-rose-400 font-semibold">
                                Mora: +{formatCurrency(item.monto_punitorios, item.moneda)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. ESTADO */}
                        <td className="py-3 px-4 align-top">
                          {item.estado_cobranza === "cobrado" && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00382E] text-[#34D399] border border-[#10B981]/50 whitespace-nowrap shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                Cobrado
                              </span>
                              {item.recibo_emitido && (
                                <div className="text-[10px] font-mono text-slate-400 mt-1">
                                  Nº {item.recibo_emitido.numero}
                                </div>
                              )}
                            </div>
                          )}

                          {item.estado_cobranza === "pendiente" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-700/60 whitespace-nowrap shrink-0">
                              <Clock className="w-3 h-3 text-amber-400" />
                              Pendiente
                            </span>
                          )}

                          {item.estado_cobranza === "mora" && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-700/60 whitespace-nowrap shrink-0">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                En Mora ({item.dias_mora}d)
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 7. ACCIONES */}
                        <td className="py-3 px-4 text-right align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botón de WhatsApp según estado */}
                            <a
                              href={buildWhatsAppLink(
                                item.inquilino.telefono || "",
                                item.estado_cobranza === "cobrado"
                                  ? crearMensajeReciboAlquiler({
                                      inquilinoNombre: item.inquilino.nombre,
                                      carpetaNumero: item.carpeta_numero,
                                      direccion: item.inmueble.direccion,
                                      periodo: `${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`,
                                      montoTotal: formatCurrency(item.total_exigible, item.moneda),
                                      reciboNumero: item.recibo_emitido?.numero || `0001-${item.id.slice(-6)}`,
                                    })
                                  : crearMensajeAvisoVencimiento({
                                      inquilinoNombre: item.inquilino.nombre,
                                      carpetaNumero: item.carpeta_numero,
                                      direccion: item.inmueble.direccion,
                                      monto: formatCurrency(item.total_exigible, item.moneda),
                                      fechaVencimiento: formatDate(item.fecha_vencimiento),
                                      cbuAlias: item.propietario.cbu_alias,
                                    })
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={item.estado_cobranza === "cobrado" ? "Re-enviar Recibo por WhatsApp" : "Enviar Aviso / Reclamo de Pago por WhatsApp"}
                              className="p-1.5 text-[#34D399] hover:text-white hover:bg-[#00382E] rounded-lg transition-colors border border-[#10B981]/30"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* Botón de Cobranza o Ver Recibo */}
                            {item.estado_cobranza === "cobrado" ? (
                              <button
                                onClick={() => handleDescargarReciboExistente(item)}
                                title="Descargar Recibo X Oficial PDF"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#141519] hover:bg-[#1C1D23] text-slate-300 hover:text-white border border-[#262832] transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>Recibo PDF</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedPeriodoForCobro(item)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-[#004D40] to-[#10B981] hover:brightness-110 text-white shadow-2xs transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Cobrar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* VISTA: AUDITORÍA DE RECIBOS EMITIDOS */
        <div className="bg-[#1C1D23] rounded-2xl border border-[#262832] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#262832] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Historial Correlativo de Recibos X Emitidos
              </h3>
              <p className="text-xs text-slate-300">
                Libro de cobranzas con validez fiscal (Resolución General AFIP 4004-E).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#101115] border-b border-[#262832] text-slate-100 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Nº Comprobante</th>
                  <th className="py-3 px-4">Fecha Cobro</th>
                  <th className="py-3 px-4">Carpeta & Inmueble</th>
                  <th className="py-3 px-4">Inquilino</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4">Total Percibido</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No hay recibos emitidos registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  historial.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {rec.numero_recibo}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(rec.fecha_cobro)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800">#{rec.carpeta_numero}</span>
                        <span className="text-slate-500 ml-1">({rec.inmueble_direccion})</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {rec.inquilino_nombre}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600">
                        {rec.medio_pago} {rec.comprobante_referencia ? `(${rec.comprobante_referencia})` : ""}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {formatCurrency(rec.monto_total_cobrado, "ARS")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            alert(`Re-imprimiendo Recibo Oficial Nº ${rec.numero_recibo}`);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="Descargar PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DRAWER MODAL DE COBRO & RECIBO X */}
      {selectedPeriodoForCobro && (
        <CobranzaDrawerModal
          item={selectedPeriodoForCobro}
          onClose={() => setSelectedPeriodoForCobro(null)}
          onSuccess={(reciboNum) => {
            handleCobranzaSuccess(selectedPeriodoForCobro.id, reciboNum);
          }}
        />
      )}
    </div>
  );
}

// ==============================================================================
// MODAL DRAWER DE COBRANZA & RECIBO X
// ==============================================================================

interface CobranzaDrawerModalProps {
  item: PeriodoCobranzaItem;
  onClose: () => void;
  onSuccess: (reciboNumero: string) => void;
}

function CobranzaDrawerModal({ item, onClose, onSuccess }: CobranzaDrawerModalProps) {
  const [alquiler, setAlquiler] = useState<number>(item.monto_alquiler);
  const [expensas, setExpensas] = useState<number>(item.monto_expensas || 0);
  const [servicios, setServicios] = useState<number>(item.monto_servicios || 0);
  const [punitorios, setPunitorios] = useState<number>(item.monto_punitorios || 0);
  const [medioPago, setMedioPago] = useState<string>("Transferencia Bancaria Inmediata");
  const [referencia, setReferencia] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [reciboEmitido, setReciboEmitido] = useState<string | null>(null);

  const totalPercibido = alquiler + expensas + servicios + punitorios;

  const handleEmitirCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await registrarCobranzaAction({
        periodo_id: item.id,
        contrato_id: item.contrato_id,
        carpeta_numero: item.carpeta_numero,
        periodo_mes: item.periodo_mes,
        periodo_anio: item.periodo_anio,
        monto_alquiler: alquiler,
        monto_expensas: expensas,
        monto_servicios: servicios,
        monto_punitorios: punitorios,
        total_cobrado: totalPercibido,
        medio_pago: medioPago,
        referencia_pago: referencia,
        observaciones: observaciones,
      });

      if (!res.success) {
        throw new Error(res.error || "No se pudo registrar la cobranza");
      }

      const numRecibo = res.numeroRecibo || `0001-${Date.now().toString().slice(-6)}`;

      // Generar PDF del Recibo X oficial
      generarReciboPdf({
        numeroRecibo: numRecibo,
        fechaEmision: new Date().toLocaleDateString("es-AR"),
        carpetaNumero: item.carpeta_numero,
        inmobiliaria: {
          nombre: "Mi Inmobiliaria",
          cuit: "30-00000000-0",
          domicilio: "Domicilio Comercial",
          localidad: "Ciudad",
          telefono: "",
          matricula: "Col. Martilleros",
          condicionIva: "Monotributo",
        },
        inquilino: {
          nombre: item.inquilino.nombre,
          documento: item.inquilino.documento,
          telefono: item.inquilino.telefono,
        },
        propietario: {
          nombre: item.propietario.nombre,
          documento: item.propietario.documento,
        },
        inmueble: {
          direccion: item.inmueble.direccion,
          localidad: item.inmueble.localidad,
        },
        periodoMesAnio: `${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`,
        conceptos: [
          { detalle: `Canon locativo correspondiente a ${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`, importe: alquiler },
          ...(expensas > 0 ? [{ detalle: "Expensas ordinarias", importe: expensas }] : []),
          ...(servicios > 0 ? [{ detalle: "Servicios e impuestos", importe: servicios }] : []),
          ...(punitorios > 0 ? [{ detalle: `Intereses punitorios por mora (${item.dias_mora || 5} días)`, importe: punitorios }] : []),
        ],
        total: totalPercibido,
        moneda: item.moneda,
        medioPago: `${medioPago} ${referencia ? `(Ref: ${referencia})` : ""}`,
        observaciones: observaciones || undefined,
      });

      setReciboEmitido(numRecibo);
      onSuccess(numRecibo);
    } catch (err: any) {
      alert("Error al registrar cobranza: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#E0F2F1] text-[#004d40] rounded">
                Carpeta #{item.carpeta_numero}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Cobranza & Emisión de Recibo X
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.inmueble.direccion} ({item.inmueble.localidad})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {reciboEmitido ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ¡Cobranza Registrada Exitosamente!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Se generó y descargó el <strong>Recibo Oficial Nº {reciboEmitido}</strong> con validez RG AFIP 4004-E.
            </p>

            {/* Acciones de WhatsApp directas */}
            <div className="flex flex-col gap-2 pt-2 max-w-sm mx-auto">
              <a
                href={buildWhatsAppLink(
                  item.inquilino.telefono || "",
                  crearMensajeReciboAlquiler({
                    inquilinoNombre: item.inquilino.nombre,
                    carpetaNumero: item.carpeta_numero,
                    direccion: item.inmueble.direccion,
                    periodo: `${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`,
                    montoTotal: formatCurrency(totalPercibido, item.moneda),
                    reciboNumero: reciboEmitido,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar Comprobante por WhatsApp al Inquilino
              </a>

              <a
                href={buildWhatsAppLink(
                  item.propietario.telefono || "",
                  crearMensajeLiquidacionPropietario({
                    propietarioNombre: item.propietario.nombre,
                    carpetaNumero: item.carpeta_numero,
                    direccion: item.inmueble.direccion,
                    montoNeto: formatCurrency(Math.round(totalPercibido * 0.95), item.moneda),
                    periodo: `${MESES_NOMBRES[item.periodo_mes - 1]} ${item.periodo_anio}`,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Avisar Cobro / Rendición al Propietario
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmitirCobro} className="py-4 space-y-3.5">
            {/* Resumen Inquilino y Propietario */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Inquilino (Locatario):</span>
                <span className="font-bold text-slate-800 line-clamp-1">{item.inquilino.nombre}</span>
                <span className="text-[10px] text-slate-500">{item.inquilino.documento}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Propietario (Locador):</span>
                <span className="font-bold text-slate-800 line-clamp-1">{item.propietario.nombre}</span>
                <span className="text-[10px] text-slate-500">{item.propietario.documento}</span>
              </div>
            </div>

            {/* Desglose de Conceptos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Alquiler Devengado:</span>
                <input
                  type="number"
                  value={alquiler}
                  onChange={(e) => setAlquiler(Number(e.target.value))}
                  className="w-32 text-right font-mono font-bold text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Expensas Ordinarias:</span>
                <input
                  type="number"
                  value={expensas}
                  onChange={(e) => setExpensas(Number(e.target.value))}
                  className="w-32 text-right font-mono text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Servicios e Impuestos (Luz/Gas/Agua):</span>
                <input
                  type="number"
                  value={servicios}
                  onChange={(e) => setServicios(Number(e.target.value))}
                  className="w-32 text-right font-mono text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              {item.dias_mora > 0 && (
                <div className="flex items-center justify-between text-xs bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <div>
                    <span className="text-rose-800 font-bold block">Intereses por Mora ({item.dias_mora} días):</span>
                    <span className="text-[10px] text-rose-600">Calculado a tasa diaria sobre canon</span>
                  </div>
                  <input
                    type="number"
                    value={punitorios}
                    onChange={(e) => setPunitorios(Number(e.target.value))}
                    className="w-32 text-right font-mono font-bold text-xs p-1.5 border border-rose-300 rounded-lg bg-white text-rose-700"
                  />
                </div>
              )}
            </div>

            {/* Total Cobrado */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-300 block font-medium">Total a Percibir:</span>
                <span className="text-[10px] text-emerald-400">Recibo Oficial "X" (RG 4004-E)</span>
              </div>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(totalPercibido, item.moneda)}
              </span>
            </div>

            {/* Medio de Pago & Referencia */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Medio de Pago:</label>
                <select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Transferencia Bancaria Inmediata">Transferencia Bancaria</option>
                  <option value="Efectivo en Caja">Efectivo en Caja</option>
                  <option value="Depósito en Cuenta">Depósito Bancario</option>
                  <option value="Cheque / E-Cheq">Cheque / E-Cheq</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Comprobante / Nro Ref:</label>
                <input
                  type="text"
                  placeholder="Ej: Op 984128"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing || totalPercibido <= 0}
                className="px-5 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Emitiendo Recibo...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Confirmar Cobro y Descargar Recibo X</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
