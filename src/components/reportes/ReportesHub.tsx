"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  MessageCircle,
  Eye,
  X,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ReporteMesFila,
  ReportePropietarioItem,
  ReportesKpis,
} from "@/modules/reportes/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

interface ReportesHubProps {
  initialResumenMensual: ReporteMesFila[];
  initialResumenPropietarios: ReportePropietarioItem[];
  initialKpis: ReportesKpis;
  anioSeleccionado: number;
}

export function ReportesHub({
  initialResumenMensual,
  initialResumenPropietarios,
  initialKpis,
  anioSeleccionado,
}: ReportesHubProps) {
  const [resumenMensual, setResumenMensual] = useState<ReporteMesFila[]>(initialResumenMensual);
  const [resumenPropietarios, setResumenPropietarios] = useState<ReportePropietarioItem[]>(
    initialResumenPropietarios
  );
  const [kpis, setKpis] = useState<ReportesKpis>(initialKpis);

  const [activeTab, setActiveTab] = useState<"mensual" | "propietarios">("mensual");
  const [selectedPropietario, setSelectedPropietario] = useState<ReportePropietarioItem | null>(null);
  const [searchPropietario, setSearchPropietario] = useState("");

  // Exportar a CSV / Excel
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
    csvContent += "Mes;Cobranzas Brutas;Honorarios Inmobiliaria;Gastos Mantenimiento;Expensas Extraordinarias;Neto Rendido;Contratos al Dia;Contratos con Mora\r\n";

    resumenMensual.forEach((r) => {
      csvContent += `${r.periodo_nombre};${r.cobranzas_brutas};${r.honorarios_inmobiliaria};${r.gastos_mantenimiento};${r.expensas_extraordinarias};${r.rendicion_neta};${r.contratos_al_dia};${r.contratos_con_mora}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Balance_Anual_DeusX_${anioSeleccionado}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPropietarios = resumenPropietarios.filter((p) => {
    if (searchPropietario.trim()) {
      const q = searchPropietario.toLowerCase();
      return (
        p.propietario_nombre.toLowerCase().includes(q) ||
        p.propietario_cuit.includes(q) ||
        p.inmuebles.some((i) => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-teal-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-[#004d40]">
              <FileSpreadsheet className="w-6 h-6 text-[#004d40]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Reportes Financieros & Rendición Anual
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                  Ejercicio {anioSeleccionado}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Consolidado contable de rentas, retenciones de ingresos brutos, estados de cuenta para propietarios y exportación a Excel.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("mensual")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "mensual"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Balance Mensual
            </button>
            <button
              onClick={() => setActiveTab("propietarios")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "propietarios"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <User className="w-3.5 h-3.5" />
              Informe para Propietarios ({resumenPropietarios.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar Excel / CSV
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cobranzas Brutas Anuales</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#004d40]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800 mt-2 font-mono">
            ${kpis.totalBrutoCobradoAnio.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Total alquileres devengados
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Honorarios Inmobiliaria</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 mt-2 font-mono">
            ${kpis.totalHonorariosInmobiliaria.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Comisión neta de administración
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rendido a Propietarios</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-700 mt-2 font-mono">
            ${kpis.totalRendidoNeto.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">
            Transferido neto de gastos
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Efectividad de Cobro</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {kpis.tasaEfectividadCobro}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Contratos al día sin morosidad
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Retenciones IIBB</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700 mt-2 font-mono">
            ${kpis.retencionesEstimadasIIBB.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            Estimado fiscal anual (ARBA/AGIP)
          </div>
        </div>
      </div>

      {/* VISTA 1: BALANCE MENSUAL */}
      {activeTab === "mensual" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Mes</th>
                  <th className="py-3 px-4 text-right">Cobranzas Brutas</th>
                  <th className="py-3 px-4 text-right">Honorarios (4.13%)</th>
                  <th className="py-3 px-4 text-right">Gastos Mantenimiento</th>
                  <th className="py-3 px-4 text-right">Expensas Extraord.</th>
                  <th className="py-3 px-4 text-right">Líquido Rendido</th>
                  <th className="py-3 px-4 text-center">Al Día / Mora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {resumenMensual.map((m) => (
                  <tr key={m.periodo_mes} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-800">
                      {m.periodo_nombre}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${m.cobranzas_brutas.toLocaleString("es-AR")}
                    </td>

                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                      ${m.honorarios_inmobiliaria.toLocaleString("es-AR")}
                    </td>

                    <td className="py-3 px-4 text-right text-rose-600">
                      {m.gastos_mantenimiento > 0
                        ? `-$${m.gastos_mantenimiento.toLocaleString("es-AR")}`
                        : "-"}
                    </td>

                    <td className="py-3 px-4 text-right text-amber-700">
                      {m.expensas_extraordinarias > 0
                        ? `-$${m.expensas_extraordinarias.toLocaleString("es-AR")}`
                        : "-"}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      ${m.rendicion_neta.toLocaleString("es-AR")}
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <span className="text-emerald-700 font-bold">{m.contratos_al_dia}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-rose-600 font-bold">{m.contratos_con_mora}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: INFORME ANUAL PARA PROPIETARIOS */}
      {activeTab === "propietarios" && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por propietario, CUIT o inmueble..."
                value={searchPropietario}
                onChange={(e) => setSearchPropietario(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:bg-white"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              {filteredPropietarios.length} Propietarios Registrados
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Propietario / CUIT</th>
                    <th className="py-3 px-4">Inmuebles Asignados</th>
                    <th className="py-3 px-4 text-right">Renta Bruta Anual</th>
                    <th className="py-3 px-4 text-right">Honorarios Deducidos</th>
                    <th className="py-3 px-4 text-right">Gastos Deducidos</th>
                    <th className="py-3 px-4 text-right">Líquido Percibido</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPropietarios.map((p) => (
                    <tr
                      key={p.propietario_id}
                      className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPropietario(p)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-xs group-hover:text-[#004d40]">
                          {p.propietario_nombre}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          CUIT: {p.propietario_cuit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {p.inmuebles.map((inm, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700"
                            >
                              {inm}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${p.total_bruto_anual.toLocaleString("es-AR")}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                        -${p.total_honorarios_anual.toLocaleString("es-AR")}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                        -${p.total_gastos_anual.toLocaleString("es-AR")}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-slate-900">
                        ${p.total_neto_transferido.toLocaleString("es-AR")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPropietario(p);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-md transition-colors"
                        >
                          Ver Balance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE PROPIETARIO PARA CONTADOR */}
      {selectedPropietario && (
        <DetallePropietarioModal
          item={selectedPropietario}
          anio={anioSeleccionado}
          onClose={() => setSelectedPropietario(null)}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL DETALLE DE BALANCE ANUAL PARA CONTADOR DEL PROPIETARIO
// -----------------------------------------------------------------------------

function DetallePropietarioModal({
  item,
  anio,
  onClose,
}: {
  item: ReportePropietarioItem;
  anio: number;
  onClose: () => void;
}) {
  const whatsappBalanceText = `*ESTADO DE CUENTA ANUAL DE LOCACIONES - EJERCICIO ${anio}*
---------------------------------------
Propietario: ${item.propietario_nombre}
CUIT: ${item.propietario_cuit}
Inmuebles: ${item.inmuebles.join(", ")}
---------------------------------------
Alquileres Brutos Cobrados: $${item.total_bruto_anual.toLocaleString("es-AR")}
Honorarios Inmobiliaria: -$${item.total_honorarios_anual.toLocaleString("es-AR")}
Gastos y Retenciones: -$${item.total_gastos_anual.toLocaleString("es-AR")}
Neto Total Percibido: $${item.total_neto_transferido.toLocaleString("es-AR")}
---------------------------------------
Informe emitido por DeusX Inmobiliarias para declaración jurada impositiva.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E0F2F1] text-[#004d40]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Certificado Impositivo Anual {anio}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {item.propietario_nombre} (CUIT {item.propietario_cuit})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Inmuebles en Administración
            </span>
            <div className="font-semibold text-slate-800">
              {item.inmuebles.join(" · ")}
            </div>
          </div>

          <div className="space-y-2 border-t border-b border-slate-100 py-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-600">Total Ingresos Brutos por Locación:</span>
              <span className="font-bold text-slate-900 text-sm">
                ${item.total_bruto_anual.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-600">Comisión / Honorarios Inmobiliaria:</span>
              <span className="font-bold text-emerald-700">
                -${item.total_honorarios_anual.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-600">Gastos de Mantenimiento y Extraordinarias:</span>
              <span className="font-bold text-rose-600">
                -${item.total_gastos_anual.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="font-sans font-black text-slate-900 text-sm">
                Total Líquido Transferido al Titular:
              </span>
              <span className="font-black text-slate-900 text-base">
                ${item.total_neto_transferido.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-slate-700 text-[11px] leading-relaxed">
            <span className="font-bold text-[#004d40] block mb-0.5">Nota para el Contador:</span>
            El presente informe acredita las sumas efectivamente percibidas y las deducciones practicadas en concepto de intermediación inmobiliaria y mantenimiento para la liquidación de Impuesto a las Ganancias y Bienes Personales.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <a
            href={buildWhatsAppLink("5491100000000", whatsappBalanceText)}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 text-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
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
