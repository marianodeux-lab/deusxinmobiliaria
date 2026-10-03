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
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  CheckCircle2
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
      alert("¡Inmobiliaria registrada con éxito! Tu panel ERP y Vidriera Online están listos.");
      router.push("/");
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header Formulario */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-2.5 rounded-full bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]/60 mb-1">
          <Building className="w-5 h-5 text-[#004d40]" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Alta de Nueva Inmobiliaria
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Activá tu licencia multi-tenant con contratos, cobranzas y vidriera web pública
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre de la Inmobiliaria o Administración *
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ej: Inmobiliaria San Martín"
              value={nombreInmobiliaria}
              onChange={(e) => setNombreInmobiliaria(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all font-semibold text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Martillero / Titular *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre y Apellido"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CUIT de Facturación *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="30-71829401-9"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp / Teléfono *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="+54 9 223 512-3456"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="contacto@inmobiliaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Contraseña de Administrador (mínimo 6 caracteres) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all font-mono"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !nombreInmobiliaria || !email || !password || !cuit}
            className={cn(
              "w-full py-2.5 px-4 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
              isLoading || !nombreInmobiliaria || !email || !password || !cuit
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#004d40] hover:bg-[#00382e] text-white"
            )}
          >
            <span>{isLoading ? "Creando licencia e inmobiliaria..." : "Crear mi Inmobiliaria en DeusX"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Link de Login */}
      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-600">
          ¿Ya tenés una cuenta registrada?{" "}
          <Link href="/login" className="text-[#004d40] font-bold hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
