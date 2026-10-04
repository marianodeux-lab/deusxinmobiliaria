"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  DollarSign,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ListFilter,
  Eye,
  MessageCircle,
  Printer,
  Download,
  X,
  User,
  ExternalLink,
  Shield,
  Clock,
  Landmark,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MovimientoCajaItem,
  FacturaAfipItem,
  CajaKpis,
  emitirFacturaAfipAction,
  EmitirFacturaInput,
} from "@/modules/caja/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";
import { GuiaIntegracionArcaModal } from "./GuiaIntegracionArcaModal";

interface CajaHubProps {
  initialMovimientos: MovimientoCajaItem[];
  initialFacturas: FacturaAfipItem[];
  initialKpis: CajaKpis;
}

export function CajaHub({
  initialMovimientos,
  initialFacturas,
  initialKpis,
}: CajaHubProps) {
  const [movimientos, setMovimientos] = useState<MovimientoCajaItem[]>(initialMovimientos);
  const [facturas, setFacturas] = useState<FacturaAfipItem[]>(initialFacturas);
  const [kpis, setKpis] = useState<CajaKpis>(initialKpis);

  const [activeTab, setActiveTab] = useState<"caja" | "facturas" | "afip_config">("caja");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMedio, setFilterMedio] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  const [selectedFactura, setSelectedFactura] = useState<FacturaAfipItem | null>(null);
  const [isEmitirOpen, setIsEmitirOpen] = useState(false);
  const [showGuiaArca, setShowGuiaArca] = useState(false);

  // Filtrado de movimientos de caja
  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((m) => {
      if (filterMedio !== "todos" && m.medio_pago !== filterMedio) return false;
      if (filterTipo !== "todos" && m.tipo_movimiento !== filterTipo) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchConcepto = m.concepto.toLowerCase().includes(q);
        const matchRef = m.comprobante_referencia?.toLowerCase().includes(q);
        const matchUser = m.usuario.toLowerCase().includes(q);
        return matchConcepto || matchRef || matchUser;
      }
      return true;
    });
  }, [movimientos, filterMedio, filterTipo, searchQuery]);

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-teal-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-[#004d40]">
              <FileText className="w-6 h-6 text-[#004d40]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Facturación AFIP / ARCA & Caja Diaria
                <button
                  onClick={() => setShowGuiaArca(true)}
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4] hover:bg-[#B2DFDB] transition-all flex items-center gap-1 cursor-pointer"
                  title="Consultar Punto de Venta y guía ARCA"
                >
                  <span>Punto de Venta Web Services</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#00796B]" />
                </button>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Arqueo de tesorería diaria, cobros en mostrador, emisión de Facturas B/C/A electrónicas con CAE y código QR oficial.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("caja")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "caja"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Caja Diaria ({movimientos.length})
            </button>
            <button
              onClick={() => setActiveTab("facturas")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "facturas"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Facturas Electrónicas ({facturas.length})
            </button>
            <button
              onClick={() => setActiveTab("afip_config")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "afip_config"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Conexión ARCA / AFIP
            </button>
          </div>

          <button
            onClick={() => setShowGuiaArca(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 shadow-2xs transition-all active:scale-95"
            title="Guía detallada de integración con ARCA / AFIP"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>Guía ARCA</span>
          </button>

          <button
            onClick={() => setIsEmitirOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura AFIP
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#10B981]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0]">Efectivo Mostrador (ARS)</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#34D399] mt-2 font-mono">
            ${kpis.saldoEfectivoARS.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            Arqueo físico disponible
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#262832] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Bancos / Transferencias</span>
            <div className="w-7 h-7 rounded-lg bg-[#141519] border border-[#262832] flex items-center justify-center text-[#34D399]">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white mt-2 font-mono">
            ${kpis.saldoTransferenciasARS.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Acreditado en BAPRO / Galicia
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#2DD4BF]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#99F6E4]">Caja USD (Billetes)</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#2DD4BF] mt-2 font-mono">
            US$ {kpis.saldoEfectivoUSD.toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Cobros temporarios / señas
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-purple-500/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-200">Facturación AFIP Mes</span>
            <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-300 mt-2 font-mono">
            ${kpis.totalFacturadoMesAFIP.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Honorarios declarados con CAE
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#10B981]/30 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0]">Comprobantes CAE</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#34D399] mt-2 font-mono">
            {kpis.facturasEmitidasMes}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            100% aprobadas por AFIP
          </div>
        </div>
      </div>

      {/* VISTA 1: LIBRO DE CAJA DIARIA */}
      {activeTab === "caja" && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por concepto, comprobante o usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Medio:</span>
                {["todos", "efectivo", "transferencia"].map((med) => (
                  <button
                    key={med}
                    onClick={() => setFilterMedio(med)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors",
                      filterMedio === med
                        ? "bg-[#004d40] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {med}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Tipo:</span>
                {["todos", "ingreso", "egreso"].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setFilterTipo(tipo)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors",
                      filterTipo === tipo
                        ? "bg-[#004d40] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1C1D23] rounded-xl border border-[#262832] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#101115] border-b border-[#262832] text-[11px] font-bold text-slate-100 uppercase tracking-wider">
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Tipo & Concepto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Medio de Pago</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Comprobante</th>
                    <th className="py-3 px-4">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMovimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                        {m.fecha_hora}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                              m.tipo_movimiento === "ingreso"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            )}
                          >
                            {m.tipo_movimiento === "ingreso" ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">
                              {m.concepto}
                            </span>
                            {m.observaciones && (
                              <span className="text-[11px] text-slate-400 block mt-0.5 line-clamp-1">
                                {m.observaciones}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                          {m.categoria}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 capitalize flex items-center gap-1">
                          {m.medio_pago === "efectivo" ? (
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {m.medio_pago}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-sm">
                        <span
                          className={
                            m.tipo_movimiento === "ingreso"
                              ? "text-emerald-700"
                              : "text-rose-600"
                          }
                        >
                          {m.tipo_movimiento === "ingreso" ? "+" : "-"}
                          {m.moneda === "USD" ? `US$ ${m.monto}` : `$${m.monto.toLocaleString("es-AR")}`}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {m.comprobante_referencia || "Sin comprobante"}
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {m.usuario}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: FACTURAS ELECTRÓNICAS AFIP / ARCA */}
      {activeTab === "facturas" && (
        <div className="space-y-4">
          <div className="bg-[#1C1D23] rounded-xl border border-[#262832] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#101115] border-b border-[#262832] text-[11px] font-bold text-slate-100 uppercase tracking-wider">
                    <th className="py-3 px-4">Comprobante / Tipo</th>
                    <th className="py-3 px-4">Fecha Emisión</th>
                    <th className="py-3 px-4">Cliente / CUIT</th>
                    <th className="py-3 px-4">Concepto Facturado</th>
                    <th className="py-3 px-4">Total Factura</th>
                    <th className="py-3 px-4">CAE & Vencimiento</th>
                    <th className="py-3 px-4">Estado AFIP</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {facturas.map((fac) => (
                    <tr
                      key={fac.id}
                      className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedFactura(fac)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-[10px] font-black",
                              fac.tipo_comprobante === "Factura A"
                                ? "bg-blue-100 text-blue-800"
                                : fac.tipo_comprobante === "Factura B"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                            )}
                          >
                            {fac.tipo_comprobante.slice(-1)}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-slate-800 block text-xs">
                              {fac.comprobante_completo}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              {fac.tipo_comprobante}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {fac.fecha_emision}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{fac.cliente_nombre}</div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {fac.cliente_cuit_dni} · {fac.condicion_iva}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate">
                        {fac.concepto_descripcion}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900">
                        ${fac.total_facturado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-slate-800 font-semibold">
                          CAE: {fac.cae}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Vto: {fac.cae_vencimiento}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Aprobado
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFactura(fac);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-md transition-colors"
                          >
                            Ver Factura
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

      {/* VISTA 3: CONEXIÓN & ESTADO AFIP */}
      {activeTab === "afip_config" && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Estado del Servidor de Facturación Electrónica (WSFE v1)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conexión segura de web services de AFIP / ARCA para autorización en tiempo real de comprobantes fiscales.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Configuración Pendiente
              </span>
              <button
                onClick={() => setShowGuiaArca(true)}
                className="px-3 py-1 text-xs font-bold text-[#004d40] bg-[#e0f2f1] hover:bg-[#b2dfdb] rounded-lg border border-[#80cbc4] flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#00796b]" />
                <span>Ver Guía ARCA</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Datos Fiscales del Emisor
                </span>
                <div className="font-bold text-slate-700 text-sm">Pendiente de Carga</div>
                <div className="font-mono text-slate-500">CUIT: Sin configurar</div>
                <div className="text-slate-500">Punto de Venta: A definir (ej: 0004 o 0005)</div>
                <div className="text-slate-500">Ingresos Brutos: No configurado</div>
              </div>
              <a
                href="/configuracion"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-colors"
              >
                <span>Completar en Configuración</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Certificado Digital X.509
                </span>
                <div className="font-bold text-slate-700 text-sm">Sin Certificado Activo</div>
                <div className="text-xs text-amber-700 font-semibold">Requiere archivos .crt y .key</div>
                <div className="text-slate-500 text-[11px] leading-relaxed">
                  Web Services requeridos: WSAA (Autenticación) + WSFEv1 (Facturación)
                </div>
              </div>
              <a
                href="/configuracion"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#004d40] hover:bg-[#00382e] text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                <span>Cargar Certificado Digital</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#004d40] block tracking-wider">
                  Validez Oficial AFIP QR (RG 4291)
                </span>
                <div className="font-bold text-[#004d40] text-sm">Resolución General 4291/2018</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Al cargar tu CUIT y certificados, todos los comprobantes emitidos obtendrán automáticamente el CAE oficial y el código QR fiscal firmado en Base64.
                </p>
              </div>
              <button
                onClick={() => setShowGuiaArca(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-teal-50 text-[#004d40] font-bold border border-teal-300 rounded-lg text-xs transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#00796b]" />
                <span>¿Cómo dar de alta en ARCA?</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE COMPROBANTE FISCAL CON QR */}
      {selectedFactura && (
        <ComprobanteFiscalModal
          factura={selectedFactura}
          onClose={() => setSelectedFactura(null)}
        />
      )}

      {/* MODAL EMITIR FACTURA AFIP */}
      {isEmitirOpen && (
        <EmitirFacturaModal
          isOpen={isEmitirOpen}
          onClose={() => setIsEmitirOpen(false)}
          onEmitted={(nueva) => {
            setFacturas((prev) => [nueva, ...prev]);
            setIsEmitirOpen(false);
          }}
        />
      )}

      {/* MODAL GUÍA DE INTEGRACIÓN ARCA / AFIP */}
      <GuiaIntegracionArcaModal
        isOpen={showGuiaArca}
        onClose={() => setShowGuiaArca(false)}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL COMPROBANTE FISCAL AFIP CON QR
// -----------------------------------------------------------------------------

function ComprobanteFiscalModal({
  factura,
  onClose,
}: {
  factura: FacturaAfipItem;
  onClose: () => void;
}) {
  const whatsappFacturaText = `*COMPROBANTE FISCAL ELECTRÓNICO AFIP / ARCA*
---------------------------------------
Emisor: DeusX Inmobiliarias (CUIT 30-71429812-4)
Comprobante: ${factura.tipo_comprobante} Nº ${factura.comprobante_completo}
Fecha: ${factura.fecha_emision}
Cliente: ${factura.cliente_nombre} (${factura.cliente_cuit_dni})
Concepto: ${factura.concepto_descripcion}
---------------------------------------
Total: $${factura.total_facturado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
CAE: ${factura.cae} (Vto: ${factura.cae_vencimiento})
Verificación QR AFIP: ${factura.qr_url}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              Comprobante Oficial AFIP - {factura.comprobante_completo}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factura Layout Fiel a AFIP */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Encabezado Fiscal con Letra A / B / C */}
          <div className="border border-slate-400 p-4 rounded-lg bg-white relative">
            <div className="absolute left-1/2 -top-3.5 -translate-x-1/2 w-10 h-10 rounded-md bg-white border-2 border-slate-800 flex items-center justify-center font-black text-lg text-slate-900 shadow-xs">
              {factura.tipo_comprobante.slice(-1)}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="font-black text-sm text-slate-900 tracking-tight">
                  DEUSX INMOBILIARIA
                </h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Corretaje Inmobiliario & Administración
                </p>
                <p className="text-[10px] text-slate-500">
                  Mitre 1419, 9 de Julio, Buenos Aires
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  IVA Responsable Inscripto
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="font-extrabold text-sm text-slate-900 font-mono">
                  {factura.tipo_comprobante.toUpperCase()}
                </div>
                <div className="font-mono font-bold text-xs text-slate-700">
                  Nº {factura.comprobante_completo}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  Fecha: {factura.fecha_emision}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  CUIT: 30-71429812-4
                </div>
              </div>
            </div>

            {/* Receptor */}
            <div className="border-t border-slate-300 mt-4 pt-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Cliente: {factura.cliente_nombre}</span>
                <span className="font-mono text-slate-600">CUIT/DNI: {factura.cliente_cuit_dni}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Condición frente al IVA: {factura.condicion_iva}</span>
                <span>Condición de venta: Contado / Transferencia</span>
              </div>
            </div>
          </div>

          {/* Detalle de Conceptos */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3">Descripción</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                <tr>
                  <td className="py-3 px-3 font-sans text-slate-800">
                    {factura.concepto_descripcion}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800">
                    ${factura.neto_gravado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 font-mono text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto:</span>
                <span>${factura.neto_gravado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
              {factura.iva_21 > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>IVA (21%):</span>
                  <span>${factura.iva_21.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200 pt-1">
                <span>Total:</span>
                <span>${factura.total_facturado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Pie Fiscal AFIP: CAE & Código QR */}
          <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 flex items-center justify-between gap-4">
            <div className="space-y-1 font-mono text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                CAE Nº: {factura.cae}
              </div>
              <div className="text-slate-600 text-[11px]">
                Fecha de Vencimiento CAE: {factura.cae_vencimiento}
              </div>
              <div className="text-slate-500 text-[10px]">
                Comprobante Autorizado por AFIP - Web Services WSFEv1
              </div>
            </div>

            {/* Simulación visual de QR oficial con link real */}
            <a
              href={factura.qr_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-white rounded border border-slate-300 hover:border-teal-400 flex flex-col items-center group shrink-0"
              title="Escanear o abrir validación AFIP"
            >
              <QrCode className="w-12 h-12 text-slate-800 group-hover:text-[#004d40]" />
              <span className="text-[9px] font-bold text-slate-500 mt-0.5">Validar AFIP</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <a
            href={buildWhatsAppLink("5491100000000", whatsappFacturaText)}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 text-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Enviar Factura por WhatsApp
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL EMITIR NUEVA FACTURA
// -----------------------------------------------------------------------------

function EmitirFacturaModal({
  isOpen,
  onClose,
  onEmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEmitted: (f: FacturaAfipItem) => void;
}) {
  const [tipo, setTipo] = useState<"Factura B" | "Factura C" | "Factura A">("Factura B");
  const [nombre, setNombre] = useState("");
  const [cuit, setCuit] = useState("");
  const [condicion, setCondicion] = useState<any>("Consumidor Final");
  const [concepto, setConcepto] = useState(
    "Honorarios profesionales de administración e intermediación de locación"
  );
  const [neto, setNeto] = useState<number>(35000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cuit.trim() || !neto) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emitirFacturaAfipAction({
        tipo_comprobante: tipo,
        cliente_nombre: nombre.trim(),
        cliente_cuit_dni: cuit.trim(),
        condicion_iva: condicion,
        concepto_descripcion: concepto.trim(),
        neto_gravado: Number(neto),
      });

      if (res.success && res.factura) {
        onEmitted(res.factura);
      } else {
        alert("Error al emitir factura: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#004d40]" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Emitir Factura Electrónica AFIP / ARCA
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Tipo de Comprobante</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
              >
                <option value="Factura B">Factura B (Consumidor Final)</option>
                <option value="Factura C">Factura C (Monotributo)</option>
                <option value="Factura A">Factura A (Responsable Inscripto)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Condición frente al IVA</label>
              <select
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Monotributo">Monotributo</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Exento">Exento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Nombre / Razón Social *</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">CUIT / DNI *</label>
              <input
                type="text"
                placeholder="20-12345678-9"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Concepto Facturado *</label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Monto Neto Gravado (ARS) *</label>
            <input
              type="number"
              value={neto}
              onChange={(e) => setNeto(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm text-slate-900"
            />
            {tipo === "Factura A" && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                + IVA 21%: ${Math.round(neto * 0.21).toLocaleString("es-AR")} (Total: $
                {Math.round(neto * 1.21).toLocaleString("es-AR")})
              </span>
            )}
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
              {isSubmitting ? "Autorizando en AFIP..." : "Autorizar & Obtener CAE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
