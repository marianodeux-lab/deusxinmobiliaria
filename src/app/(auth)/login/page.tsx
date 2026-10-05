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
    <div className="bg-[#08090D] p-6 sm:p-8 rounded-2xl border border-[#17181F] shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6 text-slate-200">
      {/* Header Formulario */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-2.5 rounded-xl bg-[#000000] text-[#10B981] border border-[#10B981]/30 mb-1 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
          <KeyRound className="w-5 h-5 text-[#10B981]" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Ingreso a DeusX Inmobiliarias
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Accedé a tu panel de administración de contratos, liquidaciones y cartera de propiedades
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="tu@inmobiliaria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Contraseña
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Para recuperar tu contraseña, comunicate con soporte técnico.");
              }}
              className="text-[11px] text-[#10B981] hover:underline font-medium"
            >
              ¿Olvidaste tu clave?
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#030304] border border-[#1F212A] text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className={cn(
            "w-full py-2.5 px-4 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2",
            isLoading || !email || !password
              ? "bg-[#17181F] text-slate-600 cursor-not-allowed border border-[#232634]"
              : "bg-[#10B981] hover:bg-[#059669] text-black shadow-[0_0_15px_-2px_rgba(16,185,129,0.3)] hover:scale-[1.01]"
          )}
        >
          <span>{isLoading ? "Verificando credenciales..." : "Iniciar Sesión"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Separador */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#17181F] w-full"></div>
        <span className="bg-[#08090D] px-3 text-[11px] text-slate-500 font-medium">o</span>
      </div>

      {/* Link de Registro */}
      <div className="text-center space-y-2.5">
        <p className="text-xs text-slate-400">
          ¿Tu inmobiliaria aún no tiene cuenta?
        </p>
        <Link
          href="/registro"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#10B981] bg-[#0E1017] hover:bg-[#141620] px-4 py-2 rounded-xl border border-[#1F212A] hover:border-[#10B981]/50 transition-colors"
        >
          <Building className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Registrar nueva inmobiliaria</span>
        </Link>
      </div>
    </div>
  );
}
