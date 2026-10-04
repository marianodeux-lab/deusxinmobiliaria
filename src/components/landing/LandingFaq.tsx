"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Cómo funciona la emisión del Recibo X según la Resolución General 4004-E de AFIP?",
      a: "La RG 4004-E de AFIP/ARCA establece el régimen especial de comprobantes para inmobiliarias que cobran alquileres por cuenta y orden de terceros. DeusX genera de forma automática el comprobante oficial 'Recibo X' con código de barras y QR reglamentario, dejando constancia de la percepción de fondos sin que la inmobiliaria tribute IVA sobre el monto total del canon del propietario, cobrando únicamente sobre sus honorarios de administración.",
    },
    {
      q: "¿Cómo se calculan los aumentos de alquiler con ICL e IPC tras el DNU 70/2023?",
      a: "El DNU 70/2023 restituyó la libertad contractual en plazos, monedas y fórmulas de ajuste. DeusX está sincronizado en tiempo real con las APIs del Banco Central (BCRA) y del INDEC. Ya sea que hayas pactado indexación cuatrimestral por ICL, semestral por IPC o combinada, el sistema calcula el nuevo importe con 1 solo clic y genera la notificación formal para enviar al inquilino con 30 días de anticipación.",
    },
    {
      q: "¿Puedo migrar mi cartera de clientes y contratos desde Excel o sistemas antiguos como SPOT?",
      a: "Sí, totalmente. Contamos con un importador masivo y nuestro equipo de soporte técnico realiza la migración asistida de tu cartera (inmuebles, inquilinos, garantes, propietarios y saldos pendientes) sin costo adicional en menos de 24 horas, para que no tengas que cargar nada a mano.",
    },
    {
      q: "¿Cómo funciona la Red MLS B2B y el pacto de comisión compartida 50/50?",
      a: "La Red MLS de DeusX es de acceso exclusivo para corredores y martilleros inmobiliarios con matrícula colegiada activa. Podés compartir propiedades en venta o alquiler en una bolsa intercolegial con un clic. El sistema emite fichas blancas sin los datos de contacto de tu inmobiliaria para que tu colega pueda enviársela a su comprador, garantizando la división del 50/50 de honorarios.",
    },
    {
      q: "¿Qué es la Vidriera de Proveedores y cómo genero ingresos extra para mi inmobiliaria?",
      a: "La Vidriera B2B reúne empresas de primera línea del rubro: compañías de fianzas y seguros de caución (Finaer, Garantor), estudios notariales para certificaciones exprés, gremios matriculados para refacciones de entrega de llaves y fotógrafos 360. A través de DeusX, tu inmobiliaria accede a tarifas preferenciales y convenios con comisiones por derivación directa en pólizas de caución.",
    },
    {
      q: "¿DeusX retiene o intermedia el dinero de los alquileres?",
      a: "No. El 100% de los fondos ingresa de forma directa a las cuentas bancarias o cajas de tu inmobiliaria o de tus propietarios. DeusX es un ERP de gestión operativa, contable y documental; no es una pasarela de pago que retenga tu dinero.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#004d40] text-xs font-bold border border-[#80CBC4]">
            <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
            Preguntas Frecuentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Respuestas claras a tus dudas operativas y normativas
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Todo lo que necesitás saber antes de sumarte a DeusX Inmobiliarias.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isOpen
                    ? "border-[#004d40]/30 bg-[#F4FBF9]/60 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200",
                      isOpen
                        ? "bg-[#004d40] text-white rotate-180"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900">
              ¿Tenés una consulta específica sobre tu inmobiliaria?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Nuestro equipo comercial y técnico responde en tiempo real por WhatsApp.
            </p>
          </div>
          <a
            href="https://wa.me/5491100000000?text=Hola,%20tengo%20una%20consulta%20sobre%20DeusX%20Inmobiliarias"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-[#004d40] hover:bg-[#00382e] text-white font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
