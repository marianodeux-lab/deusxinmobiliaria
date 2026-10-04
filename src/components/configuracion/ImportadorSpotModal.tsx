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
} from "lucide-react";
import {
  previsualizarArchivoSpotAction,
  importarDatosSpotAction,
  limpiarDatosTenantAction,
  PreviewSpotResult,
} from "@/modules/migracion/actions";

interface ImportadorSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportadorSpotModal({ isOpen, onClose }: ImportadorSpotModalProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<PreviewSpotResult | null>(null);
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
    setIsAnalyzing(true);

    try {
      const text = await file.text();
      setFileContent(text);

      const res = await previsualizarArchivoSpotAction(text);
      if (res.success && res.preview) {
        setPreview(res.preview);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1C1D23] border border-[#262832] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#262832] bg-[#141519] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00382E] border border-[#10B981]/40 text-[#34D399]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Importación & Migración de Datos (AR Comercial Gestión / Spot)
              </h3>
              <p className="text-xs text-slate-400">
                Migrá en segundos tus clientes, propiedades y contratos desde https://arcomercialgestion.com/
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
              <p className="text-slate-300">
                Si tu plataforma contiene datos cargados a modo de prueba o ejemplo, podés eliminarlos con 1 solo clic antes de importar la base real de tu inmobiliaria.
              </p>
              <div className="pt-2">
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all flex items-center gap-1.5"
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
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold whitespace-nowrap"
                    >
                      {isClearing ? "Borrando..." : "Sí, vaciar ahora"}
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 bg-[#1C1D23] text-slate-400 hover:text-white rounded text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {clearSuccess && (
                  <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ¡Datos de ejemplo eliminados con éxito! Tu inmobiliaria está limpia.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selector de Archivo TXT */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              1. Seleccioná el archivo de exportación (.txt) de AR Comercial Gestión
            </label>
            <div className="border-2 border-dashed border-[#262832] hover:border-[#10B981]/50 rounded-xl p-6 text-center transition-colors bg-[#141519]/50">
              <Upload className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">
                {fileName || "Arrastrá tu archivo .txt aquí o hacé clic para buscar"}
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Archivo de respaldo exportado desde tu sistema anterior (ej. datos_cliente_xxx.txt)
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold cursor-pointer transition-all border border-[#10B981]/40">
                <FileText className="w-4 h-4" />
                <span>Explorar Archivos</span>
                <input
                  type="file"
                  accept=".txt"
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
              <span>Analizando estructura de tablas del archivo...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {preview && (
            <div className="space-y-3 bg-[#141519] p-4 rounded-xl border border-[#262832]">
              <span className="text-xs font-bold text-white block">
                2. Resumen de Datos Detectados en el Archivo:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#1C1D23] rounded-lg border border-[#262832]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Propietarios</span>
                  <span className="text-xl font-bold font-mono text-[#34D399]">{preview.propietariosCount}</span>
                </div>
                <div className="p-3 bg-[#1C1D23] rounded-lg border border-[#262832]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inquilinos</span>
                  <span className="text-xl font-bold font-mono text-[#34D399]">{preview.inquilinosCount}</span>
                </div>
                <div className="p-3 bg-[#1C1D23] rounded-lg border border-[#262832]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inmuebles</span>
                  <span className="text-xl font-bold font-mono text-[#34D399]">{preview.propiedadesCount}</span>
                </div>
                <div className="p-3 bg-[#1C1D23] rounded-lg border border-[#262832]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contratos</span>
                  <span className="text-xl font-bold font-mono text-[#34D399]">{preview.contratosCount}</span>
                </div>
              </div>

              {preview.samplePropiedad && (
                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <p>• Ejemplo Inmueble: <span className="text-slate-200 font-mono">{preview.samplePropiedad}</span></p>
                  <p>• Ejemplo Propietario: <span className="text-slate-200 font-mono">{preview.samplePropietario}</span></p>
                  <p>• Ejemplo Inquilino: <span className="text-slate-200 font-mono">{preview.sampleInquilino}</span></p>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="p-4 rounded-xl bg-[#00382E]/40 border border-[#10B981]/50 text-xs text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-[#34D399] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Importación Completada con Éxito!</span>
              </div>
              <p className="text-slate-300">
                Se importaron {importResult.propiedadesImportadas} inmuebles, {importResult.propietariosImportados} propietarios, {importResult.inquilinosImportados} inquilinos y {importResult.contratosImportados} contratos de locación directamente a tu catálogo.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262832] bg-[#141519] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>

          {preview && !importResult && (
            <button
              onClick={handleStartImport}
              disabled={isImporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold shadow-md transition-all border border-[#10B981]/40 disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importando registros a la base de datos...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Importación a DeusX</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
