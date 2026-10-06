"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Plus,
  Loader2,
  X,
  ShieldCheck,
  Building,
  Key,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generarActaCierrePdf } from "@/lib/pdf/actaCierreGenerator";
import { cerrarContratoAction } from "@/modules/contratos/actions";
import { ContratoItem } from "./ContratosHub";

interface CierreAlquilerModalProps {
  contrato: ContratoItem;
  onClose: () => void;
  onSuccess: (contratoId: string) => void;
}

export function CierreAlquilerModal({ contrato, onClose, onSuccess }: CierreAlquilerModalProps) {
  const [fechaCierre, setFechaCierre] = useState(new Date().toISOString().split("T")[0]);
  const [estadoInmueble, setEstadoInmueble] = useState<"conforme" | "con_observaciones">("conforme");
  const [observaciones, setObservaciones] = useState("");
  
  // Depósito en garantía
  const [depositoOriginal, setDepositoOriginal] = useState<number>(contrato.monto_alquiler_actual);
  const [depositoActualizado, setDepositoActualizado] = useState<number>(contrato.monto_alquiler_actual);
  const [monedaDeposito, setMonedaDeposito] = useState<"ARS" | "USD">(contrato.moneda);

  // Retenciones por reparaciones o servicios
  const [retenciones, setRetenciones] = useState<Array<{ id: string; concepto: string; monto: number }>>([
    { id: "ret-1", concepto: "Fondo de reserva facturas de servicios pendientes (Luz/Gas/Agua)", monto: 0 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actaEmitida, setActaEmitida] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalDeducciones = retenciones.reduce((acc, r) => acc + (Number(r.monto) || 0), 0);
  const saldoNetoDevolver = Math.max(0, depositoActualizado - totalDeducciones);

  const handleAddRetencion = () => {
    setRetenciones((prev) => [
      ...prev,
      { id: `ret-${Date.now()}`, concepto: "Concepto de deducción", monto: 0 },
    ]);
  };

  const handleRemoveRetencion = (id: string) => {
    setRetenciones((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRetencion = (id: string, field: "concepto" | "monto", val: any) => {
    setRetenciones((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleDescargarActaPdf = () => {
    generarActaCierrePdf({
      carpetaNumero: contrato.carpeta_numero,
      fechaCierre,
      inmueble: {
        direccion: `${contrato.direccion.calle} ${contrato.direccion.numero}`,
        localidad: contrato.direccion.localidad,
      },
      locador: {
        nombre: contrato.propietario.nombre,
        documento: contrato.propietario.documento,
      },
      locatario: {
        nombre: contrato.inquilino.nombre,
        documento: contrato.inquilino.documento,
      },
      estadoInmueble,
      observacionesEstado: observaciones,
      depositoOriginal,
      depositoActualizado,
      monedaDeposito,
      retenciones: retenciones.filter((r) => r.monto > 0),
      saldoNetoDevuelto: saldoNetoDevolver,
    });
    setActaEmitida(true);
  };

  const handleConfirmarCierre = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await cerrarContratoAction({
        contrato_id: contrato.id,
        fecha_cierre: fechaCierre,
        estado_inmueble: estadoInmueble,
        observaciones_estado: observaciones || undefined,
        deposito_original: depositoOriginal,
        deposito_actualizado: depositoActualizado,
        moneda_deposito: monedaDeposito,
        retenciones: retenciones.filter((r) => r.monto > 0),
        saldo_neto_devuelto: saldoNetoDevolver,
      });

      if (res.success) {
        // Generar también el acta PDF para que le quede al usuario
        handleDescargarActaPdf();
        onSuccess(contrato.id);
        onClose();
      } else {
        setErrorMsg(res.error || "Error al formalizar el cierre.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Excepción al procesar el cierre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1C1D23] rounded-2xl border border-[#2E303B] shadow-2xl max-w-2xl w-full p-5 sm:p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-[#2A2C35] pb-3 gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-950/70 text-amber-400 border border-amber-800/60">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Cierre de Alquiler & Restitución de Inmueble
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Carpeta #{contrato.carpeta_numero} • {contrato.direccion.calle} {contrato.direccion.numero}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-[#2A2C35] flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cuerpo con Scroll */}
        <div className="py-4 space-y-4 text-xs overflow-y-auto flex-1 pr-1">
          {/* Partes y Fecha de Devolución */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-[#141519] rounded-xl border border-[#262832]">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Inquilino (Locatario):</span>
              <span className="font-bold text-white text-xs block">{contrato.inquilino.nombre}</span>
              <span className="text-[10px] text-slate-500 font-mono">{contrato.inquilino.documento}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Propietario (Locador):</span>
              <span className="font-bold text-white text-xs block">{contrato.propietario.nombre}</span>
              <span className="text-[10px] text-slate-500 font-mono">{contrato.propietario.documento}</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block font-semibold mb-1">Fecha Entrega de Llaves:</label>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full text-xs p-1.5 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-white font-mono"
              />
            </div>
          </div>

          {/* Inspección del Inmueble */}
          <div className="space-y-2 p-3 bg-[#141519] rounded-xl border border-[#262832]">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#10B981]" />
              <span>Inspección de Estado y Conservación</span>
            </h4>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="estadoInmueble"
                  checked={estadoInmueble === "conforme"}
                  onChange={() => setEstadoInmueble("conforme")}
                  className="text-[#10B981] focus:ring-[#10B981]"
                />
                <span className="text-xs text-white">Inmueble Conforme (Pintado, limpio y sin roturas)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="estadoInmueble"
                  checked={estadoInmueble === "con_observaciones"}
                  onChange={() => setEstadoInmueble("con_observaciones")}
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span className="text-xs text-amber-300">Con Observaciones / Reparaciones</span>
              </label>
            </div>

            {estadoInmueble === "con_observaciones" && (
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Detalle de paredes para repintar, canillas o vidrios rotos..."
                className="w-full text-xs p-2 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-white placeholder:text-slate-500 mt-2"
              />
            )}
          </div>

          {/* Liquidación del Depósito en Garantía */}
          <div className="space-y-3 p-3 bg-[#141519] rounded-xl border border-[#262832]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                <span>Liquidación del Depósito en Garantía</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Regulado art. 1196 CCyC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block font-semibold mb-1">
                  Depósito Original Constituido
                </label>
                <input
                  type="number"
                  value={depositoOriginal}
                  onChange={(e) => setDepositoOriginal(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-semibold mb-1">
                  Depósito Actualizado a Liquidar
                </label>
                <input
                  type="number"
                  value={depositoActualizado}
                  onChange={(e) => setDepositoActualizado(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-white font-mono font-bold text-[#34D399]"
                />
              </div>
            </div>

            {/* Deducciones / Retenciones */}
            <div className="space-y-2 pt-2 border-t border-[#262832]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">
                  Deducciones & Retenciones (Reparaciones / Servicios)
                </span>
                <button
                  type="button"
                  onClick={handleAddRetencion}
                  className="text-[10px] text-[#34D399] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar Deducción</span>
                </button>
              </div>

              {retenciones.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={r.concepto}
                    onChange={(e) => handleUpdateRetencion(r.id, "concepto", e.target.value)}
                    placeholder="Ej: Factura de gas pendiente"
                    className="flex-1 text-xs p-1.5 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-white"
                  />
                  <div className="w-32 relative">
                    <input
                      type="number"
                      value={r.monto}
                      onChange={(e) => handleUpdateRetencion(r.id, "monto", Number(e.target.value) || 0)}
                      className="w-full text-xs p-1.5 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-rose-400 font-mono text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRetencion(r.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Neto a Devolver */}
            <div className="p-3 bg-[#1C1D23] rounded-xl border border-[#2E303B] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">
                  Saldo Neto a Devolver al Locatario:
                </span>
                <span className="text-[10px] text-slate-500">
                  Total Deducciones: -{formatCurrency(totalDeducciones, monedaDeposito)}
                </span>
              </div>
              <span className="text-base font-extrabold font-mono text-[#34D399]">
                {formatCurrency(saldoNetoDevolver, monedaDeposito)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer / Acciones */}
        <div className="pt-3 border-t border-[#2A2C35] flex items-center justify-between shrink-0 gap-2">
          <button
            type="button"
            onClick={handleDescargarActaPdf}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#262832] hover:bg-[#2E303B] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Descargar Acta PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#16171C] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmarCierre}
              className="px-4 py-2 text-xs font-bold text-white bg-[#004D40] hover:bg-[#00382e] border border-[#10B981]/50 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Confirmar Cierre y Finiquito</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
