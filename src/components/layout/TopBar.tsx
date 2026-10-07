"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  UserCheck, 
  Bell, 
  Building2, 
  Settings, 
  Globe,
  Sparkles,
  LogOut,
  Menu,
  Download,
} from "lucide-react";
import { OnboardingTourModal } from "./OnboardingTourModal";
import { createClient } from "@/lib/supabase/client";
import { useMobileNav } from "@/context/MobileNavContext";
import { usePwa } from "@/context/PwaContext";

interface MacroIndicatorProps {
  label: string;
  value: string;
  date: string;
  variant: "gold" | "orange" | "purple" | "blue" | "green";
  trend?: "up" | "neutral" | "down";
}

const variantStyles: Record<
  "gold" | "orange" | "purple" | "blue" | "green",
  {
    container: string;
    label: string;
    value: string;
    date: string;
  }
> = {
  gold: {
    container: "bg-[#0D0B05] border-amber-500/35 hover:border-amber-400/60 shadow-[0_0_10px_-2px_rgba(245,158,11,0.15)]",
    label: "text-[#FBBF24]",
    value: "text-[#FDE68A]",
    date: "text-amber-200/60",
  },
  orange: {
    container: "bg-[#0E0702] border-orange-500/35 hover:border-orange-400/60 shadow-[0_0_10px_-2px_rgba(249,115,22,0.15)]",
    label: "text-[#FB923C]",
    value: "text-[#FED7AA]",
    date: "text-orange-200/60",
  },
  purple: {
    container: "bg-[#0B0512] border-purple-500/35 hover:border-purple-400/60 shadow-[0_0_10px_-2px_rgba(168,85,247,0.15)]",
    label: "text-[#C084FC]",
    value: "text-[#E9D5FF]",
    date: "text-purple-200/60",
  },
  blue: {
    container: "bg-[#040914] border-sky-500/35 hover:border-sky-400/60 shadow-[0_0_10px_-2px_rgba(56,189,248,0.15)]",
    label: "text-[#38BDF8]",
    value: "text-[#BAE6FD]",
    date: "text-sky-200/60",
  },
  green: {
    container: "bg-[#020E09] border-emerald-500/35 hover:border-emerald-400/60 shadow-[0_0_10px_-2px_rgba(160,185,129,0.15)]",
    label: "text-[#34D399]",
    value: "text-[#A7F3D0]",
    date: "text-emerald-200/60",
  },
};

function MacroIndicator({ label, value, date, variant }: MacroIndicatorProps) {
  const styles = variantStyles[variant];
  return (
    <Link
      href="/indices"
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border transition-all hover:scale-[1.02] shrink-0 ${styles.container}`}
      title={`Ver detalles de ${label} en Índices`}
    >
      <span className={`font-bold ${styles.label}`}>{label}</span>
      <span className={`font-mono tabular-nums font-extrabold ${styles.value}`}>{value}</span>
      <span className={`text-[10px] ${styles.date}`}>({date})</span>
    </Link>
  );
}

export function TopBar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Inmobiliaria");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toggleMobileNav } = useMobileNav();
  const { installApp, isInstalled } = usePwa();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserEmail(user.email || null);
          const agency = user.user_metadata?.nombre_inmobiliaria || user.user_metadata?.inmobiliaria;
          const metaName = user.user_metadata?.nombre_completo;
          setUserName(agency || metaName || "Inmobiliaria");
        }
      });
    } catch (e) {
      console.error("Error loading user in TopBar:", e);
    }
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Error during logout:", e);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-[#0F1014] bg-[#030304]/98 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 flex items-center justify-between text-slate-200 gap-2">
        {/* Botón Hamburguesa Móvil (Visible solo en pantallas < md) */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <button
            onClick={toggleMobileNav}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#0A0B0E] hover:bg-[#16171C] border border-[#17181F] transition-colors"
            title="Abrir Menú de Navegación"
            aria-label="Abrir Menú"
          >
            <Menu className="w-5 h-5 text-[#10B981]" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <img src="/Recursos/DeusX.png" alt="DeusX" className="h-6 w-auto object-contain" />
          </Link>
        </div>

        {/* Indicadores Económicos Oficiales (Ticker en cabecera) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar flex-1 min-w-0 mr-1">
          <Link
            href="/indices"
            className="hidden sm:flex flex-col justify-center mr-1 text-slate-400 hover:text-[#10B981] transition-colors shrink-0 select-none group"
            title="Ver módulo de Índices Económicos & Motores de Indexación"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-slate-200 group-hover:text-[#10B981] transition-colors">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Índices:</span>
            </div>
            <span className="text-[9px] text-white font-mono tracking-tight leading-none mt-0.5">
              Act: BCRA
            </span>
          </Link>
          <MacroIndicator label="ICL" value="14.82" date="Octubre" variant="gold" />
          <MacroIndicator label="IPC" value="3.9%" date="Mensual" variant="orange" />
          <MacroIndicator label="UVA" value="$ 1.485,20" date="Hoy" variant="purple" />
          <MacroIndicator label="USD Blue" value="$ 1.385" date="Venta" variant="blue" />
          <MacroIndicator label="USD Oficial" value="$ 1.080" date="BNA" variant="green" />
        </div>

      {/* Alertas Operativas y Perfil del Usuario */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Badges de Alerta Operativa: Solo en pantallas ultra-anchas (>=1536px) para dar prioridad total a los 5 Índices en laptops */}
        <div className="hidden 2xl:flex items-center gap-2 shrink-0">
          <Link
            href="/cobranzas"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/50 transition-colors shrink-0"
            title="Liquidaciones Pendientes a Dueños"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Liquidaciones</span>
          </Link>
          
          <Link
            href="/contratos"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50 transition-colors shrink-0"
            title="Contratos Vigentes"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Vencimientos</span>
          </Link>
          <div className="h-5 w-px bg-[#17181F] mx-0.5"></div>
        </div>

        {/* Perfil del Usuario & Acceso a Configuración */}
        <div className="flex items-center gap-1">
          <Link
            href="/configuracion"
            className="flex items-center gap-2 pl-1 cursor-pointer hover:bg-[#08090C] px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#17181F] group shrink-0"
            title={userEmail ? `Usuario: ${userEmail}` : "Configuración de Cuenta"}
          >
            <div className="w-8 h-8 rounded-lg bg-[#000000] border border-[#10B981]/40 flex items-center justify-center shadow-xs shrink-0 group-hover:border-[#10B981] transition-colors">
              <img src="/Recursos/icons/icon-192x192.png" alt="DX" className="w-5 h-5 object-contain" />
            </div>
            <div className="text-left hidden sm:block max-w-[130px] truncate">
              <p className="text-xs font-bold text-white leading-tight truncate">{userName}</p>
              <p className="text-[10px] text-[#10B981] leading-tight font-medium truncate">
                {userEmail || "Administrador"}
              </p>
            </div>
            <div className="p-1 rounded-md text-slate-400 group-hover:text-[#10B981] transition-colors ml-0.5">
              <Settings className="w-4 h-4" />
            </div>
          </Link>

          {/* Botón Instalar App PWA */}
          {!isInstalled && (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#34D399] bg-[#004D40]/30 hover:bg-[#004D40]/60 border border-[#10B981]/40 transition-all cursor-pointer"
              title="Instalar DeusX como App (Windows / Android / iOS)"
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer"
            title="Cerrar sesión en este dispositivo"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{isLoggingOut ? "Saliendo..." : "Salir"}</span>
          </button>
        </div>
      </div>
    </header>

    <OnboardingTourModal />
  </>
  );
}
