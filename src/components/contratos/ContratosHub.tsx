"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Receipt,
  Wallet,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  ExternalLink,
  Phone,
  FileText
} from "lucide-react";
import { formatCurrency, formatDate, calculateContractProgress, cn } from "@/lib/utils";

export interface ContratoItem {
  id: string;
  carpeta_numero: string;
  direccion: {
    calle: string;
    numero: string;
    piso_dpto?: string;
    uf?: string;
    localidad: string;
  };
  fecha_inicio: string;
  fecha_fin: string;
  moneda: "ARS" | "USD";
  monto_alquiler_actual: number;
  tipo_ajuste: "ICL" | "IPC" | "UVA" | "FIJO";
  frecuencia_ajuste_meses: number;
  inquilino: {
    nombre: string;
    documento: string;
    telefono?: string;
    estado_pago_mes: "al_dia" | "pendiente" | "mora";
    dias_mora?: number;
  };
  propietario: {
    nombre: string;
    documento: string;
    cbu_alias?: string;
    porcentaje: number;
    estado_liquidacion_mes: "liquidado" | "pendiente" | "no_aplica";
  };
}

const MOCK_CONTRATOS: ContratoItem[] = [
  {
    id: "c-1",
    carpeta_numero: "3",
    direccion: {
      calle: "Sarmiento",
      numero: "2751",
      piso_dpto: "Dpto 3B",
      localidad: "Mar del Plata",
    },
    fecha_inicio: "2025-03-01",
    fecha_fin: "2028-02-29",
    moneda: "ARS",
    monto_alquiler_actual: 420000,
    tipo_ajuste: "ICL",
    frecuencia_ajuste_meses: 4,
    inquilino: {
      nombre: "MENCIA RODRIGUEZ, PEDRO JOSE",
      documento: "DNI 32.415.890",
      telefono: "223-5123456",
      estado_pago_mes: "al_dia",
    },
    propietario: {
      nombre: "STIGLICH, MARIA PAULA",
      documento: "CUIT 27-28495123-4",
      cbu_alias: "PAULA.PROPIEDADES",
      porcentaje: 100,
      estado_liquidacion_mes: "liquidado",
    },
  },
  {
    id: "c-2",
    carpeta_numero: "4",
    direccion: {
      calle: "Mitre",
      numero: "1419",
      piso_dpto: "Edificio Lauquen, 5B",
      uf: "UF 077-045141-8",
      localidad: "Mar del Plata",
    },
    fecha_inicio: "2025-06-01",
    fecha_fin: "2028-05-31",
    moneda: "ARS",
    monto_alquiler_actual: 550000,
    tipo_ajuste: "IPC",
    frecuencia_ajuste_meses: 3,
    inquilino: {
      nombre: "LOPEZ MARTIN, MARIA LUCIA",
      documento: "DNI 36.789.012",
      telefono: "223-4876543",
      estado_pago_mes: "pendiente",
    },
    propietario: {
      nombre: "FUREGA, LUIS ALBERTO",
      documento: "CUIT 20-17849302-8",
      cbu_alias: "LUIS.FUREGA.BNA",
      porcentaje: 100,
      estado_liquidacion_mes: "pendiente",
    },
  },
  {
    id: "c-3",
    carpeta_numero: "5",
    direccion: {
      calle: "La Rioja",
      numero: "885",
      piso_dpto: "1° PB",
      uf: "UF 077-31948",
      localidad: "Mar del Plata",
    },
    fecha_inicio: "2025-03-01",
    fecha_fin: "2028-02-29",
    moneda: "ARS",
    monto_alquiler_actual: 380000,
    tipo_ajuste: "ICL",
    frecuencia_ajuste_meses: 4,
    inquilino: {
      nombre: "FERRER, VILMA LUCRECIA",
      documento: "DNI 18.234.567",
      estado_pago_mes: "al_dia",
    },
    propietario: {
      nombre: "DI MARCO, CARLOS (50%) Y HNO.",
      documento: "CUIT 20-22114433-2",
      porcentaje: 50,
      estado_liquidacion_mes: "pendiente",
    },
  },
  {
    id: "c-4",
    carpeta_numero: "6",
    direccion: {
      calle: "Edison",
      numero: "441",
      piso_dpto: "Dpto 6",
      localidad: "Mar del Plata",
    },
    fecha_inicio: "2024-04-01",
    fecha_fin: "2027-03-31",
    moneda: "ARS",
    monto_alquiler_actual: 310000,
    tipo_ajuste: "IPC",
    frecuencia_ajuste_meses: 3,
    inquilino: {
      nombre: "BRANCE, SOFIA",
      documento: "DNI 40.112.334",
      estado_pago_mes: "mora",
      dias_mora: 8,
    },
    propietario: {
      nombre: "BRANCE, HECTOR HORACIO",
      documento: "CUIT 20-14223344-9",
      porcentaje: 100,
      estado_liquidacion_mes: "pendiente",
    },
  },
  {
    id: "c-5",
    carpeta_numero: "8",
    direccion: {
      calle: "Hidalgo",
      numero: "352",
      piso_dpto: "Dpto 6B",
      localidad: "Mar del Plata",
    },
    fecha_inicio: "2024-08-01",
    fecha_fin: "2027-07-31",
    moneda: "USD",
    monto_alquiler_actual: 650,
    tipo_ajuste: "FIJO",
    frecuencia_ajuste_meses: 12,
    inquilino: {
      nombre: "SUSA, VALERIA",
      documento: "DNI 34.567.890",
      estado_pago_mes: "al_dia",
    },
    propietario: {
      nombre: "STIGLICH, MARIA PAULA",
      documento: "CUIT 27-28495123-4",
      porcentaje: 100,
      estado_liquidacion_mes: "liquidado",
    },
  },
  {
    id: "c-6",
    carpeta_numero: "9",
    direccion: {
      calle: "Cavallari",
      numero: "Dpto 3A",
      uf: "UF 0770471656",
      localidad: "9 de Julio",
    },
    fecha_inicio: "2024-12-01",
    fecha_fin: "2027-11-30",
    moneda: "ARS",
    monto_alquiler_actual: 490000,
    tipo_ajuste: "ICL",
    frecuencia_ajuste_meses: 6,
    inquilino: {
      nombre: "MARTI, LORENA MARINA",
      documento: "DNI 29.876.543",
      estado_pago_mes: "pendiente",
    },
    propietario: {
      nombre: "FUREGA, LUIS ALBERTO",
      documento: "CUIT 20-17849302-8",
      porcentaje: 100,
      estado_liquidacion_mes: "pendiente",
    },
  },
];

