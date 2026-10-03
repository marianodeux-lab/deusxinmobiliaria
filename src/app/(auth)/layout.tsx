import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Building, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#edf6f7] flex flex-col justify-between p-4 sm:p-6 font-sans text-slate-800">
      {/* Top Header con Logo Oficial DeusX */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/Recursos/DeusX.png"
            alt="DeusX Inmobiliarias"
            className="h-8 w-auto object-contain filter drop-shadow-sm"
          />
          <div className="leading-none border-l border-slate-300 pl-2.5">
            <span className="text-xs font-black text-[#004d40] tracking-tight block">DeusX Inmobiliarias</span>
            <span className="text-[10px] text-slate-500 font-medium block">SaaS ERP PropTech Multi-tenant</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PostgreSQL Row Level Security (RLS) Activo</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer con Sellos de Seguridad & Privacidad */}
      <footer className="max-w-md w-full mx-auto text-center space-y-2 py-4 text-xs text-slate-500 border-t border-slate-200">
        <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#26a69a]" />
            Cifrado AES-256
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#26a69a]" />
            Aislamiento Estricto
          </span>
          <span>•</span>
          <span>Baja de Datos Inmediata</span>
        </div>
        <p className="text-[11px] text-slate-400">
          © 2026 DeusX Inmobiliarias. Plataforma de Gestión Inmobiliaria Profesional.
        </p>
      </footer>
    </div>
  );
}
