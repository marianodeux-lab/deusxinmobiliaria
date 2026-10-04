"use client";

import React, { useState } from "react";
import {
  Receipt,
  Wallet,
  TrendingUp,
  Share2,
  Building2,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  Zap,
  Users2,
  CalendarCheck,
  QrCode,
  DollarSign,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingModulesGridProps {
  onOpenRegistro: () => void;
}

export function LandingModulesGrid({ onOpenRegistro }: LandingModulesGridProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "alquileres" | "finanzas" | "mls">("todos");

  const modules = [
    {
      id: "cobranzas",
      category: "alquileres",
      title: "Cobranzas & Recibo X (AFIP RG 4004-E)",
      badge: "Homologado AFIP / ARCA",
      badgeColor: "bg-emerald-100 text-[#004d40] border-emerald-300",
      icon: Receipt,
      description:
        "Emisión legal de Recibo X con QR y código de barras oficial. Imputá pagos parciales, aplicá punitorios por mora automáticos y registrá cobros en efectivo, transferencia o e-check.",
      features: [
        "Comprobante oficial válido según RG 4004-E",
        "Control de mora con cálculo diario de intereses",
        "Conciliación bancaria rápida y libro de caja diario",
        "Envío automático del recibo PDF por WhatsApp",
      ],
      highlight: "Olvidate de los talonarios de papel y reclamos de inquilinos.",
    },
    {
      id: "liquidaciones",
      category: "finanzas",
      title: "Liquidaciones & Rendición a Propietarios",
      badge: "Cero Diferencias de Caja",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
      icon: Wallet,
      description:
        "Rendí a los dueños reteniendo automáticamente tus honorarios de administración (4% al 8%). Descontá expensas extraordinarias, ABL o arreglos mecánicos con respaldo digital.",
      features: [
        "Retención exacta de comisión de corretaje",
        "Deducción de gastos de mantenimiento y expensas",
        "Comprobante de transferencia bancaria adjunto",
        "Rendición consolidada multiconvenio y multi-dueño",
      ],
      highlight: "Generá las liquidaciones del mes en menos de 5 minutos.",
    },
    {
      id: "indexacion",
      category: "alquileres",
      title: "Indexación ICL / IPC en 1 Clic",
      badge: "Post-DNU 70/2023",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      icon: TrendingUp,
      description:
        "Conexión nativa diaria con APIs del Banco Central (BCRA) e INDEC. Actualizá contratos con ICL, IPC, Casa Propia o CAC en un solo clic, sin fórmulas complejas de Excel.",
      features: [
        "Ajustes trimestrales, cuatrimestrales, semestrales o anuales",
        "Notificación automática al inquilino 30 días antes",
        "Histórico auditable del valor del punto inicial y final",
        "Compatible con contratos en Pesos y en Dólares billete",
      ],
      highlight: "Cumplimiento normativo estricto y total transparencia.",
    },
    {
      id: "mls",
      category: "mls",
      title: "Red MLS B2B Inmobiliaria (50/50)",
      badge: "Red de Colegas Matriculados",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      icon: Share2,
      description:
        "Conectate con una red de inmobiliarias verificadas. Compartí tu cartera de inmuebles en venta y alquiler, y cerrá operaciones compartidas con pacto de comisión asegurado.",
      features: [
        "Bolsa nacional de propiedades exclusivas",
        "Pacto de comisión 50/50 transparente y seguro",
        "Contacto directo vía WhatsApp entre colegas matriculados",
        "Ficha blanca descargable sin datos de la otra inmobiliaria",
      ],
      highlight: "Multiplicá tus oportunidades de venta sin aumentar inventario.",
    },
    {
      id: "temporarios",
      category: "alquileres",
      title: "Temporarios & Consorcios con Expensas",
      badge: "Multi-Moneda USD & ARS",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      icon: Building2,
      description:
        "Gestioná alquileres turísticos o temporales (check-in, check-out, depósitos en garantía) y administrá consorcios con liquidación de expensas A/B/C y prorrateo porcentual.",
      features: [
        "Calendario interactivo de ocupación temporal en USD",
        "Inventario fotográfico de check-in / check-out",
        "Expensas ordinarias y extraordinarias por unidad funcional",
        "Generación masiva de boletas de expensas con código de pago",
      ],
      highlight: "Todo tu negocio inmobiliario unificado bajo una sola clave.",
    },
    {
      id: "whatsapp",
      category: "finanzas",
      title: "WhatsApp Automático & CRM de Clientes",
      badge: "Automatización Total",
      badgeColor: "bg-emerald-100 text-[#004d40] border-emerald-300",
      icon: MessageCircle,
      description:
        "Recordatorios de vencimiento antes del día 10, avisos de acreditación de pagos y envío instantáneo de comprobantes digitales directamente al WhatsApp de clientes y garantes.",
      features: [
        "Plantillas oficiales personalizadas con nombre y monto",
        "Avisos de pago recibidos con link al PDF oficial",
        "Fichas completas de inquilinos, propietarios y garantes",
        "Alertas preventivas de contratos próximos a vencer",
      ],
      highlight: "Reducí la morosidad en más de un 65% desde el primer mes.",
    },
  ];

  const filteredModules =
    activeTab === "todos"
      ? modules
      : modules.filter((m) => m.category === activeTab);

  return (
    <section id="modulos" className="py-20 md:py-28 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#004d40] text-xs font-bold border border-[#80CBC4]">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Módulos Especializados
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Todo lo que tu inmobiliaria necesita para operar sin fricción
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            DeusX reemplaza múltiples planillas desactualizadas, software obsoleto de escritorio y talonarios manuales por un ecosistema en la nube ágil y seguro.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("todos")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === "todos"
                  ? "bg-[#004d40] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Todos los Módulos
            </button>
            <button
              onClick={() => setActiveTab("alquileres")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === "alquileres"
                  ? "bg-[#004d40] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Alquileres & Indexación
            </button>
            <button
              onClick={() => setActiveTab("finanzas")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === "finanzas"
                  ? "bg-[#004d40] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Caja, AFIP & Liquidaciones
            </button>
            <button
              onClick={() => setActiveTab("mls")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === "mls"
                  ? "bg-[#004d40] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Red MLS B2B
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#80CBC4] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004d40] to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] text-[#004d40] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-[#004d40]" />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border",
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2 group-hover:text-[#004d40] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Highlight & Micro CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-[#00796b] italic">
                    {item.highlight}
                  </span>
                  <button
                    onClick={onOpenRegistro}
                    className="text-[#004d40] font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                  >
                    Ver demo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner de Migración Asistida */}
        <div className="mt-16 bg-gradient-to-r from-[#00332c] via-[#004d40] to-[#004d40] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80CBC4] bg-teal-900/60 px-3 py-1 rounded-full border border-teal-700">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#80CBC4]" />
              ¿Venís de Excel o sistemas antiguos?
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Migramos toda tu base de contratos y clientes sin costo
            </h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Nuestro equipo técnico se encarga de subir tus contratos vigentes, cánones de alquiler y datos de inquilinos en 24 horas para que arranques sin perder un solo registro.
            </p>
          </div>
          <button
            onClick={onOpenRegistro}
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-[#004d40] hover:bg-[#E0F2F1] font-extrabold text-xs shadow-md transition-all hover:scale-105"
          >
            Solicitar Migración Asistida
          </button>
        </div>
      </div>
    </section>
  );
}