export function ContratosHub({ initialContratos }: { initialContratos?: ContratoItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "vigentes" | "por_vencer" | "mora">("todos");
  const [selectedContratoForCobro, setSelectedContratoForCobro] = useState<ContratoItem | null>(null);

  const contratosData = initialContratos && initialContratos.length > 0 ? initialContratos : MOCK_CONTRATOS;

  // Filtrado reactivo de alta velocidad
  const filteredContratos = useMemo(() => {
    return contratosData.filter((c) => {
      // Filtro texto
      const term = searchTerm.toLowerCase();
      const matchText =
        c.carpeta_numero.includes(term) ||
        c.direccion.calle.toLowerCase().includes(term) ||
        c.direccion.numero.includes(term) ||
        c.inquilino.nombre.toLowerCase().includes(term) ||
        c.propietario.nombre.toLowerCase().includes(term);

      if (!matchText) return false;

      // Filtro por estado
      if (filterStatus === "mora") return c.inquilino.estado_pago_mes === "mora";
      if (filterStatus === "por_vencer") {
        const { daysRemaining } = calculateContractProgress(c.fecha_inicio, c.fecha_fin);
        return daysRemaining > 0 && daysRemaining <= 180;
      }
      return true;
    });
  }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input de Búsqueda Reactiva */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por carpeta (#), dirección, inquilino o dueño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-600"
          />
        </div>

        {/* Filtros Rápidos (Pills anti-fatiga) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus("todos")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
              filterStatus === "todos"
                ? "bg-slate-800 text-white font-semibold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            )}
          >
            Todos ({MOCK_CONTRATOS.length})
          </button>

          <button
            onClick={() => setFilterStatus("vigentes")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
              filterStatus === "vigentes"
                ? "bg-slate-800 text-white font-semibold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            )}
          >
            Vigentes
          </button>

          <button
            onClick={() => setFilterStatus("por_vencer")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
              filterStatus === "por_vencer"
                ? "bg-amber-800 text-white font-semibold"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Por Vencer (Últimos 6 meses)
          </button>

          <button
            onClick={() => setFilterStatus("mora")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
              filterStatus === "mora"
                ? "bg-rose-800 text-white font-semibold"
                : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            En Mora
          </button>
        </div>
      </div>

      {/* Tabla Operativa Principal (Hub Contratos estilo SPOT pero moderna) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                <th className="py-3 px-3 text-center w-20">Carpeta</th>
                <th className="py-3 px-4 w-44">Vence / Vigencia</th>
                <th className="py-3 px-4">Inmueble / Dirección</th>
                <th className="py-3 px-4">Cobranza (Inquilino)</th>
                <th className="py-3 px-4">Liquidación (Propietario)</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContratos.map((contrato) => {
                const { percent, daysRemaining, status } = calculateContractProgress(
                  contrato.fecha_inicio,
                  contrato.fecha_fin
                );

                return (
                  <tr
                    key={contrato.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* 1. CARPETA */}
                    <td className="py-3.5 px-3 text-center align-top">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-100 font-mono font-bold text-xs shadow-2xs">
                        {contrato.carpeta_numero}
                      </div>
                      <div className="mt-1 text-[10px] font-mono text-slate-600">
                        {contrato.moneda}
                      </div>
                    </td>

                    {/* 2. VENCE / VIGENCIA (Barra de progreso visual) */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-800 tabular-nums">
                        {formatDate(contrato.fecha_fin)}
                      </div>
                      
                      {/* Barra de progreso de duración del contrato */}
                      <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            status === "danger"
                              ? "bg-rose-500"
                              : status === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
                        <span>{percent}% transcurrido</span>
                        <span className="tabular-nums font-mono">{daysRemaining} días</span>
                      </div>
                    </td>

                    {/* 3. INMUEBLE / DIRECCIÓN */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-medium text-slate-800">
                        {contrato.direccion.calle} {contrato.direccion.numero}
                        {contrato.direccion.piso_dpto && (
                          <span className="text-slate-600 ml-1.5 font-normal">
                            ({contrato.direccion.piso_dpto})
                          </span>
                        )}
                      </div>
                      {contrato.direccion.uf && (
                        <div className="text-[11px] text-slate-600 font-mono">
                          {contrato.direccion.uf}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {contrato.direccion.localidad} • Ajuste {contrato.tipo_ajuste} c/{contrato.frecuencia_ajuste_meses}m
                      </div>
                    </td>

                    {/* 4. COBRANZA (INQUILINO) */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {contrato.inquilino.nombre}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono tabular-nums font-bold text-slate-900 text-xs">
                          {formatCurrency(contrato.monto_alquiler_actual, contrato.moneda)}
                        </span>

                        {contrato.inquilino.estado_pago_mes === "al_dia" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cobrado
                          </span>
                        )}

                        {contrato.inquilino.estado_pago_mes === "pendiente" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pendiente
                          </span>
                        )}

                        {contrato.inquilino.estado_pago_mes === "mora" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Mora ({contrato.inquilino.dias_mora}d)
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <button
                          onClick={() => setSelectedContratoForCobro(contrato)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
                        >
                          <Receipt className="w-3 h-3 text-slate-500" />
                          <span>{contrato.inquilino.estado_pago_mes === "al_dia" ? "Ver Recibo" : "Registrar Cobro"}</span>
                        </button>
                      </div>
                    </td>

                    {/* 5. LIQUIDACIÓN (PROPIETARIO) */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {contrato.propietario.nombre}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {contrato.propietario.estado_liquidacion_mes === "liquidado" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Rendido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pendiente
                          </span>
                        )}

                        {contrato.propietario.cbu_alias && (
                          <span className="text-[10px] text-slate-600 font-mono truncate max-w-[120px]">
                            {contrato.propietario.cbu_alias}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <button
                          disabled={contrato.inquilino.estado_pago_mes !== "al_dia"}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors shadow-2xs",
                            contrato.inquilino.estado_pago_mes === "al_dia"
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                              : "bg-slate-50 text-slate-600 border-slate-200 cursor-not-allowed"
                          )}
                        >
                          <Wallet className="w-3 h-3 text-slate-500" />
                          <span>Rendir Fondos</span>
                        </button>
                      </div>
                    </td>

                    {/* 6. ACCIÓN COMPLEMENTARIA */}
                    <td className="py-3.5 px-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Descargar Contrato PDF"
                          className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          title="Opciones avanzadas"
                          className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer Rápido de Cobro a Inquilino (1-2 clics) */}
      {selectedContratoForCobro && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Cobranza Carpeta #{selectedContratoForCobro.carpeta_numero}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedContratoForCobro.direccion.calle} {selectedContratoForCobro.direccion.numero}
                </p>
              </div>
              <button
                onClick={() => setSelectedContratoForCobro(null)}
                className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Inquilino:</span>
                  <span className="font-semibold text-slate-800">{selectedContratoForCobro.inquilino.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Alquiler Devengado:</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(selectedContratoForCobro.monto_alquiler_actual, selectedContratoForCobro.moneda)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Expensas Ordinarias:</span>
                  <span className="font-mono tabular-nums text-slate-700">$ 45.000,00</span>
                </div>
                <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900">
                  <span>Total a Percibir:</span>
                  <span className="font-mono tabular-nums text-sm">
                    {formatCurrency(selectedContratoForCobro.monto_alquiler_actual + 45000, selectedContratoForCobro.moneda)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medio de Pago
                </label>
                <select className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-400 outline-none">
                  <option value="transferencia">Transferencia Bancaria Inmediata</option>
                  <option value="efectivo">Efectivo en Caja</option>
                  <option value="deposito">Depósito Bancario</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Comprobante / Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: Transf #9821839 Banco Galicia"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedContratoForCobro(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert(`Cobro emitido exitosamente para Carpeta #${selectedContratoForCobro.carpeta_numero}. Recibo generado.`);
                  setSelectedContratoForCobro(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
              >
                Emitir Recibo y Saldo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
