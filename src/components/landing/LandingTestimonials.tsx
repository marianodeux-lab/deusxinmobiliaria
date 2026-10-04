"use client";

import React from "react";
import { Star, ShieldCheck, Quote, Building2 } from "lucide-react";

export function LandingTestimonials() {
  const testimonials = [
    {
      id: 1,
      quote:
        "Antes perdíamos 4 días enteros cada inicio de mes cruzando extractos bancarios con Excel para liquidar a los propietarios. Con DeusX, cobramos con Recibo X homologado y liquidamos 85 contratos en una mañana. La tranquilidad de no tener errores de caja no tiene precio.",
      author: "Martillero Gustavo Rossi",
      role: "Titular de Rossi Propiedades",
      location: "CABA (Matrícula CUCICBA 7412)",
      contracts: "85 contratos activos",
      rating: 5,
    },
    {
      id: 2,
      quote:
        "El ajuste por ICL e IPC post-DNU 70 era un dolor de cabeza diario. Inquilinos reclamando fórmulas, fechas desfasadas... Ahora el sistema toma el dato directo del BCRA y les manda el aviso formal con 30 días de anticipación por WhatsApp. La mora nos bajó a menos del 1%.",
      author: "Dra. Valeria Benítez",
      role: "Directora en Benítez & Asociados Inmobiliaria",
      location: "San Isidro, Zona Norte (CMCPSI 6108)",
      contracts: "140 contratos activos",
      rating: 5,
    },
    {
      id: 3,
      quote:
        "La Red MLS B2B nos cambió la dinámica de ventas: cerramos dos operaciones compartidas al 50/50 el mes pasado con colegas que conocimos a través de la plataforma. Y con las garantías de fianza de la Vidriera, generamos comisiones extra que pagan solas el abono del software.",
      author: "Lic. Federico Morales",
      role: "Socio Fundador en Morales Inmuebles",
      location: "Rosario, Santa Fe (COCIR 1892)",
      contracts: "210 contratos activos",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#004d40] text-xs font-bold border border-[#80CBC4]">
            <Quote className="w-3.5 h-3.5 text-teal-700" />
            Experiencias Reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Inmobiliarias que multiplicaron su eficiencia operativa
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Descubrí cómo colegas matriculados de todo el país transformaron su administración diaria.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 rounded-2xl p-6 sm:p-7 border border-slate-200/90 hover:border-[#80CBC4] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.author}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#00796b]">
                    {item.role}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {item.location}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                  {item.contracts}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
