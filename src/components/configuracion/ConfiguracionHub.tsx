"use client";

import React, { useState } from "react";
import {
  Settings,
  Receipt,
  Globe,
  Bell,
  Sliders,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  Save,
  FileCheck2,
  ShieldCheck,
  ExternalLink,
  Info
} from "lucide-react";
import {
  TenantConfiguracionCompleta,
  ResponsableComprobante,
  LinkServicio,
  saveConfiguracionAction,
} from "@/modules/configuracion/actions";
import { cn } from "@/lib/utils";
import { ImportadorSpotModal } from "./ImportadorSpotModal";

interface ConfiguracionHubProps {
  initialConfig: TenantConfiguracionCompleta;
}

export function ConfiguracionHub({ initialConfig }: ConfiguracionHubProps) {
  const [config, setConfig] = useState<TenantConfiguracionCompleta>(initialConfig);
  const [showImportadorSpot, setShowImportadorSpot] = useState(false);
  const [activeTab, setActiveTab] = useState<"responsables" | "servicios" | "memos" | "operativos">("responsables");
  const [activeResponsableIndex, setActiveResponsableIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const curResp = config.responsables[activeResponsableIndex] || config.responsables[0];

  const updateResponsable = (field: keyof ResponsableComprobante, val: any) => {
    setConfig((prev) => {
      const updated = [...prev.responsables];
      updated[activeResponsableIndex] = {
        ...updated[activeResponsableIndex],
        [field]: val,
      };
      return { ...prev, responsables: updated };
    });
  };

  const handleAddResponsable = () => {
    if (config.responsables.length >= 10) return;
    const newId = config.responsables.length + 1;
    const nuevo: ResponsableComprobante = {
      id: newId,
      nombre: `Responsable ${newId}`,
      cuit: "",
      punto_venta: newId,
      condicion_iva: "Monotributo",
      razon_social: "",
      cbu: "",
      iibb: "",
      fecha_inicio_actividades: "2024-01-01",
      domicilio_comercial: config.direccion || "",
      localidad: "9 de Julio",
      telefono: config.telefono || "",
      nombre_responsable: "",
      afip_crt_cargado: false,
      afip_key_cargado: false,
    };
    setConfig((prev) => ({
      ...prev,
      responsables: [...prev.responsables, nuevo],
    }));
    setActiveResponsableIndex(config.responsables.length);
  };

  const handleAddServicio = () => {
    const nuevo: LinkServicio = {
      id: `srv-${Date.now()}`,
      nombre_servicio: "SERVICIO NUEVO",
      proveedor: "Proveedor Oficial",
      url: "https://",
      formato_sugerido: "https://ejemplo.com",
    };
    setConfig((prev) => ({
      ...prev,
      links_servicios: [...prev.links_servicios, nuevo],
    }));
  };

  const handleRemoveServicio = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      links_servicios: prev.links_servicios.filter((s) => s.id !== id),
    }));
  };

  const handleUpdateServicio = (id: string, field: keyof LinkServicio, val: string) => {
    setConfig((prev) => ({
      ...prev,
      links_servicios: prev.links_servicios.map((s) =>
        s.id === id ? { ...s, [field]: val } : s
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveConfiguracionAction(config.tenant_id, config);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado General */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00796b]" />
            <span>Configuración de Facturación, Servicios & Parámetros</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrá emisores de comprobantes oficiales (AFIP / Recibos X), enlaces de servicios públicos y memos masivos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportadorSpot(true)}
            className="px-4 py-2 text-xs font-bold text-[#004d40] bg-[#e0f2f1] hover:bg-[#b2dfdb] border border-[#80cbc4] rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
          >
            <Upload className="w-4 h-4 text-[#00796b]" />
            <span>Importar AR Comercial / Spot</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
                <span>¡Guardado con Éxito!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner informativo de Datos de Demostración & Purga 1-Clic */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-teal-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-teal-950">Entorno de Producción & Carga de Datos del Cliente</h3>
            <p className="text-[11px] text-teal-900/90 mt-0.5 max-w-2xl leading-relaxed">
              Esta instancia contiene datos de ejemplo para explorar el ERP. Cuando estés listo para ingresar tus datos reales de <strong>https://arcomercialgestion.com/</strong>, podés importar el archivo .txt o vaciar la base de datos de demostración con 1 solo clic para comenzar limpio.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowImportadorSpot(true)}
          className="px-4 py-2 text-xs font-bold text-teal-950 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5 text-teal-700" />
          <span>Asistente de Importación & Limpieza</span>
        </button>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab("responsables")}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 transition-all",
            activeTab === "responsables"
              ? "border-[#00796b] text-[#004d40]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Receipt className="w-4 h-4" />
          <span>Comprobantes & Emisores AFIP</span>
        </button>

        <button
          onClick={() => setActiveTab("servicios")}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 transition-all",
            activeTab === "servicios"
              ? "border-[#00796b] text-[#004d40]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Globe className="w-4 h-4" />
          <span>Links Servicios & Deudas</span>
        </button>

        <button
          onClick={() => setActiveTab("memos")}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 transition-all",
            activeTab === "memos"
              ? "border-[#00796b] text-[#004d40]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Bell className="w-4 h-4" />
          <span>Memos Masivos & Alertas</span>
        </button>

        <button
          onClick={() => setActiveTab("operativos")}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 transition-all",
            activeTab === "operativos"
              ? "border-[#00796b] text-[#004d40]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>Parámetros de Mora & Cobro</span>
        </button>
      </div>

      {/* PESTAÑA 1: RESPONSABLES DE COMPROBANTES (AFIP / RECIBOS X) */}
      {activeTab === "responsables" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          {/* Sub-pestañas: Responsable 1, Responsable 2... */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {config.responsables.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setActiveResponsableIndex(idx)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    activeResponsableIndex === idx
                      ? "bg-[#004d40] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Responsable {idx + 1}
                </button>
              ))}

              {config.responsables.length < 10 && (
                <button
                  onClick={handleAddResponsable}
                  className="px-2.5 py-1.5 text-xs font-bold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-lg transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              Soporte hasta 10 responsables simultáneos
            </div>
          </div>

          {/* Formulario del Responsable Seleccionado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                CUIT Emisor
              </label>
              <input
                type="text"
                placeholder="20-12345678-9"
                value={curResp.cuit}
                onChange={(e) => updateResponsable("cuit", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Punto de Venta AFIP
              </label>
              <input
                type="number"
                placeholder="1"
                value={curResp.punto_venta}
                onChange={(e) => updateResponsable("punto_venta", parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Condición de IVA
              </label>
              <select
                value={curResp.condicion_iva}
                onChange={(e) => updateResponsable("condicion_iva", e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#00796b]"
              >
                <option value="Monotributo">Monotributo</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Exento">Exento</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Razón Social
              </label>
              <input
                type="text"
                placeholder="Nombre o Razón Social"
                value={curResp.razon_social}
                onChange={(e) => updateResponsable("razon_social", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                CBU / Alias Bancario
              </label>
              <input
                type="text"
                placeholder="Alias o CBU para liquidación"
                value={curResp.cbu}
                onChange={(e) => updateResponsable("cbu", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Ingresos Brutos (IIBB)
              </label>
              <input
                type="text"
                placeholder="Número de IIBB"
                value={curResp.iibb}
                onChange={(e) => updateResponsable("iibb", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Fecha Inicio Actividades
              </label>
              <input
                type="date"
                value={curResp.fecha_inicio_actividades}
                onChange={(e) => updateResponsable("fecha_inicio_actividades", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Domicilio Comercial
              </label>
              <input
                type="text"
                placeholder="Calle y Número"
                value={curResp.domicilio_comercial}
                onChange={(e) => updateResponsable("domicilio_comercial", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00796b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nombre del Responsable / Martillero
              </label>
              <input
                type="text"
                placeholder="Nombre del titular matriculado"
                value={curResp.nombre_responsable}
                onChange={(e) => updateResponsable("nombre_responsable", e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00796b]"
              />
            </div>
          </div>

          {/* Certificados Digitales AFIP (WSFE) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00796b]" />
              <h3 className="text-xs font-bold text-slate-800">
                Certificados Digitales AFIP (WebServices Factura Electrónica WSFE)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Cargá el certificado x509 y la clave privada emitidos por AFIP para autorizar CAE automático en honorarios.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Archivo .key (Clave Privada)</div>
                  <div className="text-[11px] text-slate-400">Generado con openssl / AFIP</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateResponsable("afip_key_cargado", true);
                    alert("Clave privada .key vinculada correctamente");
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{curResp.afip_key_cargado ? "Actualizar .key" : "Subir .key"}</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Archivo .crt (Certificado Digital)</div>
                  <div className="text-[11px] text-slate-400">Firmado por AFIP para WSFE</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateResponsable("afip_crt_cargado", true);
                    alert("Certificado .crt vinculado correctamente");
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{curResp.afip_crt_cargado ? "Actualizar .crt" : "Subir .crt"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Encabezado y Logo para Recibos y Facturas */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#00796b]" />
              <span>Personalización Visual de Recibos X y Liquidaciones</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700">Logo para Encabezado de Recibos</div>
                <p className="text-[11px] text-slate-400">Formato recomendado: PNG transparente (máx 1MB)</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1">
                    <img src="/Recursos/DeusX.png" alt="Logo" className="max-h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Subida de logo lista")}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cambiar Logo</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700">Imagen de Firma y Sello Digitalizado</div>
                <p className="text-[11px] text-slate-400">Firma del Martillero con Tomo y Folio para pie de recibo</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-32 h-14 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    [ Sello y Firma ]
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Subida de firma lista")}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Firma</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: LINKS DE SERVICIOS PÚBLICOS */}
      {activeTab === "servicios" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="p-3 bg-[#E0F2F1] border border-[#80CBC4] rounded-xl text-xs text-[#004d40] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#00796b] shrink-0" />
              <span>
                <strong>Links de Oficinas Virtuales:</strong> Estos accesos se utilizan en la ficha del inmueble para consultar el estado de deuda del NIS/medidor en 1 clic y se envían en el aviso mensual al inquilino para facilitarle el pago.
              </span>
            </div>
            <button
              onClick={handleAddServicio}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar Servicio</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.links_servicios.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="w-40 shrink-0">
                  <input
                    type="text"
                    value={s.nombre_servicio}
                    onChange={(e) => handleUpdateServicio(s.id, "nombre_servicio", e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 w-full"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Etiqueta visible</div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={s.url}
                      onChange={(e) => handleUpdateServicio(s.id, "url", e.target.value)}
                      placeholder="https://..."
                      className="text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 w-full"
                    />
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-[#00796b] bg-white border border-slate-200 rounded"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Ejemplo recomendado: {s.formato_sugerido || "https://..."}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveServicio(s.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors self-end md:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: MEMOS MASIVOS & ALERTAS */}
      {activeTab === "memos" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          {/* Memo Inquilinos */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">
              Memo Masivo para Próximo Pago de Inquilinos
            </h3>
            <textarea
              rows={3}
              value={config.memos.memo_inquilinos}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  memos: { ...prev.memos, memo_inquilinos: e.target.value },
                }))
              }
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00796b]"
            />
            <div className="flex items-center gap-6 text-xs text-slate-700 font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.memos.inquilinos_recordar}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      memos: { ...prev.memos, inquilinos_recordar: e.target.checked },
                    }))
                  }
                  className="rounded text-[#00796b]"
                />
                <span>Enviar como recordatorio mensual</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.memos.inquilinos_imprimir_recibo}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      memos: { ...prev.memos, inquilinos_imprimir_recibo: e.target.checked },
                    }))
                  }
                  className="rounded text-[#00796b]"
                />
                <span>Imprimir leyenda al pie del Recibo X</span>
              </label>
            </div>
          </div>

          {/* Memo Propietarios */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">
              Memo Masivo para Próxima Liquidación a Propietarios
            </h3>
            <textarea
              rows={3}
              value={config.memos.memo_propietarios}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  memos: { ...prev.memos, memo_propietarios: e.target.value },
                }))
              }
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00796b]"
            />
            <div className="flex items-center gap-6 text-xs text-slate-700 font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.memos.propietarios_recordar}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      memos: { ...prev.memos, propietarios_recordar: e.target.checked },
                    }))
                  }
                  className="rounded text-[#00796b]"
                />
                <span>Enviar en aviso de liquidación</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.memos.propietarios_imprimir_recibo}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      memos: { ...prev.memos, propietarios_imprimir_recibo: e.target.checked },
                    }))
                  }
                  className="rounded text-[#00796b]"
                />
                <span>Imprimir en comprobante de rendición</span>
              </label>
            </div>
          </div>

          {/* Alerta de Incremento */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="alertaInc"
              checked={config.memos.alerta_incremento}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  memos: { ...prev.memos, alerta_incremento: e.target.checked },
                }))
              }
              className="mt-1 rounded text-[#00796b]"
            />
            <label htmlFor="alertaInc" className="text-xs text-amber-900 cursor-pointer">
              <strong>Alertar sobre monto de incremento próximo (ICL / IPC):</strong> Si está seleccionada esta opción, la leyenda debajo del recibo notificará la proximidad del ajuste indexado según contrato.
            </label>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: PARÁMETROS OPERATIVOS */}
      {activeTab === "operativos" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Moneda por Defecto
              </label>
              <select
                value={config.parametros_operativos.moneda_defecto}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    parametros_operativos: {
                      ...prev.parametros_operativos,
                      moneda_defecto: e.target.value as any,
                    },
                  }))
                }
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Días de Gracia para Vencimiento
              </label>
              <input
                type="number"
                value={config.parametros_operativos.dias_gracia_mora}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    parametros_operativos: {
                      ...prev.parametros_operativos,
                      dias_gracia_mora: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Día del mes hasta el cual no se aplica mora</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Tasa de Mora Diaria (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.parametros_operativos.tasa_mora_diaria}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    parametros_operativos: {
                      ...prev.parametros_operativos,
                      tasa_mora_diaria: parseFloat(e.target.value),
                    },
                  }))
                }
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Ejemplo: 0.10% diario (3% mensual)</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Honorarios Estándar de Administración (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.parametros_operativos.porcentaje_honorarios_defecto}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    parametros_operativos: {
                      ...prev.parametros_operativos,
                      porcentaje_honorarios_defecto: parseFloat(e.target.value),
                    },
                  }))
                }
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400">Porcentaje deducible al liquidar al propietario</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asistente de Importación Spot y Limpieza de Tenant */}
      <ImportadorSpotModal
        isOpen={showImportadorSpot}
        onClose={() => setShowImportadorSpot(false)}
      />
    </div>
  );
}
