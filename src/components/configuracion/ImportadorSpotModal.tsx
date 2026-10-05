"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Database,
  ArrowRight,
  ShieldAlert,
  Info,
  Building,
  Users,
  FolderKanban,
  X,
  Headphones,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import {
  analizarArchivoMigracionAction,
  importarDatosSpotAction,
  limpiarDatosTenantAction,
  DiagnosticResult,
} from "@/modules/migracion/actions";

interface ImportadorSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportadorSpotModal({ isOpen, onClose }: ImportadorSpotModalProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setImportResult(null);
    setDiagnostic(null);
    setIsAnalyzing(true);

    try {
      const text = await file.text();
      setFileContent(text);

      const res = await analizarArchivoMigracionAction(text, file.name);
      if (res.success && res.diagnostic) {
        setDiagnostic(res.diagnostic);
      } else {
        setErrorMsg(res.error || "No se pudo interpretar el archivo.");
      }
    } catch (err: any) {
      setErrorMsg("Error al leer el archivo: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartImport = async () => {
    if (!fileContent) return;
    setIsImporting(true);
    setErrorMsg(null);

    try {
      const res = await importarDatosSpotAction(fileContent);
      if (res.success) {
        setImportResult(res);
      } else {
        setErrorMsg(res.error || "Error durante la importación.");
      }
    } catch (err: any) {
      setErrorMsg("Excepción durante la importación: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearDemoData = async () => {
    setIsClearing(true);
    try {
      const res = await limpiarDatosTenantAction();
      if (res.success) {
        setClearSuccess(true);
        setConfirmClear(false);
        setTimeout(() => setClearSuccess(false), 4000);
      } else {
        alert("Error al limpiar datos: " + res.error);
      }
    } finally {
      setIsClearing(false);
    }
  };

  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "5491122334455";
  const supportWhatsAppLink = `https://wa.me/${supportPhone}?text=${encodeURIComponent(
    `Hola Soporte DeusX, tengo un archivo de exportación de mi sistema anterior ("${fileName || "archivo"}", ${
      diagnostic?.totalLineas || 0
    } líneas) y solicito asistencia para mapearlo e importarlo a mi cuenta.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1C1D23] border border-[#262832] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Institucional Neutro */}
        <div className="p-5 border-b border-[#262832] bg-[#141519] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00382E] border border-[#10B981]/40 text-[#34D399]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Asistente Universal de Migración & Carga de Datos
              </h3>
              <p className="text-xs text-slate-400">
                Migrá en minutos tus clientes, propiedades y contratos desde cualquier software de gestión anterior.
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {/* Banner de Datos de Ejemplo / Privacidad */}
          <div className="p-4 rounded-xl bg-[#141519] border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300 block">
                Privacidad y Limpieza de Datos de Prueba
              </span>
              <p className="text-slate-300 leading-relaxed">
                Si tu plataforma contiene datos cargados a modo de prueba o ejemplo, podés eliminarlos con 1 solo clic antes de importar la base real de tu inmobiliaria.
              </p>
              <div className="pt-2">
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Borrar Datos de Ejemplo con 1 Clic
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-[#0C0D11] p-2.5 rounded-lg border border-rose-600/50">
                    <span className="text-[11px] text-rose-200 font-semibold">
                      ¿Confirmar vaciado de propiedades, contratos y personas de prueba?
                    </span>
                    <button
                      onClick={handleClearDemoData}
                      disabled={isClearing}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold whitespace-nowrap cursor-pointer"
                    >
                      {isClearing ? "Borrando..." : "Sí, vaciar ahora"}
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 bg-[#1C1D23] text-slate-400 hover:text-white rounded text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {clearSuccess && (
                  <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ¡Datos de ejemplo eliminados con éxito! Tu inmobiliaria está limpia para la carga real.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selector de Archivo TXT / CSV */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              1. Seleccioná o arrastrá el archivo de exportación (.txt, .csv, .tsv) de tu sistema anterior
            </label>
            <div className="border-2 border-dashed border-[#262832] hover:border-[#10B981]/50 rounded-xl p-6 text-center transition-colors bg-[#141519]/50">
              <Upload className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">
                {fileName || "Arrastrá tu archivo de exportación aquí o hacé clic para buscar"}
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Archivos de respaldo o exportación de clientes, inmuebles y carpetas (.txt, .csv, .tsv)
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold cursor-pointer transition-all border border-[#10B981]/40">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Explorar Archivos</span>
                <input
                  type="file"
                  accept=".txt,.csv,.tsv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Estado de Análisis / Previsualización */}
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-[#34D399]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ejecutando diagnóstico inteligente de estructura de datos...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* RESULTADO DEL DIAGNÓSTICO INTELIGENTE */}
          {diagnostic && !importResult && (
            <div className="space-y-4 animate-in fade-in">
              {/* Tarjeta de Diagnóstico */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  diagnostic.esCompatible
                    ? "bg-[#0B1A15] border-[#10B981]/40"
                    : "bg-[#1C1610] border-amber-500/40"
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    diagnostic.esCompatible
                      ? "bg-[#00382E] text-[#34D399]"
                      : "bg-amber-950/80 text-amber-400"
                  }`}
                >
                  {diagnostic.esCompatible ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {diagnostic.formatoDetectado}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        diagnostic.esCompatible
                          ? "bg-[#004D40] text-[#34D399] border-[#10B981]/50"
                          : "bg-amber-950 text-amber-300 border-amber-600/50"
                      }`}
                    >
                      Compatibilidad: {diagnostic.score}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {diagnostic.diagnosticoDetallado}
                  </p>
                </div>
              </div>

              {/* CASO A: COMPATIBLE AUTOMÁTICAMENTE */}
              {diagnostic.esCompatible && diagnostic.preview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-[#141519] border border-[#262832] rounded-xl text-center">
                      <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <div className="text-lg font-bold font-mono text-white">
                        {diagnostic.preview.propietariosCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Propietarios</div>
                    </div>

                    <div className="p-3 bg-[#141519] border border-[#262832] rounded-xl text-center">
                      <Users className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                      <div className="text-lg font-bold font-mono text-white">
                        {diagnostic.preview.inquilinosCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Inquilinos</div>
                    </div>

                    <div className="p-3 bg-[#141519] border border-[#262832] rounded-xl text-center">
                      <Building className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold font-mono text-white">
                        {diagnostic.preview.propiedadesCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Inmuebles</div>
                    </div>

                    <div className="p-3 bg-[#141519] border border-[#262832] rounded-xl text-center">
                      <FolderKanban className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-bold font-mono text-white">
                        {diagnostic.preview.contratosCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Carpetas / Contratos</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleStartImport}
                      disabled={isImporting}
                      className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-slate-900 rounded-xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                          <span>Importando base de datos a DeusX...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-900" />
                          <span>Confirmar & Migrar Todos los Datos</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* CASO B: REQUIERE ASISTENCIA DE SOPORTE */}
              {diagnostic.requiereSoporteAsistido && (
                <div className="p-4 rounded-xl bg-[#141519] border border-[#2E303B] space-y-3">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#34D399]" />
                    <span className="text-xs font-bold text-white">
                      Servicio Gratuito de Conversión & Mapeo Asistido DeusX
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Nuestro equipo técnico cuenta con herramientas de adaptación para migrar bases de datos de cualquier software inmobiliario del país sin pérdida de datos ni riesgo de errores contables.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <a
                      href={supportWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-2.5 px-4 bg-[#004D40] hover:bg-[#00382E] text-white rounded-xl text-xs font-bold border border-[#10B981]/50 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Headphones className="w-4 h-4 text-[#34D399]" />
                      <span>Contactar a Soporte para Migración Asistida</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#34D399]" />
                    </a>
                    <button
                      onClick={handleStartImport}
                      disabled={isImporting}
                      className="w-full sm:w-auto py-2.5 px-4 bg-[#262832] hover:bg-[#2A2C35] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      Intentar importación estándar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resultado Exitoso de la Importación */}
          {importResult && (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Migración completada con éxito!</span>
              </div>
              <p className="text-xs text-slate-300">
                Se cargaron correctamente en tu inmobiliaria:
              </p>
              <ul className="text-xs text-emerald-300 font-mono space-y-1 list-disc list-inside">
                <li>{importResult.propietariosImportados} Propietarios creados</li>
                <li>{importResult.inquilinosImportados} Inquilinos creados</li>
                <li>{importResult.propiedadesImportadas} Inmuebles registrados</li>
                <li>{importResult.contratosImportados} Carpetas de alquiler activas</li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="w-full py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Finalizar y Ver Contratos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
