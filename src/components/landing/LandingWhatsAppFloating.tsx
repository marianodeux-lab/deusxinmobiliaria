"use client";

import React, { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";

export function LandingWhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage = encodeURIComponent(
    "Hola Mariano! Vengo desde el anuncio de DeusX Inmobiliarias y me gustaría recibir asesoramiento para digitalizar mi inmobiliaria."
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Floating Tooltip Bubble */}
      {!isOpen && (
        <div className="mb-2 hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-slate-200 animate-bounce">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          ¿Dudas sobre tu inmobiliaria? Escribinos
        </div>
      )}

      {/* Main WhatsApp Floating Button */}
      <a
        href={`https://wa.me/5491100000000?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        title="Contactar por WhatsApp a Ventas"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
          1
        </span>
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      </a>
    </div>
  );
}
