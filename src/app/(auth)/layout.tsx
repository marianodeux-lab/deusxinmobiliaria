import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030304] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(3,3,4,1))] flex flex-col justify-between p-4 sm:p-6 font-sans text-slate-200">
      {/* Top Header con Logo Oficial DeusX */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-3 border-b border-[#17181F]/60">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#000000] border border-[#10B981]/40 flex items-center justify-center shadow-xs shrink-0 group-hover:border-[#10B981] transition-colors">
            <img
              src="/Recursos/icons/icon-192x192.png"
              alt="DX"
              className="w-5 h-5 object-contain"
            />
          </div>
          <div className="leading-none border-l border-[#1F212A] pl-2.5">
            <span className="text-xs font-black text-white tracking-tight block">DeusX Inmobiliarias</span>
            <span className="text-[10px] text-[#10B981] font-medium block">SaaS ERP PropTech Multi-tenant</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium bg-[#0A0B10] px-3 py-1.5 rounded-full border border-[#17181F]">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
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
      <footer className="max-w-md w-full mx-auto text-center space-y-2 py-4 text-xs text-slate-500 border-t border-[#17181F]/60">
        <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#10B981]" />
            Cifrado AES-256
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            Aislamiento Multi-Tenant
          </span>
          <span>•</span>
          <span>Baja de Datos Inmediata</span>
        </div>
        <p className="text-[11px] text-slate-500">
          © 2026 DeusX Inmobiliarias. Plataforma de Gestión Inmobiliaria Profesional.
        </p>
      </footer>
    </div>
  );
}
