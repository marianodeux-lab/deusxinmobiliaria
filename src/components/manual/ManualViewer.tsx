"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Users,
  Building,
  FolderKanban,
  Receipt,
  Key,
  Database,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  HelpCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
  Image,
  ArrowRight,
  Layers,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualSection {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  badge: string;
  summary: string;
  linkHref?: string;
  linkLabel?: string;
  content: React.ReactNode;
}

export function ManualViewer() {
  const [activeTab, setActiveTab] = useState<string>("contratos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const SECTIONS: ManualSection[] = [
    {
      id: "multi-usuario",
      title: "1. Gestión de Equipo & Control de Licencia Multi-Operador",
      shortTitle: "1. Equipo & Licencias",
      icon: Users,
      badge: "Hasta 5 Operadores",
      summary: "Aislamiento estricto por tenant, gestión de responsables con claves individuales y límite de operadores activos.",
      linkHref: "/configuracion",
      linkLabel: "Ir a Configuración",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#2A2C35] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Arquitectura de Licenciamiento & Seguridad
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              DeusX Inmobiliarias opera sobre una <strong>base de datos única compartida con aislamiento estricto por licencia (<code className="text-[#34D399]">tenant_id</code>)</strong> mediante Row Level Security (RLS) en Supabase. Esto garantiza máxima velocidad, mantenimiento centralizado y confidencialidad absoluta entre inmobiliarias.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-[#10B981]">
              Puntos Clave del Módulo:
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Hasta 5 Operadores por Licencia Activa:</strong>
                  Cada colaborador de tu oficina (martillero titular, secretaría, tesorería, captador) puede tener su propio usuario y contraseña independiente sin costos adicionales.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Gestión de Contraseña y Responsables:</strong>
                  Desde <Link href="/configuracion" className="text-[#34D399] underline">Configuración Tenant</Link>, el martillero titular puede dar de alta nuevos operadores, modificar credenciales y actualizar los datos comerciales de la matrícula oficial.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Trazabilidad de Movimientos:</strong>
                  Cada cobro, emisión de recibo o modificación de contrato queda sellado con el usuario que ejecutó la operación.
                </div>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "propiedades",
      title: "2. Catálogo de Inmuebles & Vidriera Web con Fotos WebP",
      shortTitle: "2. Propiedades & Vidriera",
      icon: Building,
      badge: "15 Fotos WebP",
      summary: "Carga de propiedades, compresión automática de imágenes en cliente a WebP 1280x800 y vidriera con dominio propio.",
      linkHref: "/configuracion/vidriera",
      linkLabel: "Ver Vidriera Online",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#2A2C35] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-[#10B981]" />
              Subida Eficiente de Fotos (Compresión WebP en el Cliente)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cada ficha de propiedad admite hasta <strong>15 imágenes</strong>. Para no saturar la cuota de tu base de datos ni los planes de almacenamiento en la nube, el sistema comprime y reescala automáticamente las fotos en el navegador del usuario a <strong>formato WebP estándar (1280x800 px)</strong> antes de subirlas. Esto reduce el peso de 8 MB a menos de 200 KB sin perder nitidez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#16171C] p-3.5 rounded-xl border border-[#252731] space-y-2">
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#34D399]" />
                Ficha del Inmueble Completa
              </h5>
              <p className="text-xs text-slate-400">
                Admite dirección, tipo de propiedad (departamento, casa, local, cochera), destino, superficie cubierta/total, cantidad de ambientes y texto descriptivo libre para la publicación.
              </p>
            </div>

            <div className="bg-[#16171C] p-3.5 rounded-xl border border-[#252731] space-y-2">
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#34D399]" />
                Vidriera Online con Dominio NIC.ar
              </h5>
              <p className="text-xs text-slate-400">
                Tus propiedades marcadas como <em>"Publicadas"</em> se sincronizan en tiempo real con tu web pública conectada a tu dominio de NIC.ar (ej: <code>www.tuagencia.com.ar</code>) con certificado SSL gratis.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contratos",
      title: "3. Contratos DNU 70/2023, Cláusulas Colmart & Editor Legal",
      shortTitle: "3. Contratos & Legal",
      icon: FolderKanban,
      badge: "DNU 70/2023",
      summary: "Instrumento legal articulado de 12 cláusulas Colmart/CUCICBA, depósito en garantía seteable y editor previo a la emisión en PDF.",
      linkHref: "/contratos/nuevo",
      linkLabel: "Crear Nuevo Contrato",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#00382E] to-[#16171C] border border-[#10B981]/40 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#10B981]" />
              Concordancia con Colegios de Martilleros (Colmart PBA & CUCICBA)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bajo la vigencia del <strong>DNU 70/2023</strong> y las directivas colegiales, el contrato generado por DeusX no es una simple carátula, sino un <strong>instrumento legal articulado completo de 12 cláusulas canónicas</strong> (Partes, Objeto, Plazo, Precio, Indexación, Destino, Depósito, Conservación, Intromisión, Rescisión, Garantías y Jurisdicción).
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-[#10B981]">
              Variables Seteables por el Usuario:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <strong className="text-white block mb-1">Depósito en Garantía:</strong>
                Fijá la cantidad de meses (1 o 2), la moneda (<strong>Pesos ARS o Dólares USD billete</strong>), el monto integrado y la custodia inmobiliaria.
              </div>
              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <strong className="text-white block mb-1">Garantías & Avales:</strong>
                Configurá si es Seguro de Caución (Finaer, Premium Group), Garantía Propietaria, Fianza Personal con Recibos de Sueldo o Aval Bancario con detalle de póliza o matrícula.
              </div>
              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <strong className="text-white block mb-1">Frecuencia & Índice de Ajuste:</strong>
                Elegí entre <strong>ICL (BCRA)</strong>, <strong>IPC (INDEC)</strong>, <strong>UVA</strong> o valores fijos escalonados, con frecuencias trimestrales, cuatrimestrales, semestrales o anuales.
              </div>
              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731]">
                <strong className="text-white block mb-1">Editor Previo de Cláusulas:</strong>
                Desde el menú de cada carpeta podés hacer clic en <strong>"Editar Contrato Legal (Colmart)"</strong> para modificar cualquier párrafo, agregar cláusulas particulares y descargar el PDF final listo para firmar.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cobranzas",
      title: "4. Registro de Cobranzas, Recibos X Oficiales & WhatsApp",
      shortTitle: "4. Cobranzas & Recibos",
      icon: Receipt,
      badge: "RG AFIP 4004-E",
      summary: "Cobranzas mensuales, desglose de alquiler, expensas y punitorios, emisión de Recibo X PDF y envío por WhatsApp.",
      linkHref: "/cobranzas",
      linkLabel: "Ir a Cobranzas",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#2A2C35] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#10B981]" />
              Emisión de Recibo X de Validez Oficial (RG 4004-E)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cumpliendo con la normativa de cobranza por cuenta y orden de terceros, el sistema emite automáticamente el <strong>Recibo X numerado correlativo</strong> con desglose de alquiler básico, expensas ordinarias, servicios y punitorios diarios en caso de mora.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-[#10B981]">
              Flujo Operativo de Cobro:
            </h5>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
              <li className="bg-[#16171C] p-2.5 rounded-lg border border-[#252731]">
                Ubicá la carpeta en el hub de contratos o módulo de cobranzas y hacé clic en el ícono de recibo.
              </li>
              <li className="bg-[#16171C] p-2.5 rounded-lg border border-[#252731]">
                Verificá los conceptos (alquiler, expensas, servicios y cálculo automático de punitorios por mora).
              </li>
              <li className="bg-[#16171C] p-2.5 rounded-lg border border-[#252731]">
                Seleccioná el medio de pago (Transferencia bancaria, efectivo, depósito) y confirmá la cobranza.
              </li>
              <li className="bg-[#16171C] p-2.5 rounded-lg border border-[#252731]">
                Se descarga automáticamente el <strong>PDF de alta definición con membrete y firma</strong>, y se habilitan los botones para <strong>enviar el comprobante directo por WhatsApp</strong> tanto al inquilino como la rendición al propietario.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "cierre",
      title: "5. Ciclo de Cierre de Alquiler, Acta de Restitución & Depósito",
      shortTitle: "5. Cierre & Restitución",
      icon: Key,
      badge: "Directiva Principal",
      summary: "Filtrado automático de contratos vencidos, acta formal de entrega de llaves, liquidación de garantías y liberación del inmueble.",
      linkHref: "/contratos",
      linkLabel: "Ver Hub de Contratos",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Directiva Obligatoria: Instancia Formal de Cierre
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Los contratos cuya fecha de vigencia expiró se filtran obligatoriamente bajo la vista <strong>"Terminados"</strong> para mantener despejado el panel operativo de cobranzas activas. Ningún contrato se archiva de forma informal: debe formalizarse el cierre mediante el <strong>Acta de Restitución de Inmueble y Finiquito de Locación</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-[#10B981]">
              Pasos del Cierre en el Sistema:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731] space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  1. Restitución de Llaves e Inspección
                </span>
                <p className="text-slate-400 text-[11px]">
                  Se registra la entrega formal de juegos de llaves y el estado de pintura, artefactos y conservación del inmueble.
                </p>
              </div>

              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731] space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  2. Libre Deuda de Servicios
                </span>
                <p className="text-slate-400 text-[11px]">
                  Verificación de comprobantes finales y medidores de energía eléctrica, gas natural, agua y tasas municipales.
                </p>
              </div>

              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731] space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  3. Liquidación del Depósito
                </span>
                <p className="text-slate-400 text-[11px]">
                  Cálculo del saldo a reintegrar al inquilino, deduciendo reparaciones pendientes o facturas adeudadas con justificativo.
                </p>
              </div>

              <div className="bg-[#16171C] p-3 rounded-lg border border-[#252731] space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  4. Liberación de la Propiedad
                </span>
                <p className="text-slate-400 text-[11px]">
                  Al confirmar el cierre, el contrato pasa a estado <em>finalizado</em> y la propiedad queda automáticamente disponible en el catálogo para volver a alquilarse o venderse.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "migracion",
      title: "6. Migración Asistida de Datos desde SPOT y Archivos Legados",
      shortTitle: "6. Migrador de Datos",
      icon: Database,
      badge: "Importador Masivo",
      summary: "Carga masiva de carteras, propiedades, inquilinos y contratos desde archivos de texto o Excel con integridad referencial.",
      linkHref: "/configuracion",
      linkLabel: "Asistente de Migración",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#2A2C35] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#10B981]" />
              Migración Sin Carga Manual
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si tu inmobiliaria proviene de sistemas antiguos como <strong>SPOT Inmobiliario</strong> o planillas Excel, DeusX cuenta con un motor de parsing inteligente que cruza tablas de propietarios, inquilinos, inmuebles y contratos activos, insertándolos directamente bajo tu cuenta.
            </p>
          </div>

          <div className="p-3.5 bg-[#16171C] rounded-xl border border-[#252731] space-y-2 text-xs">
            <strong className="text-white block">Recomendaciones para una Migración Limpia:</strong>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Asegurate de que el archivo exportado contenga las tablas de propietarios e inquilinos completas.</li>
              <li>El parser estandariza automáticamente los formatos de fecha, importes y teléfonos argentinos con prefijo +54 9.</li>
              <li>Podés solicitar al equipo de soporte una prueba de importación previa en entorno de staging antes de pasar a producción.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "pwa",
      title: "7. Modo Aplicación Instalable (PWA para Windows, Android e iOS)",
      shortTitle: "7. App Instalable (PWA)",
      icon: Smartphone,
      badge: "Desktop & Mobile",
      summary: "Instalación directa sin pasar por tiendas de aplicaciones, acceso ultra rápido desde la barra de tareas y el celular.",
      content: (
        <div className="space-y-6 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-[#1C1D23] border border-[#2A2C35] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#10B981]" />
              DeusX como Aplicación de Escritorio y Celular
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              La plataforma está construida bajo los estándares de <strong>Progressive Web App (PWA)</strong>. No requiere descargar archivos .exe pesados ni lidiar con actualizaciones manuales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#16171C] p-3.5 rounded-xl border border-[#252731] space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5">
                <LaptopIcon className="w-4 h-4 text-[#34D399]" />
                En Windows (PC / Notebook)
              </h5>
              <p className="text-slate-400 leading-relaxed">
                Abrí la app en Google Chrome o Microsoft Edge. En el extremo derecho de la barra de direcciones verás el ícono de <strong>"Instalar DeusX Inmobiliarias"</strong>. Hacé clic y se creará un acceso directo en tu barra de tareas como aplicación nativa independiente.
              </p>
            </div>

            <div className="bg-[#16171C] p-3.5 rounded-xl border border-[#252731] space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#34D399]" />
                En Teléfonos Android & iOS
              </h5>
              <p className="text-slate-400 leading-relaxed">
                En Android (Chrome): tocá los tres puntos y elegí <em>"Instalar aplicación"</em> o <em>"Agregar a la pantalla principal"</em>.<br />
                En iPhone (Safari): tocá el botón Compartir y seleccioná <em>"Agregar al inicio"</em>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.shortTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, SECTIONS]);

  const activeSection = useMemo(() => {
    return SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0];
  }, [activeTab, SECTIONS]);

  return (
    <div className="space-y-6">
      {/* Cabecera del Manual */}
      <div className="bg-[#1C1D23] p-6 rounded-2xl border border-[#2A2C35] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#004D40] text-[#34D399] rounded-md border border-[#10B981]/30">
              Guía Oficial de Usuario
            </span>
            <span className="text-xs text-slate-500 font-mono">v1.2.0 • PropTech Argentina</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#10B981]" />
            Manual de Instrucciones & Buenas Prácticas
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Aprende a dominar todas las funcionalidades de DeusX: contratos DNU 70/2023, editor de cláusulas Colmart, cobros con Recibo X, cierre de alquiler y vidriera online.
          </p>
        </div>

        {/* Buscador Rápido del Manual */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-[#10B981] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en el manual (ej: depósito, ICL, fotos)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#16171C] border border-[#2A2C35] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>
      </div>

      {/* Grid: Navegación Izquierda + Contenido Didáctico Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pestañas de Secciones (Columna Izquierda 4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
            <span>Módulos de la App</span>
            <span className="text-[10px] text-slate-500">{filteredSections.length} temas</span>
          </div>

          <div className="space-y-1.5">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeTab === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group",
                    isSelected
                      ? "bg-gradient-to-r from-[#00382E] to-[#16171C] border-[#10B981] shadow-lg text-white"
                      : "bg-[#1C1D23] border-[#2A2C35] text-slate-300 hover:bg-[#252833] hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0 transition-colors",
                      isSelected
                        ? "bg-[#004D40] text-[#34D399]"
                        : "bg-[#141519] text-slate-400 group-hover:text-[#10B981]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate block">{sec.shortTitle}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141519] text-slate-400 border border-[#262832]">
                        {sec.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{sec.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de Contenido Didáctico (Columna Derecha 8 cols) */}
        <div className="lg:col-span-8 bg-[#1C1D23] p-6 rounded-2xl border border-[#2A2C35] shadow-xl space-y-6">
          {/* Header de la sección activa */}
          <div className="border-b border-[#2A2C35] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141519] text-[#10B981] rounded border border-[#10B981]/30">
                  {activeSection.badge}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{activeSection.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeSection.summary}</p>
            </div>

            {activeSection.linkHref && (
              <Link
                href={activeSection.linkHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#004D40] hover:bg-[#005a4b] border border-[#10B981]/40 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <span>{activeSection.linkLabel || "Abrir Módulo"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Cuerpo de la Sección */}
          <div className="pt-1">{activeSection.content}</div>

          {/* Footer de navegación entre temas */}
          <div className="border-t border-[#2A2C35] pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>¿Tenés dudas sobre algún caso particular?</span>
            <a
              href="https://wa.me/5491100000000?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20uso%20de%20DeusX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#34D399] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Consultar por WhatsApp a Soporte</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaptopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </svg>
  );
}
