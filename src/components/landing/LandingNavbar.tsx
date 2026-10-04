"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  LogIn,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  onOpenRegistro: () => void;
}

export function LandingNavbar({ onOpenRegistro }: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Banner de Promoción & Redes */}
      <div className="bg-gradient-to-r from-[#00332c] via-[#004d40] to-[#00332c] text-white py-1.5 px-4 text-center text-xs font-medium border-b border-teal-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="flex items-center gap-1 font-bold text-[#80CBC4]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Lanzamiento 2026:
          </span>
          <span>14 días de prueba gratuita sin tarjeta de crédito para inmobiliarias argentinas.</span>
          <button
            onClick={onOpenRegistro}
            className="underline font-bold text-white hover:text-[#80CBC4] transition-colors ml-1 hidden sm:inline"
          >
            Comenzar Ahora →
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Oficial DeusX */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/Recursos/DeusX.png"
              alt="DeusX Inmobiliarias"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="leading-tight">
              <span className="text-sm font-black text-[#004d40] tracking-tight block">
                DeusX Inmobiliarias
              </span>
              <span className="text-[10px] font-bold text-[#00796b] block font-mono">
                ERP PropTech Argentina
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <a href="#modulos" className="hover:text-[#004d40] transition-colors">
              Módulos ERP
            </a>
            <a href="#mls" className="hover:text-[#004d40] transition-colors flex items-center gap-1">
              Red MLS <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#E0F2F1] text-[#004d40]">B2B</span>
            </a>
            <a href="#proveedores" className="hover:text-[#004d40] transition-colors flex items-center gap-1 text-[#004d40]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00796b]" />
              Vidriera de Proveedores
            </a>
            <a href="#precios" className="hover:text-[#004d40] transition-colors">
              Planes & Precios
            </a>
            <a href="#faq" className="hover:text-[#004d40] transition-colors">
              Preguntas
            </a>
          </div>

          {/* Quick Actions (Ingreso Diario + CTA Venta) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Botón de Ingreso Diario para usuarios activos */}
            <Link
              href="/contratos"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#004d40] bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-all border border-slate-200"
              title="Acceso directo a la plataforma de gestión"
            >
              <LogIn className="w-3.5 h-3.5" />
              Ingresar a mi Inmobiliaria
            </Link>

            {/* CTA de Venta / Registro */}
            <button
              onClick={onOpenRegistro}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Probar Gratis 14 Días
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/contratos"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-md"
            >
              Ingresar
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 text-sm font-semibold text-slate-800">
            <a
              href="#modulos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 hover:text-[#004d40]"
            >
              Módulos ERP
            </a>
            <a
              href="#mls"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 hover:text-[#004d40]"
            >
              Red MLS B2B
            </a>
            <a
              href="#proveedores"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-[#004d40]"
            >
              Vidriera de Proveedores (B2B)
            </a>
            <a
              href="#precios"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 hover:text-[#004d40]"
            >
              Planes & Precios
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 hover:text-[#004d40]"
            >
              Preguntas Frecuentes
            </a>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/contratos"
                className="w-full py-2.5 text-center text-xs font-bold text-slate-800 bg-slate-100 rounded-lg"
              >
                Ingresar a mi Inmobiliaria
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRegistro();
                }}
                className="w-full py-2.5 text-center text-xs font-extrabold bg-[#004d40] text-white rounded-lg"
              >
                Probar Gratis 14 Días
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
