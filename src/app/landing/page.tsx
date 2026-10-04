import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building,
  TrendingUp,
  Receipt,
  Globe,
  Share2,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Download,
  Users,
  Layers,
  ChevronRight,
  Handshake,
  DollarSign
} from "lucide-react";

export const metadata = {
  title: "DeusX Inmobiliarias | ERP SaaS PropTech para Inmobiliarias Argentinas",
  description:
    "El software inmobiliario integral más avanzado: contratos con índices ICL/IPC, recibos oficiales RG 4004-E, vidriera con dominio propio NIC.ar y Red MLS colaborativa.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#80CBC4] selection:text-[#004d40]">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <img src="/Recursos/DeusX.png" alt="DeusX Inmobiliarias" className="h-7 w-auto object-contain" />
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-white tracking-tight block">DeusX Inmobiliarias</span>
              <span className="text-[10px] font-mono text-[#80CBC4] block">ERP PropTech SaaS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#funciones" className="hover:text-[#80CBC4] transition-colors">Funcionalidades</a>
            <a href="#vidriera" className="hover:text-[#80CBC4] transition-colors">Vidriera NIC.ar</a>
            <a href="#mls" className="hover:text-[#80CBC4] transition-colors">Red MLS</a>
            <a href="#precios" className="hover:text-[#80CBC4] transition-colors">Planes & Precios</a>
            <a href="#faq" className="hover:text-[#80CBC4] transition-colors">Preguntas Frecuentes</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Ingresar a mi Agencia
            </Link>
            <Link
              href="/registro"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#80CBC4] hover:bg-[#4db6ac] rounded-xl shadow-lg transition-all active:scale-95"
            >
              Prueba Gratis (14 Días)
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glows de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#004d40]/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#80CBC4]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#004d40]/60 border border-[#80CBC4]/40 text-[#80CBC4] text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>La evolución PropTech para Martilleros & Corredores Matriculados</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Administrá alquileres con la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80CBC4] to-[#B2DFDB]">precisión de un banco</span> y la velocidad de la era digital
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            DeusX Inmobiliarias automatiza el ciclo completo: ajustes de contratos por índice ICL / IPC / UVA, cobros con Recibos X (RG AFIP 4004-E), tu propia Vidriera Web con dominio de NIC.ar y la primera Red MLS colaborativa con split 50/50.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/registro"
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-950 bg-[#80CBC4] hover:bg-[#4db6ac] rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Comenzar Prueba Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Acceder al Hub Operativo</span>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
              <span>Sin instalación (100% en la Nube)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
              <span>Ajustado al DNU 70/2023</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
              <span>Migración asistida desde SPOT y Excel</span>
            </div>
          </div>
        </div>

        {/* Mockup Preview de la App */}
        <div className="max-w-6xl mx-auto px-4 mt-14 relative z-10">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-2 sm:p-3 shadow-2xl backdrop-blur-md">
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 font-mono text-[11px] text-slate-500">app.deusxinmobiliarias.com/contratos</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#80CBC4]">
                  <Lock className="w-3 h-3" />
                  <span>Cifrado Bancario AES-256</span>
                </div>
              </div>
              <img
                src="/Recursos/DeusX.png"
                alt="Hub de Operaciones"
                className="w-full max-h-[380px] object-cover opacity-90 p-8 mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Funcionalidades Principales */}
      <section id="funciones" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-[#80CBC4]">
              Potencia Inmobiliaria Argentina
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Diseñado exclusivamente para el marco legal y operativo argentino
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Olvidate de planillas de cálculo propensas a errores, fórmulas desactualizadas y sistemas de hace dos décadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#80CBC4]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004d40] border border-[#80CBC4]/40 flex items-center justify-center text-[#80CBC4]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ajustes ICL / IPC / UVA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lectura directa de las tablas del Banco Central (BCRA) e INDEC. El sistema calcula en 1 clic el aumento exacto según la frecuencia pactada en el contrato.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#80CBC4]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004d40] border border-[#80CBC4]/40 flex items-center justify-center text-[#80CBC4]">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Recibos X Oficiales (RG 4004-E)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cobranza por cuenta y orden de terceros. Emisión instantánea de Recibos X en PDF de alta calidad con sello, firma del martillero y desglose de expensas y punitorios.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[#80CBC4]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004d40] border border-[#80CBC4]/40 flex items-center justify-center text-[#80CBC4]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Envío Directo por WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enviá comprobantes, avisos de liquidación bancaria y recordatorios de pago a inquilinos y propietarios directamente por WhatsApp en un solo clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Vidriera Online NIC.ar */}
      <section id="vidriera" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold font-mono text-[#80CBC4] uppercase tracking-wide">
              Tu Marca, Tu Prestigio
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Tu propia Vidriera Inmobiliaria conectada a tu dominio de NIC.ar
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No dependas de portales de terceros donde tu cliente ve propiedades de la competencia. Con DeusX Inmobiliarias, cada agencia dispone de su web personalizada con su propio dominio (<code className="text-[#80CBC4]">www.tuinmobiliaria.com.ar</code>) y certificado SSL gratuito.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
                <span>Buscador por ambientes, tipo de inmueble y rango de precios.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
                <span>Fichas con galería de fotos, mapas y contacto directo por WhatsApp.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#80CBC4]" />
                <span>Optimización SEO automática para posicionar en Google en tu localidad.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-tr from-[#004d40]/40 to-[#80CBC4]/10 p-6 rounded-3xl border border-[#80CBC4]/30 space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Globe className="w-4 h-4 text-[#80CBC4]" />
                <span className="font-mono text-white">www.deusinmobiliaria.com.ar</span>
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                  Activo SSL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                12 Propiedades sincronizadas en tiempo real desde el catálogo administrativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Red MLS Colaborativa */}
      <section id="mls" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold font-mono text-[#80CBC4] uppercase tracking-wide">
            Network Effect B2B
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Red MLS DeusX: Multiplicá tus cierres con Co-Brokering al 50%
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nunca más pierdas una operación por no tener el inmueble exacto. Interconectate con colegas matriculados de la red, compartí carteras con split pactado y accedé al radar de búsquedas activas para reverse matching.
          </p>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Handshake className="w-4 h-4 text-[#80CBC4]" />
                <span>Cartera Compartida</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Generá fichas neutras (marca blanca) para enviarle a tus clientes sin exponer los datos del colega.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#80CBC4]" />
                <span>Radar de Búsquedas Activas</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Publicá demandas insatisfechas de tus clientes. Los colegas te contactan al instante si tienen el inmueble que calza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Planes & Precios */}
      <section id="precios" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono text-[#80CBC4] uppercase tracking-wide">
              Suscripciones Transparentes
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Elegí el plan a la medida de tu inmobiliaria
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Precios en pesos argentinos, sin sorpresas, con 14 días de prueba gratuita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {/* Plan Starter */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400">Para pequeñas carteras en crecimiento</p>
              </div>
              <div className="text-2xl font-bold font-mono text-white">$ 45.000 <span className="text-xs text-slate-400 font-sans font-normal">/ mes</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Hasta 30 contratos activos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Índices BCRA (ICL / IPC)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Recibos X PDF</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> 1 Usuario administrador</li>
              </ul>
              <Link href="/registro" className="block text-center py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                Comenzar Prueba
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#004d40]/80 to-slate-900 border-2 border-[#80CBC4] space-y-5 relative shadow-xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#80CBC4] text-slate-950 uppercase tracking-wide">
                Recomendado
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Pro + Dominio NIC</h3>
                <p className="text-xs text-[#B2DFDB]">El estándar completo para agencias modernas</p>
              </div>
              <div className="text-2xl font-bold font-mono text-white">$ 75.000 <span className="text-xs text-slate-300 font-sans font-normal">/ mes</span></div>
              <ul className="space-y-2 text-xs text-white">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Contratos ilimitados</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Vidriera Online con dominio NIC.ar propio</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Envíos directos por WhatsApp</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Hasta 5 usuarios operadores</li>
              </ul>
              <Link href="/registro" className="block text-center py-2 px-4 rounded-xl text-xs font-bold bg-[#80CBC4] hover:bg-[#4db6ac] text-slate-950 transition-colors shadow-md">
                Elegir Plan Pro
              </Link>
            </div>

            {/* Plan Enterprise */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Enterprise MLS</h3>
                <p className="text-xs text-slate-400">Red colaborativa y alto volumen</p>
              </div>
              <div className="text-2xl font-bold font-mono text-white">$ 120.000 <span className="text-xs text-slate-400 font-sans font-normal">/ mes</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Todo lo del Plan Pro</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Acceso Total a la Red MLS DeusX</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Radar de Búsquedas Activas & Matching</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#80CBC4]" /> Usuarios ilimitados y soporte VIP</li>
              </ul>
              <Link href="/registro" className="block text-center py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                Contactar Ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Recursos/DeusX.png" alt="DeusX" className="h-6 w-auto object-contain" />
            <span className="font-bold text-slate-300">DeusX Inmobiliarias</span>
            <span>• ERP SaaS PropTech</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300">Ingreso Clientes</Link>
            <Link href="/registro" className="hover:text-slate-300">Registro</Link>
            <Link href="/configuracion/vidriera" className="hover:text-slate-300">Dominios NIC.ar</Link>
          </div>

          <div>
            © {new Date().getFullYear()} DeusX Tech. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
