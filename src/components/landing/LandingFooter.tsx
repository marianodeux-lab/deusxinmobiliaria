"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
  MessageCircle,
  LogIn,
} from "lucide-react";

interface LandingFooterProps {
  onOpenRegistro: () => void;
}

export function LandingFooter({ onOpenRegistro }: LandingFooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Upper Footer: Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand & Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/Recursos/DeusX.png"
                alt="DeusX Inmobiliarias"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
              <div>
                <span className="text-base font-black text-white tracking-tight block">
                  DeusX Inmobiliarias
                </span>
                <span className="text-[10px] font-bold text-teal-400 block font-mono">
                  ERP PropTech Argentina
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              La plataforma integral de gestión para corredores y martilleros inmobiliarios. Cobranzas con Recibo X homologado por AFIP (RG 4004-E), indexación ICL/IPC en 1 clic y liquidaciones a propietarios sin errores.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/contratos"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-950 text-teal-300 hover:bg-teal-900 border border-teal-800/80 font-bold transition-all text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Ingreso Diario al Sistema
              </Link>
              <button
                onClick={onOpenRegistro}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#004d40] hover:bg-[#00382e] text-white font-bold transition-all text-xs"
              >
                Prueba 14 Días
              </button>
            </div>
          </div>

          {/* Col 3: Módulos ERP */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Módulos ERP
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#modulos" className="hover:text-teal-400 transition-colors">
                  Cobranzas & Recibo X AFIP
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-teal-400 transition-colors">
                  Liquidaciones a Dueños
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-teal-400 transition-colors">
                  Indexación ICL / IPC
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-teal-400 transition-colors">
                  Red MLS B2B (50/50)
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-teal-400 transition-colors">
                  Temporarios en USD
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-teal-400 transition-colors">
                  Consorcios & Expensas
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Vidriera B2B */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Vidriera de Proveedores
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#proveedores" className="hover:text-teal-400 transition-colors">
                  Garantías de Fianza
                </a>
              </li>
              <li>
                <a href="#proveedores" className="hover:text-teal-400 transition-colors">
                  Escribanías & Firmas
                </a>
              </li>
              <li>
                <a href="#proveedores" className="hover:text-teal-400 transition-colors">
                  Gremios Matriculados
                </a>
              </li>
              <li>
                <a href="#proveedores" className="hover:text-teal-400 transition-colors">
                  Fotografía 360 & Dron
                </a>
              </li>
              <li>
                <a href="#proveedores" className="text-teal-400 hover:underline transition-colors flex items-center gap-1 font-bold">
                  Postular mi Empresa
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Contacto & Redes */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Atención & Soporte
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/5491100000000?text=Hola,%20quisiera%20asesoramiento%20sobre%20DeusX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors"
                >
                  WhatsApp Ventas: +54 9 11 0000-0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>contacto@deusx.com.ar</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
              <li className="pt-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">
                    Horario de Atención:
                  </span>
                  Lunes a Viernes de 9:00 a 19:00 hs.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lower Bar: Legal & Copyright */}
      <div className="border-t border-slate-800/80 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span>© {new Date().getFullYear()} DeusX Inmobiliarias. Todos los derechos reservados.</span>
            <span>•</span>
            <span>Desarrollado para el mercado inmobiliario argentino.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Normativa AFIP RG 4004-E & DNU 70/2023
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
