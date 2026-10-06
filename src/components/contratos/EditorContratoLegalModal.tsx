"use client";

import React, { useState } from "react";
import {
  FileText,
  Edit3,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Scale,
  Sparkles,
  Layers,
  BookOpen,
} from "lucide-react";
import {
  generarContratoPdf,
  generarContratoLegalCompletoPdf,
  CláusulaLegal,
} from "@/lib/pdf/contratoGenerator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ContratoItem } from "./ContratosHub";

interface EditorContratoLegalModalProps {
  contrato: ContratoItem;
  onClose: () => void;
}

export function EditorContratoLegalModal({ contrato, onClose }: EditorContratoLegalModalProps) {
  // Cláusulas editables
  const [clausulas, setClausulas] = useState<CláusulaLegal[]>([
    {
      numero: "PRIMERA",
      titulo: "PARTES Y DOMICILIOS ELECTRÓNICOS",
      contenido: `Entre el/la Sr./Sra. ${contrato.propietario.nombre.toUpperCase()}, DNI/CUIT Nº ${contrato.propietario.documento}, con domicilio especial electrónico declarado en legajo, en adelante el "LOCADOR"; y por la otra parte el/la Sr./Sra. ${contrato.inquilino.nombre.toUpperCase()}, DNI/CUIT Nº ${contrato.inquilino.documento}, con domicilio especial electrónico declarado en legajo, en adelante el "LOCATARIO", convienen en celebrar el presente Contrato de Locación Inmobiliaria.`,
    },
    {
      numero: "SEGUNDA",
      titulo: "OBJETO Y DESTINO",
      contenido: `El LOCADOR cede en locación al LOCATARIO, y éste acepta, el inmueble ubicado en ${contrato.direccion.calle} ${contrato.direccion.numero}, localidad de ${contrato.direccion.localidad}, provincia de Buenos Aires. El inmueble se destinará exclusivamente a VIVIENDA UNIFAMILIAR (HABITACIONAL), estándole expresamente prohibido variar dicho destino, ceder, transferir o sublocar total o parcialmente el bien, bajo apercibimiento de resolución contractual y desalojo inmediato.`,
    },
    {
      numero: "TERCERA",
      titulo: "PLAZO DE VIGENCIA",
      contenido: `El plazo de locación se pacta libremente entre las partes (art. 1198 CCyC) en 24 (veinticuatro) meses a partir del día ${formatDate(contrato.fecha_inicio)}, finalizando indefectiblemente de pleno derecho el día ${formatDate(contrato.fecha_fin)}, sin necesidad de notificación o requerimiento judicial o extrajudicial previo.`,
    },
    {
      numero: "CUARTA",
      titulo: "PRECIO DEL ALQUILER Y PAGO",
      contenido: `El precio inicial de la locación se establece en la suma de ${formatCurrency(contrato.monto_alquiler_actual, contrato.moneda)} mensuales. El canon locativo se abonará por mes adelantado del 1 al 10 de cada mes calendario mediante transferencia bancaria o en el domicilio de la administración inmobiliaria designada. La mora se operará por el mero vencimiento de los plazos sin necesidad de interpelación alguna.`,
    },
    {
      numero: "QUINTA",
      titulo: "MECANISMO DE INDEXACIÓN",
      contenido: `El canon locativo pactado se ajustará periódicamente cada ${contrato.frecuencia_ajuste_meses} meses conforme a la variación oficial acumulada del índice ${contrato.tipo_ajuste} (publicado por el Banco Central de la República Argentina o INDEC). En caso de discontinuidad o falta de publicación del índice de referencia, se utilizará en su defecto el Índice de Precios al Consumidor (IPC).`,
    },
    {
      numero: "SEXTA",
      titulo: "INTERESES POR MORA",
      contenido: `En caso de retraso en el pago del canon locativo, el LOCATARIO devengará un interés punitorio compensatorio del 0.15% diario sobre el monto adeudado hasta la fecha de su efectivo pago. La falta de pago de dos mensualidades consecutivas facultará al LOCADOR a demandar el desalojo inmediato del inmueble y el cobro ejecutivo de alquileres.`,
    },
    {
      numero: "SÉPTIMA",
      titulo: "SERVICIOS PÚBLICOS, TASAS Y EXPENSAS",
      contenido: `Serán por cuenta exclusiva del LOCATARIO el pago de los consumos de energía eléctrica, gas natural, provisión de agua corriente y las EXPENSAS ORDINARIAS del inmueble. El LOCADOR asumirá las cargas correspondientes a expensas extraordinarias y tributos sobre el inmueble (Impuesto Inmobiliario ARBA / Tasa Municipal sobre la propiedad).`,
    },
    {
      numero: "OCTAVA",
      titulo: "ESTADO DEL INMUEBLE Y CONSERVACIÓN",
      contenido: `El LOCATARIO declara recibir el inmueble en perfecto estado de conservación, pintura e higiene, con todos sus artefactos, canillas, cerraduras y vidrios sanos y funcionando. Se obliga a mantenerlo y restituirlo en las mismas condiciones, haciéndose cargo de las reparaciones locativas menores debidas al uso ordinario.`,
    },
    {
      numero: "NOVENA",
      titulo: "DEPÓSITO EN GARANTÍA",
      contenido: `En garantía del fiel cumplimiento de las obligaciones asumidas, el LOCATARIO entrega en este acto la suma de ${formatCurrency(contrato.monto_alquiler_actual, contrato.moneda)}, sirviendo el presente de eficaz recibo. Dicho depósito no podrá aplicarse al pago de alquileres y será reintegrado al LOCATARIO al momento de la restitución de llaves, una vez deducidas las eventuales deudas de servicios, expensas o deterioros comprobados.`,
    },
    {
      numero: "DÉCIMA",
      titulo: "RESCISIÓN ANTICIPADA (ART. 1221 CCyC)",
      contenido: `El LOCATARIO podrá rescindir el contrato en cualquier momento una vez transcurridos los primeros 6 meses de vigencia, notificando fehacientemente al LOCADOR con al menos un mes de anticipación y abonando en concepto de indemnización el 10% del saldo restante del canon locativo.`,
    },
    {
      numero: "UNDÉCIMA",
      titulo: "GARANTÍA Y FIANZA SOLIDARIA",
      contenido: `Presente en este acto el fiador designado se constituye en FIADOR PRINCIPAL PAGADOR, liso, llano y solidario de todas las obligaciones asumidas por el LOCATARIO, renunciando expresamente a los beneficios de división y excusión, subsistiendo la fianza hasta la efectiva restitución y desocupación del inmueble.`,
    },
    {
      numero: "DUODÉCIMA",
      titulo: "JURISDICCIÓN JUDICIAL",
      contenido: `Para todos los efectos legales y judiciales emergentes del presente contrato, las partes se someten a la jurisdicción de los Tribunales Ordinarios del Departamento Judicial de la Provincia de Buenos Aires, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponderles.`,
    },
  ]);

  const [clausulaEditandoIdx, setClausulaEditandoIdx] = useState<number | null>(null);

  const handleUpdateContenido = (idx: number, nuevoContenido: string) => {
    setClausulas((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, contenido: nuevoContenido } : c))
    );
  };

  const handleAddClausula = () => {
    const nueva: CláusulaLegal = {
      numero: "DECIMOTERCERA",
      titulo: "CONDICIONES PARTICULARES ACORDADAS",
      contenido: "Se deja expresa constancia de que las partes acuerdan las siguientes condiciones particulares: (Detallar acuerdos específicos sobre mascotas, electrodomésticos, mejoras pactadas)...",
    };
    setClausulas((prev) => [...prev, nueva]);
    setClausulaEditandoIdx(clausulas.length);
  };

  const handleRemoveClausula = (idx: number) => {
    setClausulas((prev) => prev.filter((_, i) => i !== idx));
    if (clausulaEditandoIdx === idx) setClausulaEditandoIdx(null);
  };

  const handleDescargarLegalCompleto = () => {
    generarContratoLegalCompletoPdf({
      carpetaNumero: contrato.carpeta_numero,
      tipoContrato: "Locación Habitacional (DNU 70/2023)",
      fechaInicio: contrato.fecha_inicio,
      fechaFin: contrato.fecha_fin,
      montoActual: contrato.monto_alquiler_actual,
      moneda: contrato.moneda,
      tipoAjuste: contrato.tipo_ajuste,
      frecuenciaAjusteMeses: contrato.frecuencia_ajuste_meses,
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
      clausulasPersonalizadas: clausulas,
    });
  };

  const handleDescargarResumen = () => {
    generarContratoPdf({
      carpetaNumero: contrato.carpeta_numero,
      tipoContrato: "Locación con Destino Habitacional (DNU 70/2023)",
      fechaInicio: contrato.fecha_inicio,
      fechaFin: contrato.fecha_fin,
      montoActual: contrato.monto_alquiler_actual,
      moneda: contrato.moneda,
      tipoAjuste: contrato.tipo_ajuste,
      frecuenciaAjusteMeses: contrato.frecuencia_ajuste_meses,
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
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1C1D23] rounded-2xl border border-[#2E303B] shadow-2xl max-w-4xl w-full p-5 sm:p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-[#2A2C35] pb-3 gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-950/70 text-teal-400 border border-teal-800/60">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  Editor de Contrato de Locación Legal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#004D40] text-[#34D399] border border-[#10B981]/40">
                  Régimen DNU 70/2023 & Colmart
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Carpeta #{contrato.carpeta_numero} • {clausulas.length} Cláusulas articuladas adaptables
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

        {/* Banner Informativo de Concordancia Colegios */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#141519] border border-[#262832] text-[11px] text-slate-400 flex items-start gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-bold text-slate-200">Estructura jurídica homologada: </span>
            Este instrumento cuenta con la articulación formal de 12 cláusulas sugeridas por los Colegios de Martilleros de la Prov. de Buenos Aires (Colmart) y CUCICBA. Podés editar cualquier párrafo antes de emitir el documento.
          </div>
        </div>

        {/* Lista de Cláusulas con Editor en Vivo */}
        <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 text-xs">
              Articulado del Contrato ({clausulas.length} cláusulas)
            </span>
            <button
              type="button"
              onClick={handleAddClausula}
              className="text-xs font-bold text-[#34D399] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Cláusula Particular</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {clausulas.map((c, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#141519] rounded-xl border border-[#262832] space-y-2 hover:border-[#383B47] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-[#1E2027] text-teal-400 border border-[#2E303B]">
                      CLÁUSULA {c.numero}
                    </span>
                    <span className="font-bold text-white text-xs">{c.titulo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {idx > 11 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveClausula(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Eliminar cláusula adicional"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={c.contenido}
                  onChange={(e) => handleUpdateContenido(idx, e.target.value)}
                  className="w-full text-xs p-2 bg-[#1C1D23] border border-[#2E303B] rounded-lg text-slate-200 leading-relaxed focus:border-teal-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer con opciones de descarga */}
        <div className="pt-3 border-t border-[#2A2C35] flex items-center justify-between shrink-0 gap-2">
          <button
            type="button"
            onClick={handleDescargarResumen}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#262832] hover:bg-[#2E303B] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Descargar Carátula Resumen</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#16171C] rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDescargarLegalCompleto}
              className="px-5 py-2 text-xs font-bold text-white bg-[#004D40] hover:bg-[#00382e] border border-[#10B981]/50 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-[#34D399]" />
              <span>Exportar Contrato Legal Completo (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
