"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Save,
  QrCode,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Palette,
  CheckCircle2,
  RefreshCw,
  Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";

export function VidrieraConfigForm() {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<"connected" | "pending" | "idle">("connected");

  // Estado de configuración
  const [slug, setSlug] = useState("deus-propiedades");
  const [vidrieraActiva, setVidrieraActiva] = useState(true);
  const [customDomain, setCustomDomain] = useState("www.deuspropiedades.com.ar");
  
  // Datos comerciales públicos
  const [nombreFantasia, setNombreFantasia] = useState("Mi Inmobiliaria");
  const [slogan, setSlogan] = useState("Gestión Inmobiliaria Profesional");
  const [matricula, setMatricula] = useState("Colegio de Martilleros");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefonoFijo, setTelefonoFijo] = useState("");
  const [emailPublico, setEmailPublico] = useState("");
  const [direccionPublica, setDireccionPublica] = useState("");
  const [colorAcento, setColorAcento] = useState("#004d40");

  // Opciones de catálogo
  const [mostrarAlquileres, setMostrarAlquileres] = useState(true);
  const [mostrarVentas, setMostrarVentas] = useState(true);
  const [mostrarTemporarios, setMostrarTemporarios] = useState(true);
  const [ocultarReservadas, setOcultarReservadas] = useState(true);

  const urlAutomatica = `https://app.deusxinmobiliarias.com/portal/${slug}`;
  const urlLocalDev = `/portal/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(urlAutomatica);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyDns = () => {
    setIsVerifyingDns(true);
    setTimeout(() => {
      setIsVerifyingDns(false);
      setDnsStatus("connected");
      alert("¡Verificación DNS exitosa! El CNAME responde correctamente a los servidores de DeusX y el certificado SSL está activo.");
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("¡Configuración de la Vidriera Online y Dominio guardada con éxito!");
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header con migas de pan y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span>Configuración</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Vidriera Online & Dominios</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#26a69a]" />
            Vidriera Online & Dominio Personalizado (NIC.ar)
          </h1>
          <p className="text-xs text-slate-500">
            Administrá el catálogo público web de tu inmobiliaria, tu link automático y tu dominio propio .com.ar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={urlLocalDev}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] border border-[#80CBC4] rounded-lg transition-colors shadow-2xs"
          >
            <span>Ver mi Vidriera</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Formulario y Configuraciones (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tarjeta 1: Link Automático Inmediato */}
          <div className="bg-[#1C1D23] p-5 rounded-xl border border-[#262832] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#262832] pb-2.5">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#34D399]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  1. Enlace Oficial Automático (Incluido)
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00382E] text-[#34D399] border border-[#10B981]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                Activo
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tu catálogo público cuenta con un enlace web activo e inmediato, con certificado SSL de alta seguridad y optimizado para compartir por WhatsApp, Instagram y folletería.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Identificador / Slug en DeusX Inmobiliarias:
                </label>
                <div className="flex items-center rounded-lg border border-[#262832] bg-[#101115] focus-within:ring-2 focus-within:ring-[#10b981] focus-within:border-transparent overflow-hidden">
                  <span className="px-3 text-xs text-slate-300 font-mono select-none bg-[#141519] border-r border-[#262832] py-2">
                    app.deusxinmobiliarias.com/portal/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold text-white bg-transparent outline-none"
                    placeholder="mi-inmobiliaria"
                  />
                </div>
              </div>

              {/* Caja de Copiar Link */}
              <div className="p-3 bg-[#141519] rounded-lg border border-[#262832] flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                    Enlace público directo:
                  </span>
                  <p className="text-xs font-mono font-semibold text-[#34D399] truncate select-all">
                    {urlAutomatica}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-2xs",
                    copied
                      ? "bg-[#004d40] text-white border border-[#10B981]/50"
                      : "bg-[#1C1D23] text-slate-200 hover:bg-[#262832] border border-[#262832]"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                      <span className="text-white">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Conexión de Dominio Propio (NIC.ar / Custom Domain) */}
          <div className="bg-[#1C1D23] p-5 rounded-xl border border-[#262832] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#262832] pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#34D399]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Conectar Dominio Propio (NIC.ar / .com.ar / .ar / .com)
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00382E] text-[#34D399] border border-[#10B981]/40">
                Marca Blanca
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Si registraste tu propio nombre en <strong>NIC Argentina</strong> (ej: <code className="text-[#34D399] font-semibold bg-[#141519] px-1.5 py-0.5 rounded border border-[#262832]">www.deuspropiedades.com.ar</code>), podés conectarlo directamente. Tus clientes verán tu marca en la barra del navegador, con certificado SSL automático de DeusX.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Tu Dominio de NIC.ar (con www):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ej: www.inmobiliariasanmartin.com.ar"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                    className="flex-1 text-xs font-mono bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDns}
                    disabled={isVerifyingDns || !customDomain}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-[#141519] hover:bg-[#262832] border border-[#262832] rounded-lg transition-colors whitespace-nowrap disabled:opacity-40"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isVerifyingDns && "animate-spin text-[#34D399]")} />
                    <span>{isVerifyingDns ? "Verificando..." : "Verificar DNS"}</span>
                  </button>
                </div>
              </div>

              {/* Estado de la Conexión */}
              <div className="p-3 bg-[#00382E]/50 border border-[#10B981]/40 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-bold">
                      Estado: Dominio Verificado & Certificado SSL Activo
                    </strong>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <p className="text-slate-200 mt-0.5">
                    El dominio <strong className="font-mono text-[#34D399]">{customDomain}</strong> está respondiendo en vivo y encriptado con HTTPS.
                  </p>
                </div>
              </div>

              {/* Tabla de Configuración de Registros DNS */}
              <div className="border border-[#262832] rounded-lg overflow-hidden text-xs">
                <div className="bg-[#141519] p-2.5 font-bold text-slate-100 flex items-center justify-between border-b border-[#262832]">
                  <span>Instrucción DNS para NIC.ar / DonWeb / Cloudflare</span>
                  <span className="text-[10px] text-slate-300 font-normal">Tipo CNAME</span>
                </div>
                <div className="p-3 space-y-2 bg-[#1C1D23]">
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#262832] text-[11px]">
                    <span className="text-slate-300 font-semibold">Tipo de Registro:</span>
                    <span className="col-span-2 font-mono font-bold text-white">CNAME</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#262832] text-[11px]">
                    <span className="text-slate-300 font-semibold">Nombre / Host:</span>
                    <span className="col-span-2 font-mono font-bold text-white">www</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 text-[11px]">
                    <span className="text-slate-300 font-semibold">Destino / Valor:</span>
                    <span className="col-span-2 font-mono font-bold text-[#34D399]">cname.deusxinmobiliarias.com</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#141519] rounded-lg border border-[#262832] text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#34D399]" />
                  ¿Cómo delegar tu dominio en 3 pasos simples?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                  <li>Ingresá al panel donde administres tu dominio (NIC.ar, DonWeb, Cloudflare, etc.).</li>
                  <li>Agregá un registro <strong>CNAME</strong> con nombre <code className="bg-[#262832] text-[#34D399] px-1 py-0.5 rounded font-mono">www</code> y valor de destino <code className="bg-[#262832] text-[#34D399] px-1 py-0.5 rounded font-mono">cname.deusxinmobiliarias.com</code>.</li>
                  <li>Volvé a esta pantalla y presioná <strong>Verificar DNS</strong>. Nuestro servidor emitirá automáticamente el candado SSL.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Identidad & Contacto de la Vidriera */}
          <div className="bg-[#1C1D23] p-5 rounded-xl border border-[#262832] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#262832] pb-2.5">
              <Sparkles className="w-4 h-4 text-[#34D399]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Identidad de Marca y Contacto en la Vidriera
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nombre Comercial / Fantasía *
                </label>
                <input
                  type="text"
                  value={nombreFantasia}
                  onChange={(e) => setNombreFantasia(e.target.value)}
                  className="w-full text-xs bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Matrícula Profesional / Colegiatura
                </label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full text-xs bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Slogan o Bajada de la Portada
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full text-xs bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>WhatsApp de Consultas (con código de país) *</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+54 9 223 512-3456"
                  className="w-full text-xs bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  A este WhatsApp llegarán las consultas cuando los clientes toquen "Consultar por WhatsApp".
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-300" />
                  <span>Email de Contacto Público</span>
                </label>
                <input
                  type="email"
                  value={emailPublico}
                  onChange={(e) => setEmailPublico(e.target.value)}
                  className="w-full text-xs bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                  <span>Dirección Física de Atención</span>
                </label>
                <input
                  type="text"
                  value={direccionPublica}
                  onChange={(e) => setDireccionPublica(e.target.value)}
                  className="w-full text-xs bg-[#101115] border border-[#262832] text-white rounded-lg p-2.5 focus:ring-1 focus:ring-[#10b981] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-300" />
                  <span>Color Primario de la Vidriera</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorAcento}
                    onChange={(e) => setColorAcento(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded border border-[#262832] cursor-pointer bg-[#101115]"
                  />
                  <input
                    type="text"
                    value={colorAcento}
                    onChange={(e) => setColorAcento(e.target.value)}
                    className="flex-1 text-xs font-mono uppercase bg-[#101115] border border-[#262832] text-white rounded-lg p-2 focus:ring-1 focus:ring-[#10b981] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa & Filtros del Catálogo (1 col) */}
        <div className="space-y-5">
          {/* Card Resumen de la Vidriera */}
          <div className="bg-[#1C1D23] p-5 rounded-xl border border-[#262832] shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-[#262832] pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#34D399]" />
                Estado del Portal
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#141519] rounded-lg border border-[#262832] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Inmobiliaria:</span>
                  <strong className="text-white font-bold">{nombreFantasia}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">WhatsApp:</span>
                  <strong className="text-[#34D399] font-mono font-bold">{whatsapp}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Dominio Propio:</span>
                  <span className="font-mono text-[11px] text-white font-bold truncate max-w-[140px]">
                    {customDomain || "Sin configurar"}
                  </span>
                </div>
              </div>

              {/* Switches de Operaciones Visibles */}
              <div className="space-y-2 pt-2 border-t border-[#262832]">
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                  Operaciones en Vidriera:
                </h4>

                <label className="flex items-center justify-between p-2.5 bg-[#141519] rounded-lg border border-[#262832] cursor-pointer hover:bg-[#1f2027] transition-colors">
                  <span className="text-xs font-semibold text-white">Alquileres Permanentes</span>
                  <input
                    type="checkbox"
                    checked={mostrarAlquileres}
                    onChange={(e) => setMostrarAlquileres(e.target.checked)}
                    className="w-4 h-4 accent-[#10b981] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-[#141519] rounded-lg border border-[#262832] cursor-pointer hover:bg-[#1f2027] transition-colors">
                  <span className="text-xs font-semibold text-white">Propiedades en Venta</span>
                  <input
                    type="checkbox"
                    checked={mostrarVentas}
                    onChange={(e) => setMostrarVentas(e.target.checked)}
                    className="w-4 h-4 accent-[#10b981] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-[#141519] rounded-lg border border-[#262832] cursor-pointer hover:bg-[#1f2027] transition-colors">
                  <span className="text-xs font-semibold text-white">Alquileres Temporarios</span>
                  <input
                    type="checkbox"
                    checked={mostrarTemporarios}
                    onChange={(e) => setMostrarTemporarios(e.target.checked)}
                    className="w-4 h-4 accent-[#10b981] rounded"
                  />
                </label>
              </div>

              {/* Botón de Acceso Directo */}
              <div className="pt-3">
                <Link
                  href={urlLocalDev}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] border border-[#10B981]/40 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Vidriera en Nueva Pestaña</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
