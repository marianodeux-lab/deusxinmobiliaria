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
  FileText,
  MessageCircle,
} from "lucide-react";
import { formatCurrency, formatDate, calculateContractProgress, cn } from "@/lib/utils";
import { generarReciboPdf } from "@/lib/pdf/reciboGenerator";
import { registrarCobranzaAction } from "@/modules/cobranzas/actions";
import {
  buildWhatsAppLink,
  crearMensajeReciboAlquiler,
  crearMensajeAvisoVencimiento,
  crearMensajeLiquidacionPropietario,
} from "@/lib/whatsapp/whatsappHelper";

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
    telefono?: string;
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

  const [contratosList, setContratosList] = useState<ContratoItem[]>(
    initialContratos && initialContratos.length > 0 ? initialContratos : MOCK_CONTRATOS
  );

  // Filtrado reactivo de alta velocidad
  const filteredContratos = useMemo(() => {
    return contratosList.filter((c) => {
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
      {/* Barra de Herramientas y Filtros (Gris Oscuro #1F2026) */}
      <div className="bg-[#1F2026] p-4 rounded-xl border border-[#2A2C35] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input de Búsqueda Reactiva */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#10B981] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por carpeta (#), dirección, inquilino o dueño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#16171C] border border-[#2A2C35] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filtros Rápidos (Verde Esmeralda Predominante) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus("todos")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border",
              filterStatus === "todos"
                ? "bg-[#004D40] text-white border-[#10B981]/50 shadow-xs"
                : "bg-[#16171C] text-slate-400 border-[#2A2C35] hover:bg-[#252831] hover:text-white"
            )}
          >
            Todos ({MOCK_CONTRATOS.length})
          </button>

          <button
            onClick={() => setFilterStatus("vigentes")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border",
              filterStatus === "vigentes"
                ? "bg-[#004D40] text-white border-[#10B981]/50 shadow-xs"
                : "bg-[#16171C] text-slate-400 border-[#2A2C35] hover:bg-[#252831] hover:text-white"
            )}
          >
            Vigentes
          </button>

          <button
            onClick={() => setFilterStatus("por_vencer")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 border",
              filterStatus === "por_vencer"
                ? "bg-amber-900/80 text-amber-200 border-amber-500/60 shadow-xs"
                : "bg-[#16171C] text-amber-400 border-[#2A2C35] hover:bg-amber-950/40"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Por Vencer (Últimos 6 meses)
          </button>

          <button
            onClick={() => setFilterStatus("mora")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 border",
              filterStatus === "mora"
                ? "bg-rose-900/80 text-rose-200 border-rose-500/60 shadow-xs"
                : "bg-[#16171C] text-rose-400 border-[#2A2C35] hover:bg-rose-950/40"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            En Mora
          </button>
        </div>
      </div>

      {/* Tabla Operativa Principal (Gris Oscuro #1F2026) */}
      <div className="bg-[#1F2026] rounded-xl border border-[#2A2C35] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#16171C] border-b border-[#262831] text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                <th className="py-3 px-3 text-center min-w-[5.5rem] w-24">Carpeta</th>
                <th className="py-3 px-4 w-44">Vence / Vigencia</th>
                <th className="py-3 px-4">Inmueble / Dirección</th>
                <th className="py-3 px-4">Cobranza (Inquilino)</th>
                <th className="py-3 px-4">Liquidación (Propietario)</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262831] text-xs">
              {filteredContratos.map((contrato) => {
                const { percent, daysRemaining, status } = calculateContractProgress(
                  contrato.fecha_inicio,
                  contrato.fecha_fin
                );

                return (
                  <tr
                    key={contrato.id}
                    className="hover:bg-[#252831] transition-colors group border-b border-[#262831]/70"
                  >
                    {/* 1. CARPETA */}
                    <td className="py-3.5 px-3 text-center align-top">
                      <div
                        title={`Carpeta Nº ${contrato.carpeta_numero}`}
                        className="inline-flex items-center justify-center min-w-[2.25rem] px-2.5 py-1 rounded-lg bg-[#121316] text-[#34D399] font-mono font-bold text-xs border border-[#10B981]/30 shadow-xs whitespace-nowrap"
                      >
                        {contrato.carpeta_numero.length > 8
                          ? `#${contrato.carpeta_numero.slice(-4)}`
                          : `#${contrato.carpeta_numero}`}
                      </div>
                      <div className="mt-1 text-[10px] font-mono text-slate-500 font-bold">
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
                        <a
                          href={buildWhatsAppLink(
                            contrato.inquilino.telefono || "5492317415612",
                            contrato.inquilino.estado_pago_mes === "al_dia"
                              ? `Hola ${contrato.inquilino.nombre}, le escribimos de DeusX Inmobiliaria respecto al contrato de ${contrato.direccion.calle} ${contrato.direccion.numero} (Carpeta #${contrato.carpeta_numero}). Le confirmamos que su estado de cuenta se encuentra al día. ¡Muchas gracias!`
                              : crearMensajeAvisoVencimiento({
                                  inquilinoNombre: contrato.inquilino.nombre,
                                  carpetaNumero: String(contrato.carpeta_numero),
                                  direccion: `${contrato.direccion.calle} ${contrato.direccion.numero}`,
                                  monto: formatCurrency(contrato.monto_alquiler_actual, contrato.moneda),
                                  fechaVencimiento: "10 del corriente",
                                  cbuAlias: contrato.propietario.cbu_alias,
                                })
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar WhatsApp al Inquilino"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
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

      {/* Drawer Rápido de Cobro a Inquilino con Emisión de Recibo Oficial PDF */}
      {selectedContratoForCobro && (
        <CobroDrawerModal
          contrato={selectedContratoForCobro}
          onClose={() => setSelectedContratoForCobro(null)}
          onSuccess={(contratoId) => {
            setContratosList((prev) =>
              prev.map((c) =>
                c.id === contratoId
                  ? {
                      ...c,
                      inquilino: {
                        ...c.inquilino,
                        estado_pago_mes: "al_dia",
                        dias_mora: 0,
                      },
                    }
                  : c
              )
            );
          }}
        />
      )}
    </div>
  );
}

interface CobroDrawerProps {
  contrato: ContratoItem;
  onClose: () => void;
  onSuccess: (contratoId: string) => void;
}

function CobroDrawerModal({ contrato, onClose, onSuccess }: CobroDrawerProps) {
  const [alquiler, setAlquiler] = useState<number>(contrato.monto_alquiler_actual);
  const [expensas, setExpensas] = useState<number>(45000);
  const [servicios, setServicios] = useState<number>(0);
  const [punitorios, setPunitorios] = useState<number>(
    contrato.inquilino.estado_pago_mes === "mora"
      ? Math.round(contrato.monto_alquiler_actual * 0.001 * (contrato.inquilino.dias_mora || 5))
      : 0
  );
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
      // 1. Registrar en Supabase
      const cobroRes = await registrarCobranzaAction({
        contrato_id: contrato.id,
        carpeta_numero: contrato.carpeta_numero,
        periodo_mes: 3,
        periodo_anio: 2026,
        monto_alquiler: alquiler,
        monto_expensas: expensas,
        monto_servicios: servicios,
        monto_punitorios: punitorios,
        total_cobrado: totalPercibido,
        medio_pago: medioPago,
        referencia_pago: referencia,
        observaciones,
      });

      const numRecibo = cobroRes.numeroRecibo || `0001-${Date.now().toString().slice(-6)}`;
      const fecha = cobroRes.fechaEmision || new Date().toLocaleDateString("es-AR");

      // 2. Generar y descargar Recibo Oficial PDF (RG AFIP 4004-E)
      const conceptosList = [
        { detalle: `Alquiler mensual carpeta #${contrato.carpeta_numero}`, importe: alquiler },
      ];
      if (expensas > 0) conceptosList.push({ detalle: "Expensas ordinarias devengadas", importe: expensas });
      if (servicios > 0) conceptosList.push({ detalle: "Servicios y tasas municipales", importe: servicios });
      if (punitorios > 0) conceptosList.push({ detalle: `Intereses punitorios por mora (${contrato.inquilino.dias_mora || 5} días)`, importe: punitorios });

      generarReciboPdf({
        numeroRecibo: numRecibo,
        fechaEmision: fecha,
        carpetaNumero: contrato.carpeta_numero,
        inmobiliaria: {
          nombre: "Deus Inmobiliaria",
          cuit: "20-33445566-9",
          domicilio: "Arturo Frondizi 1181",
          localidad: "9 de Julio",
          telefono: "02317-415612",
          matricula: "T° IV F° 124 Col. Martilleros Mercedes",
          condicionIva: "Monotributo",
        },
        inquilino: {
          nombre: contrato.inquilino.nombre,
          documento: contrato.inquilino.documento,
          telefono: contrato.inquilino.telefono,
        },
        propietario: {
          nombre: contrato.propietario.nombre,
          documento: contrato.propietario.documento,
        },
        inmueble: {
          direccion: `${contrato.direccion.calle} ${contrato.direccion.numero}`,
          localidad: contrato.direccion.localidad,
        },
        periodoMesAnio: "Marzo 2026",
        conceptos: conceptosList,
        total: totalPercibido,
        moneda: contrato.moneda,
        medioPago: `${medioPago} ${referencia ? `(Ref: ${referencia})` : ""}`,
        observaciones: observaciones || undefined,
      });

      setReciboEmitido(numRecibo);
      onSuccess(contrato.id);
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
                Carpeta #{contrato.carpeta_numero}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Registro de Cobranza & Emisión de Recibo X
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {contrato.direccion.calle} {contrato.direccion.numero} ({contrato.direccion.localidad})
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
                  contrato.inquilino.telefono || "5492317415612",
                  crearMensajeReciboAlquiler({
                    inquilinoNombre: contrato.inquilino.nombre,
                    carpetaNumero: String(contrato.carpeta_numero),
                    direccion: `${contrato.direccion.calle} ${contrato.direccion.numero}`,
                    periodo: "Marzo 2026",
                    montoTotal: formatCurrency(totalPercibido, contrato.moneda),
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
                  contrato.propietario.telefono || "5492317415612",
                  crearMensajeLiquidacionPropietario({
                    propietarioNombre: contrato.propietario.nombre,
                    carpetaNumero: String(contrato.carpeta_numero),
                    direccion: `${contrato.direccion.calle} ${contrato.direccion.numero}`,
                    montoNeto: formatCurrency(Math.round(totalPercibido * 0.95), contrato.moneda),
                    periodo: "Marzo 2026",
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
                <span className="font-bold text-slate-800 line-clamp-1">{contrato.inquilino.nombre}</span>
                <span className="text-[10px] text-slate-500">{contrato.inquilino.documento}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Propietario (Locador):</span>
                <span className="font-bold text-slate-800 line-clamp-1">{contrato.propietario.nombre}</span>
                <span className="text-[10px] text-slate-500">{contrato.propietario.documento}</span>
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
                  className="w-32 text-right font-mono font-bold text-xs p-1.5 border border-slate-200 rounded bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Expensas Ordinarias:</span>
                <input
                  type="number"
                  value={expensas}
                  onChange={(e) => setExpensas(Number(e.target.value))}
                  className="w-32 text-right font-mono text-xs p-1.5 border border-slate-200 rounded bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Servicios y Tasas:</span>
                <input
                  type="number"
                  value={servicios}
                  onChange={(e) => setServicios(Number(e.target.value))}
                  className="w-32 text-right font-mono text-xs p-1.5 border border-slate-200 rounded bg-white"
                />
              </div>

              {contrato.inquilino.estado_pago_mes === "mora" && (
                <div className="flex items-center justify-between text-xs p-1.5 bg-rose-50 border border-rose-200 rounded">
                  <span className="text-rose-800 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Punitorio Mora ({contrato.inquilino.dias_mora || 5}d):</span>
                  </span>
                  <input
                    type="number"
                    value={punitorios}
                    onChange={(e) => setPunitorios(Number(e.target.value))}
                    className="w-32 text-right font-mono font-bold text-xs p-1.5 border border-rose-300 rounded bg-white text-rose-700"
                  />
                </div>
              )}

              {/* Total Percibido */}
              <div className="p-3 bg-[#E0F2F1] rounded-xl border border-[#80CBC4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#004d40]">Total a Percibir:</span>
                <span className="text-base font-bold font-mono text-[#004d40]">
                  {formatCurrency(totalPercibido, contrato.moneda)}
                </span>
              </div>
            </div>

            {/* Medio de Pago */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Medio de Pago
                </label>
                <select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Transferencia Bancaria Inmediata">Transferencia Bancaria</option>
                  <option value="Efectivo en Caja">Efectivo en Caja</option>
                  <option value="Depósito Bancario">Depósito Bancario</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Referencia / N° Transf.
                </label>
                <input
                  type="text"
                  placeholder="Ej: Galicia #981293"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Receipt className="w-3.5 h-3.5 text-[#80CBC4]" />
                <span>{isProcessing ? "Emitiendo..." : "Registrar Cobranza & Generar Recibo PDF"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
