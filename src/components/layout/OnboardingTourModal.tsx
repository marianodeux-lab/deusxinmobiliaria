"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Building,
  Upload,
  Receipt,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  FileText,
  Sliders,
  Wallet,
  ShieldCheck,
} from "lucide-react";

interface OnboardingTourModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceOpen?: boolean;
}

export function OnboardingTourModal({
  isOpen,
  onClose,
  forceOpen = false,
}: OnboardingTourModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoStartOnLogin, setAutoStartOnLogin] = useState(false);

  useEffect(() => {
    if (forceOpen || isOpen) {
      setOpen(true);
      return;
    }
    // Solo aparece en el primer ingreso o si el usuario habilitó expresamente el inicio automático
    const hasSeenTour = localStorage.getItem("deusx_tour_seen");
    const forceAuto = localStorage.getItem("deusx_force_auto_tour") === "true";

    if (!hasSeenTour || forceAuto) {
      setOpen(true);
      if (forceAuto) setAutoStartOnLogin(true);
    }
  }, [isOpen, forceOpen]);

  const handleClose = () => {
    localStorage.setItem("deusx_tour_seen", "true");
    if (autoStartOnLogin) {
      localStorage.setItem("deusx_force_auto_tour", "true");
    } else {
      localStorage.removeItem("deusx_force_auto_tour");
    }
    setOpen(false);
    if (onClose) onClose();
  };

  if (!open) return null;

  const steps = [
    {
      title: "1. Identidad de tu Inmobiliaria & Datos Fiscales (ARCA)",
      subtitle: "Configuración inicial de tu empresa",
      icon: <Building className="w-6 h-6 text-[#34D399]" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Personalizá DeusX con los datos de tu inmobiliaria para que todos los documentos y contratos salgan con tu membrete profesional:
          </p>
          <ul className="space-y-2 bg-[#141519] p-3.5 rounded-xl border border-[#2E303B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
              <span><strong>Logotipo & Nombre Comercial:</strong> Subí tu logo para los Recibos X y contratos en PDF.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
              <span><strong>CUIT & Punto de Venta:</strong> Asigná tu punto de venta Web Services en ARCA (ej: 0004 o 0005).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
              <span><strong>Certificado Digital:</strong> Cargá tu certificado <code>.crt</code> y <code>.key</code> para Facturas A, B y C con CAE.</span>
            </li>
          </ul>
        </div>
      ),
      actionLabel: "Ir a Configuración Fiscal",
      actionHref: "/configuracion",
    },
    {
      title: "2. Carga de Datos o Migración de Sistemas Anteriores",
      subtitle: "Traé tus inquilinos, contratos y propiedades al instante",
      icon: <Upload className="w-6 h-6 text-teal-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Podés cargar tus datos rápidamente o migrar todo desde tu software de gestión anterior:
          </p>
          <ul className="space-y-2 bg-[#141519] p-3.5 rounded-xl border border-[#2E303B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Asistente Universal de Migración:</strong> Desde Configuración, arrastrá tu archivo exportado (.txt, .csv) y nuestro analizador detectará automáticamente propietarios, inquilinos y contratos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Borrado de Datos Demo con 1 Clic:</strong> Si querés arrancar 100% limpio sin datos de prueba, tenés el botón de purga instantánea en Configuración.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Carga Manual:</strong> También podés dar de alta nuevas propiedades y contratos desde el botón <em>"+ Nuevo Contrato"</em>.</span>
            </li>
          </ul>
        </div>
      ),
      actionLabel: "Abrir Asistente de Importación",
      actionHref: "/configuracion",
    },
    {
      title: "3. Índices de Ajuste BCRA & Parámetros Operativos",
      subtitle: "Actualización automática de alquileres sin errores",
      icon: <TrendingUp className="w-6 h-6 text-indigo-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            DeusX automatiza el cálculo de actualización de alquileres bajo cualquier normativa:
          </p>
          <ul className="space-y-2 bg-[#141519] p-3.5 rounded-xl border border-[#2E303B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>ICL, IPC y UVA en Tiempo Real:</strong> Conexión con datos oficiales del BCRA e INDEC para indexar con precisión milimétrica.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Honorarios de Administración:</strong> Configurá el porcentaje estándar (ej: 8%) deducible automáticamente en cada liquidación.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span><strong>Avisos de Vencimiento:</strong> Notificaciones directas por WhatsApp a inquilinos del 1 al 10 de cada mes.</span>
            </li>
          </ul>
        </div>
      ),
      actionLabel: "Ver Módulo de Índices",
      actionHref: "/indices",
    },
    {
      title: "4. Cobranzas Rápidas, Recibo X & Liquidaciones",
      subtitle: "Cobrá y rendí en un solo flujo",
      icon: <Receipt className="w-6 h-6 text-[#34D399]" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            El flujo diario que ahorra horas de trabajo en mostrador y home banking:
          </p>
          <ul className="space-y-2 bg-[#141519] p-3.5 rounded-xl border border-[#2E303B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
              <span><strong>Cobro a Inquilino:</strong> Registrá el cobro en efectivo o transferencia y generá al instante el <strong>Recibo Oficial X en PDF</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
              <span><strong>Liquidación a Propietarios:</strong> Rendí los alquileres recaudados descontando tus honorarios con comprobante de liquidación.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
              <span><strong>Envío por WhatsApp:</strong> Compartí avisos y recibos con un solo clic sin tener que tipear números ni mensajes.</span>
            </li>
          </ul>
        </div>
      ),
      actionLabel: "Ir a Cobranzas",
      actionHref: "/cobranzas",
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#1C1D23] border border-[#2E303B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera del Tour */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E303B] bg-[#141519]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#004D40]/60 border border-[#10B981]/40 text-[#34D399]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Guía de Inicio Rápido DeusX</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#004D40] text-[#34D399] rounded-full border border-[#10B981]/40">
                  Paso {currentStep + 1} de {steps.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Primeros pasos para dejar tu inmobiliaria 100% operativa en producción.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#262832] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicadores de Pasos (Progress Bar) */}
        <div className="flex items-center gap-1.5 px-6 pt-4 pb-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx === currentStep
                  ? "bg-[#10B981]"
                  : idx < currentStep
                  ? "bg-[#004D40]"
                  : "bg-[#2A2C35]"
              }`}
            />
          ))}
        </div>

        {/* Contenido del Paso Activo */}
        <div className="p-6 space-y-4 font-sans">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#141519] border border-[#2E303B] shrink-0 mt-0.5">
              {current.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{current.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <div className="pt-2">{current.content}</div>
        </div>

        {/* Barra de Preferencia de Inicio Automático */}
        <div className="px-6 py-2.5 bg-[#101115] border-t border-[#262832] flex items-center justify-between text-[11px] text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={autoStartOnLogin}
              onChange={(e) => setAutoStartOnLogin(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#2E303B] bg-[#1C1D23] text-[#10B981] focus:ring-[#10B981] cursor-pointer"
            />
            <span>Iniciar automáticamente este tour en cada inicio de sesión</span>
          </label>
          <span className="text-slate-500 text-[10px]">
            {autoStartOnLogin ? "Activado en cada sesión" : "Solo primer ingreso (Recomendado)"}
          </span>
        </div>

        {/* Barra de Acciones y Navegación */}
        <div className="px-6 py-4 border-t border-[#262832] bg-[#141519] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#262832] rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}
            <a
              href={current.actionHref}
              className="px-3.5 py-2 text-xs font-bold text-[#A7F3D0] hover:text-white bg-[#00382E] hover:bg-[#004D40] border border-[#10B981]/40 rounded-xl transition-all"
            >
              {current.actionLabel}
            </a>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#004D40] hover:bg-[#00382E] border border-[#10B981]/50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] text-slate-900 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-900" />
                <span className="font-extrabold text-slate-900">¡Listo, Comenzar!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
