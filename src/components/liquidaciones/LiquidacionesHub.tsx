"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Wallet,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Building,
  DollarSign,
  FileText,
  MessageCircle,
  Phone,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Printer,
  ShieldCheck,
  CreditCard,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  LiquidacionPendienteItem,
  LiquidacionRealizadaItem,
  LiquidacionesKpis,
  getLiquidacionesDashboardAction,
  registrarLiquidacionAction,
} from "@/modules/liquidaciones/actions";
import { generarLiquidacionPdf } from "@/lib/pdf/liquidacionGenerator";
import {
  buildWhatsAppLink,
  crearMensajeLiquidacionPropietario,
} from "@/lib/whatsapp/whatsappHelper";

interface LiquidacionesHubProps {
  initialPendientes: LiquidacionPendienteItem[];
  initialHistorial: LiquidacionRealizadaItem[];
  initialKpis: LiquidacionesKpis;
  initialPeriodo: { mes: number; anio: number };
}

const MESES_NOMBRES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function LiquidacionesHub({
  initialPendientes,
  initialHistorial,
  initialKpis,
  initialPeriodo,
}: LiquidacionesHubProps) {
  const [activeTab, setActiveTab] = useState<"pendientes" | "historial">("pendientes");
  const [searchQuery, setSearchQuery] = useState("");

  const [periodo, setPeriodo] = useState(initialPeriodo);
  const [pendientes, setPendientes] = useState<LiquidacionPendienteItem[]>(initialPendientes);
  const [historial, setHistorial] = useState<LiquidacionRealizadaItem[]>(initialHistorial);
  const [kpis, setKpis] = useState<LiquidacionesKpis>(initialKpis);

  const [isPending, startTransition] = useTransition();
  const [selectedForLiquidacion, setSelectedForLiquidacion] = useState<LiquidacionPendienteItem | null>(null);

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
      const res = await getLiquidacionesDashboardAction({ mes: m, anio: a });
      if (res.success) {
        setPendientes(res.pendientes);
        setHistorial(res.historial);
        setKpis(res.kpis);
      }
    });
  };

  // Filtrado de pendientes
  const filteredPendientes = useMemo(() => {
    if (!searchQuery.trim()) return pendientes;
    const query = searchQuery.toLowerCase();
    return pendientes.filter((item) => {
      const matchCarpeta = item.carpeta_numero.toLowerCase().includes(query);
      const matchPropietario = item.propietario.nombre.toLowerCase().includes(query) || item.propietario.documento.includes(query);
      const matchDireccion = item.inmueble.direccion.toLowerCase().includes(query);
      const matchInquilino = item.inquilino.nombre.toLowerCase().includes(query);
      return matchCarpeta || matchPropietario || matchDireccion || matchInquilino;
    });
  }, [pendientes, searchQuery]);

  // Filtrado de historial
  const filteredHistorial = useMemo(() => {
    if (!searchQuery.trim()) return historial;
    const query = searchQuery.toLowerCase();
    return historial.filter((item) => {
      const matchNum = item.numero_liquidacion.toLowerCase().includes(query);
      const matchCarpeta = item.carpeta_numero.toLowerCase().includes(query);
      const matchPropietario = item.propietario.nombre.toLowerCase().includes(query);
      const matchDireccion = item.inmueble.direccion.toLowerCase().includes(query);
      return matchNum || matchCarpeta || matchPropietario || matchDireccion;
    });
  }, [historial, searchQuery]);

  // Manejar éxito de liquidación
  const handleLiquidacionSuccess = (periodoId: string, itemLiquidado: LiquidacionRealizadaItem) => {
    // Remover de pendientes
    setPendientes((prev) => prev.filter((p) => p.periodo_id !== periodoId));

    // Agregar a historial
    setHistorial((prev) => [itemLiquidado, ...prev]);

    // Recalcular KPIs
    setKpis((prev) => ({
      ...prev,
      totalPendienteRendirArs: Math.max(0, prev.totalPendienteRendirArs - itemLiquidado.monto_neto_liquidado),
      totalRendidoMesArs: prev.totalRendidoMesArs + itemLiquidado.monto_neto_liquidado,
      totalComisionesGanadasArs: prev.totalComisionesGanadasArs + itemLiquidado.monto_honorarios_inmobiliaria,
      cantidadPendientes: Math.max(0, prev.cantidadPendientes - 1),
      cantidadRendidas: prev.cantidadRendidas + 1,
    }));
  };

  // Re-imprimir PDF del historial
  const handleReimprimirPdf = (l: LiquidacionRealizadaItem) => {
    generarLiquidacionPdf({
      numeroLiquidacion: l.numero_liquidacion,
      fechaLiquidacion: l.fecha_liquidacion,
      carpetaNumero: l.carpeta_numero,
      inmobiliaria: {
        nombre: "Mi Inmobiliaria",
        cuit: "30-00000000-0",
        domicilio: "Domicilio Comercial",
        localidad: "Ciudad",
        telefono: "",
        matricula: "Col. Martilleros",
        condicionIva: "Monotributo",
      },
      propietario: {
        nombre: l.propietario.nombre,
        documento: l.propietario.documento,
        telefono: l.propietario.telefono,
        cbu_alias: l.cbu_destino_propietario,
      },
      inquilino: {
        nombre: "Locatario",
        documento: "Registrado en legajo",
      },
      inmueble: {
        direccion: l.inmueble.direccion,
        localidad: l.inmueble.localidad,
      },
      periodoMesAnio: `${MESES_NOMBRES[periodo.mes - 1]} ${periodo.anio}`,
      ingresos: [
        { detalle: `Canon locativo percibido del inquilino`, importe: l.monto_bruto_percibido },
      ],
      deducciones: [
        { detalle: `Honorarios de administración inmobiliaria`, importe: l.monto_honorarios_inmobiliaria },
        ...(l.monto_iva_honorarios > 0 ? [{ detalle: `IVA s/ honorarios (21%)`, importe: l.monto_iva_honorarios }] : []),
        ...(l.monto_gastos_reparaciones > 0 ? [{ detalle: `Gastos de mantenimiento / reparaciones`, importe: l.monto_gastos_reparaciones }] : []),
        ...(l.monto_retenciones_impositivas > 0 ? [{ detalle: `Retenciones impositivas`, importe: l.monto_retenciones_impositivas }] : []),
      ],
      totalBruto: l.monto_bruto_percibido,
      totalDeducciones: l.monto_honorarios_inmobiliaria + l.monto_iva_honorarios + l.monto_gastos_reparaciones + l.monto_retenciones_impositivas,
      totalNeto: l.monto_neto_liquidado,
      moneda: "ARS",
      medioPago: l.medio_pago,
      comprobanteTransferencia: l.comprobante_transferencia,
    });
  };

  // Exportar CSV
  const handleExportCsv = () => {
    const headers = ["Carpeta", "Propietario", "DNI", "Inmueble", "Canon Cobrado", "Honorarios Inmobiliaria", "Neto a Rendir", "CBU / Alias"];
    const rows = filteredPendientes.map((p) => [
      `#${p.carpeta_numero}`,
      `"${p.propietario.nombre}"`,
      p.propietario.documento,
      `"${p.inmueble.direccion}"`,
      p.total_bruto_percibido,
      p.monto_comision_calculado,
      p.monto_neto_estimado,
      `"${p.propietario.cbu_alias || "A coordinar"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rendiciones_pendientes_${MESES_NOMBRES[periodo.mes - 1]}_${periodo.anio}.csv`);
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
              <Wallet className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Módulo de Liquidaciones & Rendiciones a Dueños
              </h1>
              <p className="text-xs text-slate-500">
                Liquidación de alquileres percibidos, retención de honorarios de administración y emisión de comprobantes PDF.
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
            <span>Exportar Lote</span>
          </button>
        </div>
      </div>

      {/* 2. TARJETAS KPI EJECUTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pendiente a Rendir */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-amber-500/35 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Pendiente a Rendir
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {kpis.cantidadPendientes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 shrink-0 whitespace-nowrap">
                  {kpis.cantidadPendientes} a transferir
                </span>
              )}
              <div className="w-7 h-7 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-700/50 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-amber-300 font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalPendienteRendirArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            Fondos de propietarios en custodia listos para liquidar
          </div>
        </div>

        {/* KPI 2: Total Rendido en el Mes */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#10B981]/35 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Rendido en el Mes
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-[#34D399] font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalRendidoMesArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            {kpis.cantidadRendidas} liquidaciones completadas
          </div>
        </div>

        {/* KPI 3: Honorarios Ganados por Administración */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#10B981]/35 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Honorarios Inmobiliaria
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-[#34D399] font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalComisionesGanadasArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 font-medium">
            Comisión retenida por administración (4.13% - 5%)
          </div>
        </div>

        {/* KPI 4: Total Bruto Administrado */}
        <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#262832] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Bruto Administrado
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141519] text-slate-300 border border-[#262832] flex items-center justify-center shrink-0">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(kpis.totalBrutoPercibidoMesArs + kpis.totalPendienteRendirArs, "ARS")}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            Volumen locativo operado en el período
          </div>
        </div>
      </div>

      {/* 3. SWITCHER DE VISTAS (PENDIENTES VS HISTORIAL) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "pendientes"
                ? "bg-[#004d40] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            Pendientes de Rendición ({pendientes.length})
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
            Historial de Rendiciones Emitidas ({historial.length})
          </button>
        </div>

        {activeTab === "pendientes" && pendientes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Generando orden de transferencia agrupada para los ${pendientes.length} propietarios pendientes.`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preparar Lote de Transferencia Bancaria ({pendientes.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. BARRA DE BÚSQUEDA */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Propietario, Carpeta, Domicilio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-colors"
          />
        </div>
      </div>

      {activeTab === "pendientes" ? (
        /* 5. TABLA DE PENDIENTES DE RENDICIÓN */
        <div className="bg-[#1C1D23] rounded-2xl border border-[#262832] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#101115] border-b border-[#262832] text-slate-100 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 min-w-[5.5rem] w-24">Carpeta</th>
                  <th className="py-3 px-4">Propietario (Beneficiario)</th>
                  <th className="py-3 px-4">Inmueble / Domicilio</th>
                  <th className="py-3 px-4">Canon Cobrado</th>
                  <th className="py-3 px-4">Honorarios Admin (4.13%)</th>
                  <th className="py-3 px-4">Neto a Transferir</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="font-semibold text-sm">¡Al día! No hay alquileres pendientes de rendición</p>
                      <p className="text-xs text-slate-400 mt-1">Todos los alquileres cobrados en este período ya han sido transferidos a sus respectivos propietarios.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPendientes.map((p) => (
                    <tr key={p.periodo_id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. CARPETA */}
                      <td className="py-3 px-3 align-top">
                        <span
                          title={`Carpeta #${p.carpeta_numero}`}
                          className="inline-flex items-center justify-center min-w-[2.25rem] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 font-mono font-bold text-xs shadow-2xs whitespace-nowrap"
                        >
                          #{p.carpeta_numero.length > 5 ? p.carpeta_numero.slice(-4) : p.carpeta_numero}
                        </span>
                      </td>

                      {/* 2. PROPIETARIO */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-white">
                          {p.propietario.nombre}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.propietario.documento}
                        </div>
                        {p.propietario.cbu_alias ? (
                          <div className="text-[10px] font-mono text-[#34D399] mt-0.5 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-[#10B981]" />
                            <span>Alias: {p.propietario.cbu_alias}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-300 italic block mt-0.5">
                            CBU no registrado
                          </span>
                        )}
                      </td>

                      {/* 3. INMUEBLE */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-medium text-slate-200">
                          {p.inmueble.direccion}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.inmueble.localidad}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Inquilino: <span className="text-slate-300 font-medium">{p.inquilino.nombre}</span>
                        </div>
                      </td>

                      {/* 4. CANON COBRADO */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-bold text-white">
                          {formatCurrency(p.total_bruto_percibido, p.moneda)}
                        </div>
                        <div className="text-[10px] text-[#34D399] font-medium mt-0.5">
                          ✓ Cobrado al Inquilino
                        </div>
                      </td>

                      {/* 5. HONORARIOS */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-semibold text-rose-300">
                          - {formatCurrency(p.monto_comision_calculado, p.moneda)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Comisión Inmobiliaria ({p.porcentaje_comision_defecto}%)
                        </div>
                      </td>

                      {/* 6. NETO A TRANSFERIR */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-extrabold text-[#34D399] text-sm">
                          {formatCurrency(p.monto_neto_estimado, p.moneda)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Saldo Líquido al Locador
                        </div>
                      </td>

                      {/* 7. ACCIONES */}
                      <td className="py-3 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp al Dueño */}
                          <a
                            href={buildWhatsAppLink(
                              p.propietario.telefono || "",
                              crearMensajeLiquidacionPropietario({
                                propietarioNombre: p.propietario.nombre,
                                carpetaNumero: p.carpeta_numero,
                                direccion: p.inmueble.direccion,
                                montoNeto: formatCurrency(p.monto_neto_estimado, p.moneda),
                                periodo: `${MESES_NOMBRES[p.periodo_mes - 1]} ${p.periodo_anio}`,
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Contactar al Propietario por WhatsApp"
                            className="p-1.5 text-[#34D399] hover:text-white hover:bg-[#00382E] rounded-lg transition-colors border border-[#10B981]/30"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Botón Liquidar */}
                          <button
                            onClick={() => setSelectedForLiquidacion(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-[#004D40] to-[#10B981] hover:brightness-110 text-white shadow-2xs transition-colors"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Liquidar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 6. TABLA DE HISTORIAL DE RENDICIONES */
        <div className="bg-[#1C1D23] rounded-2xl border border-[#262832] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#262832] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Registro Histórico de Rendiciones a Propietarios
              </h3>
              <p className="text-xs text-slate-300">
                Constancias de transferencia bancaria y recibos de rendición de cuentas locativas.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#101115] border-b border-[#262832] text-slate-100 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Nº Liquidación</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Propietario & Carpeta</th>
                  <th className="py-3 px-4">Inmueble</th>
                  <th className="py-3 px-4">Bruto Cobrado</th>
                  <th className="py-3 px-4">Honorarios Retenidos</th>
                  <th className="py-3 px-4">Neto Pagado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistorial.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No hay liquidaciones registradas en el historial.
                    </td>
                  </tr>
                ) : (
                  filteredHistorial.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {l.numero_liquidacion}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(l.fecha_liquidacion)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{l.propietario.nombre}</div>
                        <div className="text-[10px] text-slate-500 font-mono">#{l.carpeta_numero}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {l.inmueble.direccion}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-900">
                        {formatCurrency(l.monto_bruto_percibido, "ARS")}
                      </td>
                      <td className="py-3 px-4 font-mono text-teal-800 font-semibold">
                        {formatCurrency(l.monto_honorarios_inmobiliaria, "ARS")}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {formatCurrency(l.monto_neto_liquidado, "ARS")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleReimprimirPdf(l)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Descargar Comprobante PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <a
                            href={buildWhatsAppLink(
                              l.propietario.telefono || "",
                              `Hola ${l.propietario.nombre}, le confirmamos que se ha procesado su Rendición de Alquiler Nº ${l.numero_liquidacion} por ${formatCurrency(l.monto_neto_liquidado, "ARS")}. Constancia disponible en administración.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="Enviar WhatsApp al Dueño"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. DRAWER MODAL DE LIQUIDACIÓN A DUEÑO */}
      {selectedForLiquidacion && (
        <LiquidacionDrawerModal
          item={selectedForLiquidacion}
          periodoMesAnio={`${MESES_NOMBRES[periodo.mes - 1]} ${periodo.anio}`}
          onClose={() => setSelectedForLiquidacion(null)}
          onSuccess={(itemLiquidado) => {
            handleLiquidacionSuccess(selectedForLiquidacion.periodo_id, itemLiquidado);
          }}
        />
      )}
    </div>
  );
}

// ==============================================================================
// MODAL DRAWER DE LIQUIDACIÓN INDIVIDUAL
// ==============================================================================

interface LiquidacionDrawerModalProps {
  item: LiquidacionPendienteItem;
  periodoMesAnio: string;
  onClose: () => void;
  onSuccess: (itemLiquidado: LiquidacionRealizadaItem) => void;
}

function LiquidacionDrawerModal({
  item,
  periodoMesAnio,
  onClose,
  onSuccess,
}: LiquidacionDrawerModalProps) {
  const [bruto, setBruto] = useState<number>(item.total_bruto_percibido);
  const [porcentajeHonorarios, setPorcentajeHonorarios] = useState<number>(item.porcentaje_comision_defecto);
  const [honorarios, setHonorarios] = useState<number>(item.monto_comision_calculado);
  const [ivaHonorarios, setIvaHonorarios] = useState<number>(0);
  const [gastos, setGastos] = useState<number>(0);
  const [retenciones, setRetenciones] = useState<number>(0);

  const [medioPago, setMedioPago] = useState<string>("Transferencia Bancaria Inmediata");
  const [cbuDestino, setCbuDestino] = useState<string>(item.propietario.cbu_alias || "");
  const [cuentaOrigen, setCuentaOrigen] = useState<string>("Cuenta Recaudadora DeusX Inmobiliaria");
  const [comprobanteTransf, setComprobanteTransf] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [liquidacionEmitida, setLiquidacionEmitida] = useState<string | null>(null);

  // Recálculo dinámico de honorarios al cambiar el porcentaje
  const handleCambioPorcentaje = (nuevoPorc: number) => {
    setPorcentajeHonorarios(nuevoPorc);
    setHonorarios(Math.round(bruto * (nuevoPorc / 100)));
  };

  const totalDeducciones = honorarios + ivaHonorarios + gastos + retenciones;
  const netoTransferir = Math.max(0, bruto - totalDeducciones);

  const handleEmitirLiquidacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await registrarLiquidacionAction({
        periodo_id: item.periodo_id,
        contrato_id: item.contrato_id,
        propietario_id: item.propietario.id,
        carpeta_numero: item.carpeta_numero,
        periodo_mes: item.periodo_mes,
        periodo_anio: item.periodo_anio,
        monto_bruto_percibido: bruto,
        monto_honorarios_inmobiliaria: honorarios,
        monto_iva_honorarios: ivaHonorarios,
        monto_gastos_reparaciones: gastos,
        monto_retenciones_impositivas: retenciones,
        monto_neto_liquidado: netoTransferir,
        medio_pago: medioPago,
        cuenta_origen_inmobiliaria: cuentaOrigen,
        cbu_destino_propietario: cbuDestino,
        comprobante_transferencia: comprobanteTransf,
        observaciones: observaciones,
      });

      if (!res.success) {
        throw new Error(res.error || "No se pudo registrar la liquidación");
      }

      const numLiq = res.numeroLiquidacion || `LIQ-0001-${Date.now().toString().slice(-6)}`;

      // Generar y descargar el comprobante oficial PDF de Rendición
      generarLiquidacionPdf({
        numeroLiquidacion: numLiq,
        fechaLiquidacion: new Date().toLocaleDateString("es-AR"),
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
        propietario: {
          nombre: item.propietario.nombre,
          documento: item.propietario.documento,
          telefono: item.propietario.telefono,
          cbu_alias: cbuDestino,
        },
        inquilino: {
          nombre: item.inquilino.nombre,
          documento: item.inquilino.documento,
        },
        inmueble: {
          direccion: item.inmueble.direccion,
          localidad: item.inmueble.localidad,
        },
        periodoMesAnio: periodoMesAnio,
        ingresos: [
          { detalle: `Canon locativo percibido (${periodoMesAnio})`, importe: bruto },
        ],
        deducciones: [
          { detalle: `Honorarios de administración (${porcentajeHonorarios}%)`, importe: honorarios },
          ...(ivaHonorarios > 0 ? [{ detalle: `IVA s/ honorarios`, importe: ivaHonorarios }] : []),
          ...(gastos > 0 ? [{ detalle: `Gastos de mantenimiento / reparaciones`, importe: gastos }] : []),
          ...(retenciones > 0 ? [{ detalle: `Retenciones impositivas`, importe: retenciones }] : []),
        ],
        totalBruto: bruto,
        totalDeducciones: totalDeducciones,
        totalNeto: netoTransferir,
        moneda: item.moneda,
        medioPago: medioPago,
        cuentaOrigen: cuentaOrigen,
        comprobanteTransferencia: comprobanteTransf,
        observaciones: observaciones,
      });

      setLiquidacionEmitida(numLiq);

      onSuccess({
        id: "liq-" + Date.now(),
        numero_liquidacion: numLiq,
        fecha_liquidacion: new Date().toISOString().split("T")[0],
        contrato_id: item.contrato_id,
        carpeta_numero: item.carpeta_numero,
        inmueble: item.inmueble,
        propietario: item.propietario,
        monto_bruto_percibido: bruto,
        monto_honorarios_inmobiliaria: honorarios,
        monto_iva_honorarios: ivaHonorarios,
        monto_gastos_reparaciones: gastos,
        monto_retenciones_impositivas: retenciones,
        monto_neto_liquidado: netoTransferir,
        medio_pago: medioPago,
        cbu_destino_propietario: cbuDestino,
        comprobante_transferencia: comprobanteTransf,
        estado: "liquidado",
        creado_al: new Date().toISOString(),
      });
    } catch (err: any) {
      alert("Error al registrar liquidación: " + err.message);
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
                Rendición de Alquiler al Propietario
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

        {liquidacionEmitida ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ¡Liquidación y Rendición Generada con Éxito!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Se emitió y descargó la constancia oficial <strong>{liquidacionEmitida}</strong> por un monto neto de <strong>{formatCurrency(netoTransferir, item.moneda)}</strong>.
            </p>

            {/* Acciones de WhatsApp directas */}
            <div className="pt-2 max-w-sm mx-auto">
              <a
                href={buildWhatsAppLink(
                  item.propietario.telefono || "",
                  crearMensajeLiquidacionPropietario({
                    propietarioNombre: item.propietario.nombre,
                    carpetaNumero: item.carpeta_numero,
                    direccion: item.inmueble.direccion,
                    montoNeto: formatCurrency(netoTransferir, item.moneda),
                    periodo: periodoMesAnio,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar Comprobante por WhatsApp al Propietario
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
          <form onSubmit={handleEmitirLiquidacion} className="py-4 space-y-3.5">
            {/* Datos Propietario e Inquilino */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Propietario Locador:</span>
                <span className="font-bold text-slate-800 line-clamp-1">{item.propietario.nombre}</span>
                <span className="text-[10px] text-slate-500">{item.propietario.documento}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Inquilino que Pagó:</span>
                <span className="font-bold text-slate-800 line-clamp-1">{item.inquilino.nombre}</span>
                <span className="text-[10px] text-slate-500">Período {periodoMesAnio}</span>
              </div>
            </div>

            {/* Desglose de Liquidación */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Canon Bruto Percibido:</span>
                <input
                  type="number"
                  value={bruto}
                  onChange={(e) => {
                    const b = Number(e.target.value);
                    setBruto(b);
                    setHonorarios(Math.round(b * (porcentajeHonorarios / 100)));
                  }}
                  className="w-32 text-right font-mono font-bold text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              {/* Honorarios de Administración */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-medium">Honorarios Inmobiliaria:</span>
                  <div className="flex items-center gap-0.5">
                    <input
                      type="number"
                      step="0.01"
                      value={porcentajeHonorarios}
                      onChange={(e) => handleCambioPorcentaje(Number(e.target.value))}
                      className="w-14 text-center font-mono text-xs p-1 border border-slate-200 rounded bg-white"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={honorarios}
                  onChange={(e) => setHonorarios(Number(e.target.value))}
                  className="w-32 text-right font-mono font-semibold text-xs p-1.5 border border-rose-200 rounded-lg bg-white text-rose-700"
                />
              </div>

              {/* Gastos y Reparaciones */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-700 font-medium block">Gastos / Mantenimiento:</span>
                  <span className="text-[10px] text-slate-400">Reparaciones deducibles al locador</span>
                </div>
                <input
                  type="number"
                  value={gastos}
                  onChange={(e) => setGastos(Number(e.target.value))}
                  className="w-32 text-right font-mono text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              {/* Retenciones Impositivas */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-700 font-medium block">Retenciones Impositivas:</span>
                  <span className="text-[10px] text-slate-400">IIBB / Ganancias (si aplica)</span>
                </div>
                <input
                  type="number"
                  value={retenciones}
                  onChange={(e) => setRetenciones(Number(e.target.value))}
                  className="w-32 text-right font-mono text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Total Neto a Transferir */}
            <div className="p-3 bg-[#004d40] text-white rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] text-emerald-200 block font-medium">Neto a Transferir al Dueño:</span>
                <span className="text-[10px] text-slate-300">Total percibido menos comisiones y gastos</span>
              </div>
              <span className="text-xl font-extrabold font-mono text-white">
                {formatCurrency(netoTransferir, item.moneda)}
              </span>
            </div>

            {/* Datos Bancarios de la Transferencia */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                  CBU / CVU / Alias Bancario del Propietario:
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ej: titular.galicia"
                    value={cbuDestino}
                    onChange={(e) => setCbuDestino(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Medio de Pago:</label>
                  <select
                    value={medioPago}
                    onChange={(e) => setMedioPago(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Transferencia Bancaria Inmediata">Transferencia Bancaria</option>
                    <option value="Efectivo en Oficina">Efectivo en Oficina</option>
                    <option value="Cheque / E-Cheq">Cheque Bancario</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Nº Comprobante Transf:</label>
                  <input
                    type="text"
                    placeholder="Ej: Transf 4910291"
                    value={comprobanteTransf}
                    onChange={(e) => setComprobanteTransf(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
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
                disabled={isProcessing || netoTransferir <= 0}
                className="px-5 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Emitiendo Rendición...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Confirmar Rendición y Generar PDF</span>
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
