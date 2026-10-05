"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { registroAction } from "@/modules/auth/actions";
import { cn } from "@/lib/utils";

export default function RegistroPage() {
  const router = useRouter();
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [nombreInmobiliaria, setNombreInmobiliaria] = useState("");
  const [cuit, setCuit] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("nombreCompleto", nombreCompleto);
    formData.append("nombreInmobiliaria", nombreInmobiliaria);
    formData.append("cuit", cuit);
    formData.append("telefono", telefono);
    formData.append("email", email);
    formData.append("password", password);

    const result = await registroAction(formData);

    if (!result.success) {
      setErrorMessage(result.error || "Error al crear la cuenta.");
      setIsLoading(false);
    } else {
      router.push("/login?registrado=true");
    }
  };

  return (
    <div className="bg-[#08090D] p-6 sm:p-8 rounded-2xl border border-[#17181F] shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6 text-slate-200">
      {/* Header Formulario */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-2.5 rounded-xl bg-[#000000] text-[#10B981] border border-[#10B981]/30 mb-1 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
          <Building className="w-5 h-5 text-[#10B981]" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Alta de Nueva Inmobiliaria
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Activá tu licencia multi-tenant con contratos, cobranzas y vidriera web pública
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nombre de la Inmobiliaria o Administración *
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ej: Inmobiliaria San Martín"
              value={nombreInmobiliaria}
              onChange={(e) => setNombreInmobiliaria(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Martillero / Titular *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre y Apellido"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              CUIT de Facturación *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="30-71829401-9"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              WhatsApp / Teléfono *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="+54 9 223 512-3456"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="contacto@inmobiliaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contraseña de Administrador (mínimo 6 caracteres) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all font-mono"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !nombreInmobiliaria || !email || !password || !cuit}
            className={cn(
              "w-full py-2.5 px-4 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2",
              isLoading || !nombreInmobiliaria || !email || !password || !cuit
                ? "bg-[#17181F] text-slate-600 cursor-not-allowed border border-[#232634]"
                : "bg-[#10B981] hover:bg-[#059669] text-black shadow-[0_0_15px_-2px_rgba(16,185,129,0.3)] hover:scale-[1.01]"
            )}
          >
            <span>{isLoading ? "Creando licencia e inmobiliaria..." : "Crear mi Inmobiliaria en DeusX"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Link de Login */}
      <div className="text-center pt-2 border-t border-[#17181F]">
        <p className="text-xs text-slate-400">
          ¿Ya tenés una cuenta registrada?{" "}
          <Link href="/login" className="text-[#10B981] font-bold hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
