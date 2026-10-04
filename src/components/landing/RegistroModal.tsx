"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Building2,
  Mail,
  Phone,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

interface RegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistroModal({ isOpen, onClose }: RegistroModalProps) {
  const [nombre, setNombre] = useState("");
  const [inmobiliaria, setInmobiliaria] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [contratosQty, setContratosQty] = useState("31-100");
  const [deseaDemo, setDeseaDemo] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola Mariano! Acabo de registrarme para la prueba gratuita de DeusX Inmobiliarias.\n\nNombre: ${nombre}\nInmobiliaria: ${inmobiliaria}\nContratos aprox: ${contratosQty}\nEmail: ${email}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#00332c] via-[#004d40] to-[#00796b] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 text-teal-200 text-[11px] font-bold border border-teal-600/60 mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" />
            14 Días Sin Costo • Sin Tarjeta
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            Comenzá a potenciar tu Inmobiliaria
          </h3>
          <p className="text-xs text-teal-100 mt-1">
            Automatizá cobranzas, indexación ICL/IPC y liquidaciones a propietarios desde hoy.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre y Apellido
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Marcelo Rossi"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inmobiliaria / Matrícula
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Rossi Propiedades (CUCICBA)"
                      value={inmobiliaria}
                      onChange={(e) => setInmobiliaria(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+54 9 11 1234-5678"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="contacto@inmobiliaria.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad de contratos de alquiler que administrás
                </label>
                <select
                  value={contratosQty}
                  onChange={(e) => setContratosQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d40] bg-white font-medium text-slate-700"
                >
                  <option value="1-30">Hasta 30 contratos (Plan Starter)</option>
                  <option value="31-100">31 a 100 contratos (Plan Inmobiliaria Pro)</option>
                  <option value="101-300">101 a 300 contratos (Plan Pro / Corporativo)</option>
                  <option value="mas-300">Más de 300 contratos (Plan Redes / Enterprise)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deseaDemo}
                    onChange={(e) => setDeseaDemo(e.target.checked)}
                    className="rounded border-slate-300 text-[#004d40] focus:ring-[#004d40] w-4 h-4"
                  />
                  <span>
                    Deseo coordinar una demo guiada de 15 min por Google Meet o WhatsApp.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#004d40] hover:bg-[#00382e] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Creando cuenta de prueba..." : "Activar Mi Prueba Gratuita (14 Días)"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sin tarjeta de crédito • Migración asistida desde Excel incluida</span>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  ¡Excelente, {nombre}! Tu solicitud fue recibida
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Hemos generado tus credenciales de acceso para <strong>{inmobiliaria}</strong>. Un especialista se comunicará vía WhatsApp para ayudarte con la configuración inicial.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/5491100000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp Ahora
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
