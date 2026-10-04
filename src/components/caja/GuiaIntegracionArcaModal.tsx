"use client";

import React from "react";
import {
  ShieldCheck,
  FileKey,
  Building,
  CheckCircle2,
  ExternalLink,
  X,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface GuiaIntegracionArcaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuiaIntegracionArcaModal({
  isOpen,
  onClose,
}: GuiaIntegracionArcaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#1C1D23] border border-[#2E303B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E303B] bg-[#141519]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#004D40]/60 border border-[#10B981]/40 text-[#34D399]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Guía Oficial de Integración con ARCA / AFIP (WSFE v1)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pasos para autorizar a DeusX Inmobiliarias a emitir Facturas Electrónicas con CAE y código QR.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#262832] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans">
          {/* Aclaración sobre el Punto de Venta */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-900/60 text-amber-300 mt-0.5 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-xs">
                ¿Qué es el "Punto de Venta" y por qué suele usarse 0004 o similar?
              </h4>
              <p className="text-[11px] text-amber-300/90 mt-1 leading-normal">
                ARCA (ex AFIP) exige que cada sistema emisor tenga un número de punto de venta <strong>diferente e independiente</strong>. Por ejemplo, el <strong>0001</strong> suele ser el sitio web de AFIP ("Comprobantes en Línea"), el <strong>0002</strong> el talonario manual de papel de respaldo. Por eso, al conectar un software ERP externo, se da de alta un número correlativo nuevo (como el <strong>0004</strong> o <strong>0005</strong>) asignado específicamente a <strong>Factura Electrónica - Web Services</strong>.
              </p>
            </div>
          </div>

          {/* Pasos de integración */}
          <div className="space-y-4">
            {/* Paso 1 */}
            <div className="p-4 rounded-xl bg-[#141519] border border-[#2E303B] space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-5 h-5 rounded-full bg-[#004D40] text-[#34D399] flex items-center justify-center text-[10px] font-mono border border-[#10B981]/50">
                  1
                </span>
                <span>Alta del Punto de Venta para Web Services en ARCA</span>
              </div>
              <p className="text-slate-400 pl-7 text-[11px]">
                Ingresá con CUIT y Clave Fiscal en{" "}
                <a
                  href="https://www.afip.gob.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#34D399] underline inline-flex items-center gap-1"
                >
                  afip.gob.ar <ExternalLink className="w-3 h-3 inline" />
                </a>{" "}
                y abrí el servicio <strong>"Administración de Puntos de Venta y Domicilios"</strong>.
              </p>
              <ul className="list-disc list-inside pl-7 text-[11px] text-slate-300 space-y-1">
                <li>Seleccioná tu empresa y hacé clic en <strong>"A/B/M Puntos de Venta" &gt; "Agregar"</strong>.</li>
                <li><strong>Número de Punto de Venta:</strong> Ingresá el correlativo siguiente (ej: 4, 5, etc.).</li>
                <li><strong>Sistema:</strong> Elegí obligatoriamente <em>"Factura Electrónica - Monotributo / IVA Web Services"</em>.</li>
                <li><strong>Domicilio:</strong> Elegí la dirección comercial de la inmobiliaria y confirmá.</li>
              </ul>
            </div>

            {/* Paso 2 */}
            <div className="p-4 rounded-xl bg-[#141519] border border-[#2E303B] space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-5 h-5 rounded-full bg-[#004D40] text-[#34D399] flex items-center justify-center text-[10px] font-mono border border-[#10B981]/50">
                  2
                </span>
                <span>Delegación del Servicio WSFEv1 (Facturación)</span>
              </div>
              <p className="text-slate-400 pl-7 text-[11px]">
                En el menú de AFIP, ingresá a <strong>"Administrador de Relaciones de Clave Fiscal"</strong>:
              </p>
              <ul className="list-disc list-inside pl-7 text-[11px] text-slate-300 space-y-1">
                <li>Hacé clic en <strong>"Nueva Relación" &gt; "Buscar Servicio" &gt; "ARCA / AFIP" &gt; "WebServices"</strong>.</li>
                <li>Seleccioná <strong>"Facturación Electrónica" (WSFEv1)</strong>.</li>
                <li>En <em>Representante</em>, confirmá tu propio CUIT o el computador fiscal delegado.</li>
              </ul>
            </div>

            {/* Paso 3 */}
            <div className="p-4 rounded-xl bg-[#141519] border border-[#2E303B] space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-5 h-5 rounded-full bg-[#004D40] text-[#34D399] flex items-center justify-center text-[10px] font-mono border border-[#10B981]/50">
                  3
                </span>
                <span>Certificado Digital X.509 (.crt) y Clave Privada (.key)</span>
              </div>
              <p className="text-slate-400 pl-7 text-[11px]">
                En <strong>"Administración de Certificados Digitales"</strong> de AFIP:
              </p>
              <ul className="list-disc list-inside pl-7 text-[11px] text-slate-300 space-y-1">
                <li>Subí el archivo de requerimiento (CSR) generado para tu CUIT.</li>
                <li>Descargá el Certificado emitido por AFIP (archivo con extensión <code>.crt</code>).</li>
                <li>Guardá junto a él tu clave privada generada (archivo con extensión <code>.key</code>).</li>
              </ul>
            </div>

            {/* Paso 4 */}
            <div className="p-4 rounded-xl bg-[#00382E]/40 border border-[#10B981]/40 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-5 h-5 rounded-full bg-[#10B981] text-[#00382E] flex items-center justify-center text-[10px] font-mono font-black">
                  4
                </span>
                <span className="text-[#A7F3D0]">Carga en DeusX Inmobiliarias & Activación</span>
              </div>
              <p className="text-slate-300 pl-7 text-[11px]">
                Dirigite a la sección <strong>Configuración &gt; Comprobantes & Emisores AFIP</strong>:
              </p>
              <ul className="list-disc list-inside pl-7 text-[11px] text-slate-200 space-y-1">
                <li>Ingresá tu <strong>CUIT real</strong>, Razón Social e Ingresos Brutos.</li>
                <li>Indicá el <strong>Punto de Venta</strong> dado de alta en el Paso 1.</li>
                <li>Adjuntá el archivo <code>.crt</code> y <code>.key</code>.</li>
                <li>¡Listo! El sistema conectará automáticamente con ARCA y validará cada factura obteniendo el CAE oficial en milisegundos.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pie con botón de acceso a configuración */}
        <div className="px-6 py-3.5 border-t border-[#2E303B] bg-[#141519] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            ¿Dudas contables? Consultá con tu contador/a para la delegación del Punto de Venta.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#262832] rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <a
              href="/configuracion"
              className="px-4 py-2 text-xs font-bold text-white bg-[#004D40] hover:bg-[#00382E] border border-[#10B981]/50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Ir a Configurar Emisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
