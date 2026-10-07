"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare } from "lucide-react";

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  installApp: () => Promise<void>;
  showInstallInstructions: boolean;
  setShowInstallInstructions: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  installApp: async () => {},
  showInstallInstructions: false,
  setShowInstallInstructions: () => {},
});

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    // 1. Registrar Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("DeusX PWA Service Worker registrado:", reg.scope))
        .catch((err) => console.warn("Error al registrar Service Worker:", err));
    }

    // 2. Detectar si ya está en modo standalone (instalado)
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);

      // Detectar iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // 3. Capturar evento de instalación nativa (Windows Chrome/Edge y Android)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Error al invocar instalación PWA:", err);
        setShowInstallInstructions(true);
      }
    } else {
      // Si no hay prompt nativo disponible (ej. iOS o navegador sin soporte nativo directo)
      setShowInstallInstructions(true);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        installApp,
        showInstallInstructions,
        setShowInstallInstructions,
      }}
    >
      {children}

      {/* Modal de Instrucciones de Instalación Didáctico */}
      {showInstallInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1D23] border border-[#2E303B] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowInstallInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#004D40] border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Instalar DeusX Inmobiliarias</h3>
                <p className="text-xs text-[#34D399] font-medium">Aplicación Rápida para Windows, Android e iOS</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-300">
                  Para instalar la aplicación en tu <strong>iPhone o iPad (Safari)</strong>:
                </p>
                <div className="p-3 bg-[#141519] rounded-xl border border-[#2A2C35] space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#004D40] text-[#34D399] font-bold flex items-center justify-center text-xs">1</span>
                    <span>Tocá el botón <strong>Compartir</strong> <Share className="w-4 h-4 inline text-[#34D399] ml-1" /> en la barra inferior de Safari.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#004D40] text-[#34D399] font-bold flex items-center justify-center text-xs">2</span>
                    <span>Deslizá hacia abajo y elegí <strong>"Agregar a pantalla de inicio"</strong> <PlusSquare className="w-4 h-4 inline text-[#34D399] ml-1" />.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#004D40] text-[#34D399] font-bold flex items-center justify-center text-xs">3</span>
                    <span>Tocá <strong>Agregar</strong> arriba a la derecha. ¡Listo!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-300">
                  Para instalar en <strong>Windows (Chrome/Edge)</strong> o <strong>Android</strong>:
                </p>
                <div className="p-3 bg-[#141519] rounded-xl border border-[#2A2C35] space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#004D40] text-[#34D399] font-bold flex items-center justify-center text-xs shrink-0">💻</span>
                    <div>
                      <strong className="text-white block">En Windows (PC / Notebook):</strong>
                      <span>Hacé clic en el ícono de <strong>Instalar</strong> que aparece en el extremo derecho de la barra de direcciones de tu navegador (o menú ⋮ → "Instalar DeusX").</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 pt-1 border-t border-[#262832]">
                    <span className="w-6 h-6 rounded-full bg-[#004D40] text-[#34D399] font-bold flex items-center justify-center text-xs shrink-0">📱</span>
                    <div>
                      <strong className="text-white block">En Teléfono Android:</strong>
                      <span>Tocá los 3 puntos (⋮) en Chrome y seleccioná <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-[#2E303B] flex items-center justify-end">
              <button
                onClick={() => setShowInstallInstructions(false)}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#34D399] hover:bg-[#2bb884] rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
