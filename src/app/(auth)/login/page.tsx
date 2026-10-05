"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building,
  KeyRound,
  Sparkles
} from "lucide-react";
import { loginAction } from "@/modules/auth/actions";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginAction(formData);

    if (!result.success) {
      setErrorMessage(result.error || "Error al iniciar sesión.");
      setIsLoading(false);
    } else {
      router.push("/contratos");
      router.refresh();
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header Formulario */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-2.5 rounded-full bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]/60 mb-1">
          <KeyRound className="w-5 h-5 text-[#004d40]" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Ingreso a DeusX Inmobiliarias
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Accedé a tu panel de administración de contratos, liquidaciones y cartera de propiedades
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="tu@inmobiliaria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Contraseña
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Para recuperar tu contraseña, comunicate con soporte técnico.");
              }}
              className="text-[11px] text-[#004d40] hover:underline font-semibold"
            >
              ¿Olvidaste tu clave?
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#26a69a] focus:bg-white outline-none transition-all font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className={cn(
            "w-full py-2.5 px-4 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
            isLoading || !email || !password
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#004d40] hover:bg-[#00382e] text-white"
          )}
        >
          <span>{isLoading ? "Verificando credenciales..." : "Iniciar Sesión"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Separador */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full"></div>
        <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">o</span>
      </div>

      {/* Link de Registro */}
      <div className="text-center space-y-2">
        <p className="text-xs text-slate-600">
          ¿Tu inmobiliaria aún no tiene cuenta?
        </p>
        <Link
          href="/registro"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004d40] hover:text-[#002d25] bg-[#E0F2F1] hover:bg-[#B2DFDB] px-4 py-2 rounded-xl border border-[#80CBC4] transition-colors"
        >
          <Building className="w-3.5 h-3.5" />
          <span>Registrar nueva inmobiliaria</span>
        </Link>
      </div>

      {/* Acceso Rápido a Dashboard */}
      <div className="pt-2 text-center border-t border-slate-100">
        <Link
          href="/"
          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Continuar al Dashboard Operativo
        </Link>
      </div>
    </div>
  );
}
