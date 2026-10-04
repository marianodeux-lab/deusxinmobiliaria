"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Building,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Percent,
  ShieldCheck
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface InmuebleOpcion {
  id: string;
  direccion: string;
  piso_dpto?: string;
  uf?: string;
  localidad: string;
  propietarios: { id: string; nombre: string; porcentaje: number }[];
}

const INMUEBLES_DISPONIBLES: InmuebleOpcion[] = [
  {
    id: "prop-1",
    direccion: "Arturo Frondizi",
    piso_dpto: "Dpto 2",
    uf: "UF 014",
    localidad: "9 de Julio",
    propietarios: [{ id: "p-1", nombre: "STIGLICH, MARIA PAULA", porcentaje: 100 }],
  },
  {
    id: "prop-2",
    direccion: "Mitre 1419",
    piso_dpto: "5° B",
    uf: "UF 077-045141-8",
    localidad: "Mar del Plata",
    propietarios: [{ id: "p-2", nombre: "FUREGA, LUIS ALBERTO", porcentaje: 100 }],
  },
  {
    id: "prop-3",
    direccion: "La Rioja 885",
    piso_dpto: "1° PB",
    uf: "UF 077-31948",
    localidad: "Mar del Plata",
    propietarios: [
      { id: "p-3", nombre: "DI MARCO, CARLOS", porcentaje: 50 },
      { id: "p-4", nombre: "DI MARCO, PABLO", porcentaje: 50 },
    ],
  },
];

const INQUILINOS_MOCK = [
  { id: "inq-1", nombre: "LOPEZ MARTIN, MARIA LUCIA", dni: "36.789.012", tel: "223-4876543" },
  { id: "inq-2", nombre: "MENCIA RODRIGUEZ, PEDRO JOSE", dni: "32.415.890", tel: "223-5123456" },
  { id: "inq-3", nombre: "BRANCE, SOFIA", dni: "40.112.334", tel: "223-6987123" },
  { id: "inq-4", nombre: "GARCIA, MATIAS NICOLAS", dni: "38.991.223", tel: "223-4112233" },
];

const GARANTES_MOCK = [
  { id: "gar-1", nombre: "LOPEZ, ROBERTO RAMON (Garante Propietario)", dni: "14.223.456" },
  { id: "gar-2", nombre: "GARCIA, EDUARDO HECTOR (Recibo de Sueldo)", dni: "17.889.012" },
  { id: "gar-3", nombre: "FIANZA PREMIER S.A. (Caución Comercial)", dni: "30-71829304-5" },
];

export function NuevoContratoForm() {
  const router = useRouter();

  // Estados del Contrato
  const [carpetaNumero, setCarpetaNumero] = useState("10");
  const [selectedInmuebleId, setSelectedInmuebleId] = useState("prop-1");
  const [selectedInquilinoId, setSelectedInquilinoId] = useState("inq-1");
  const [selectedGaranteId, setSelectedGaranteId] = useState("gar-1");

  // Duración
  const [fechaInicio, setFechaInicio] = useState("2026-11-01");
  const [plazoMeses, setPlazoMeses] = useState(24); // 24 meses por defecto

  // Moneda y Montos
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");
  const [valorAlquilerInicial, setValorAlquilerInicial] = useState<number>(450000);
  const [diaVencimiento, setDiaVencimiento] = useState(10);
  const [porcentajeHonorarios, setPorcentajeHonorarios] = useState(4.13); // o 8%
  const [tasaPunitorioDiario, setTasaPunitorioDiario] = useState(0.10);

  // Motor de Indexación (Post DNU 70/2023)
  const [tipoAjuste, setTipoAjuste] = useState<"ICL" | "IPC" | "UVA" | "FIJO">("ICL");
  const [frecuenciaAjusteMeses, setFrecuenciaAjusteMeses] = useState(3); // Trimestral

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inmueble seleccionado
  const inmuebleSeleccionado = useMemo(() => {
    return INMUEBLES_DISPONIBLES.find((i) => i.id === selectedInmuebleId);
  }, [selectedInmuebleId]);

  // Inquilino y Garante seleccionados
  const inquilinoSeleccionado = useMemo(() => {
    return INQUILINOS_MOCK.find((inq) => inq.id === selectedInquilinoId);
  }, [selectedInquilinoId]);

  const garanteSeleccionado = useMemo(() => {
    return GARANTES_MOCK.find((g) => g.id === selectedGaranteId);
  }, [selectedGaranteId]);

  // Cálculo automático de fecha de fin
  const fechaFinCalculada = useMemo(() => {
    if (!fechaInicio) return "";
    const start = new Date(fechaInicio);
    start.setMonth(start.getMonth() + plazoMeses);
    start.setDate(start.getDate() - 1);
    return start.toISOString().split("T")[0];
  }, [fechaInicio, plazoMeses]);

  // Simulación de cronograma de ajustes automáticos
  const cronogramaAjustes = useMemo(() => {
    const ajustes = [];
    let fechaActual = new Date(fechaInicio);

    for (let i = 1; i <= plazoMeses; i++) {
      const mesNum = i;
      const esAjuste = mesNum > 1 && (mesNum - 1) % frecuenciaAjusteMeses === 0;

      if (esAjuste) {
        ajustes.push({
          mes: mesNum,
          fecha: new Date(fechaActual).toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
          tipo: tipoAjuste,
        });
      }
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    return ajustes;
  }, [fechaInicio, plazoMeses, frecuenciaAjusteMeses, tipoAjuste]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inmuebleSeleccionado || !inquilinoSeleccionado) {
      alert("Por favor completá los datos obligatorios del contrato.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`¡Contrato en Carpeta #${carpetaNumero} generado exitosamente para ${inmuebleSeleccionado.direccion}!`);
      router.push("/");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#004d40]" />
              Nuevo Contrato de Alquiler (Carpeta #{carpetaNumero})
            </h1>
            <p className="text-xs text-slate-500">
              Asociá el inmueble, las partes y configurá la cláusula de indexación automática
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all bg-[#004d40] hover:bg-[#00382e] text-white active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Emitiendo..." : "Generar Contrato & Períodos"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal (2 Columnas) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tarjeta 1: Selección de Inmueble y Carpeta */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#004d40]" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Inmueble y Número de Expediente (Carpeta)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">N° Carpeta:</label>
                <input
                  type="text"
                  value={carpetaNumero}
                  onChange={(e) => setCarpetaNumero(e.target.value)}
                  className="w-16 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded p-1.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seleccionar Inmueble Administrado *
              </label>
              <select
                value={selectedInmuebleId}
                onChange={(e) => setSelectedInmuebleId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
              >
                {INMUEBLES_DISPONIBLES.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.direccion} {i.piso_dpto} ({i.localidad}) - {i.uf || "Sin UF"}
                  </option>
                ))}
              </select>
            </div>

            {/* Propietarios detectados automáticamente de la propiedad */}
            {inmuebleSeleccionado && (
              <div className="p-3 bg-[#141519] rounded-lg border border-[#10B981]/30 text-xs shadow-2xs">
                <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider block mb-1">
                  Propietario(s) Titular(es) Vinculados a la Propiedad:
                </span>
                <div className="space-y-1">
                  {inmuebleSeleccionado.propietarios.map((p) => (
                    <div key={p.id} className="flex justify-between font-semibold text-slate-200">
                      <span>{p.nombre}</span>
                      <span className="font-mono text-[#34D399] font-bold">{p.porcentaje}% Titularidad</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta 2: Inquilino y Garantes (CRM Polimórfico) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Users className="w-4 h-4 text-[#004d40]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Inquilino(s) y Garante(s)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquilino Principal (Responsable de Pago) *
                </label>
                <select
                  value={selectedInquilinoId}
                  onChange={(e) => setSelectedInquilinoId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                >
                  {INQUILINOS_MOCK.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {inq.nombre} (DNI: {inq.dni})
                    </option>
                  ))}
                </select>
                {inquilinoSeleccionado && (
                  <p className="text-[11px] text-slate-500 mt-1">Tel: {inquilinoSeleccionado.tel}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Garantía / Garante Principal
                </label>
                <select
                  value={selectedGaranteId}
                  onChange={(e) => setSelectedGaranteId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                >
                  {GARANTES_MOCK.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
                {garanteSeleccionado && (
                  <p className="text-[11px] text-slate-500 mt-1">Identificador: {garanteSeleccionado.dni}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Duración y Condiciones Económicas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Calendar className="w-4 h-4 text-[#004d40]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Plazo, Vencimientos y Canon Inicial
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plazo en Meses (Cuotas) *
                </label>
                <select
                  value={plazoMeses}
                  onChange={(e) => setPlazoMeses(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                >
                  <option value={12}>12 Meses (1 Año)</option>
                  <option value={24}>24 Meses (2 Años - Común)</option>
                  <option value={36}>36 Meses (3 Años)</option>
                  <option value={6}>6 Meses (Temporal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Fin (Calculada)
                </label>
                <input
                  type="date"
                  value={fechaFinCalculada}
                  disabled
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Moneda Base *
                </label>
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value as "ARS" | "USD")}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares Estadounidenses (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Canon Inicial ({moneda}) *
                </label>
                <input
                  type="number"
                  value={valorAlquilerInicial}
                  onChange={(e) => setValorAlquilerInicial(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Día Vencimiento (1 al 28) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={diaVencimiento}
                  onChange={(e) => setDiaVencimiento(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Motor de Indexación Post-DNU 70/2023 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <TrendingUp className="w-4 h-4 text-[#004d40]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Cláusula de Indexación & Actualización (Post DNU 70)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Índice de Ajuste Pactado *
                </label>
                <select
                  value={tipoAjuste}
                  onChange={(e) => setTipoAjuste(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                >
                  <option value="ICL">ICL (Índice Contratos de Locación - BCRA)</option>
                  <option value="IPC">IPC (Índice de Precios al Consumidor - INDEC)</option>
                  <option value="UVA">UVA (Unidad de Valor Adquisitivo)</option>
                  <option value="FIJO">Fijo Escalonado (Sin índice oficial)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frecuencia de Actualización *
                </label>
                <select
                  value={frecuenciaAjusteMeses}
                  onChange={(e) => setFrecuenciaAjusteMeses(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                >
                  <option value={3}>Cada 3 Meses (Trimestral - Más frecuente)</option>
                  <option value={4}>Cada 4 Meses (Cuatrimestral)</option>
                  <option value={6}>Cada 6 Meses (Semestral)</option>
                  <option value={12}>Cada 12 Meses (Anual)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Honorarios Inmobiliaria (% Comisión de Adm.)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={porcentajeHonorarios}
                    onChange={(e) => setPorcentajeHonorarios(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Habitual: 4.13% o pactado (ej: 8%)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tasa de Punitorio Diario por Mora
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    value={tasaPunitorioDiario}
                    onChange={(e) => setTasaPunitorioDiario(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">% / día</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">0.10% diario = 3% mensual por mora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen Ejecutivo & Cronograma de Ajustes */}
        <div className="space-y-4">
          <div className="sticky top-20 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-[#004d40]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resumen del Contrato (Carpeta #{carpetaNumero})
              </h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Inmueble:</span>
                <span className="font-bold text-white text-right truncate max-w-[160px]">
                  {inmuebleSeleccionado?.direccion}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Inquilino:</span>
                <span className="font-semibold text-slate-200 text-right truncate max-w-[160px]">
                  {inquilinoSeleccionado?.nombre}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Vigencia:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {formatDate(fechaInicio)} al {formatDate(fechaFinCalculada)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Canon Inicial:</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(valorAlquilerInicial, moneda)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Comisión Adm. ({porcentajeHonorarios}%):</span>
                <span className="font-mono text-[#34D399] font-bold">
                  {formatCurrency(valorAlquilerInicial * (porcentajeHonorarios / 100), moneda)}
                </span>
              </div>
            </div>

            {/* Cronograma Proyectado de Actualizaciones */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Fechas Proyectadas de Ajuste {tipoAjuste}:</span>
              </h4>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {cronogramaAjustes.map((aj, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 bg-[#141519] rounded border border-[#262832] hover:border-[#10B981]/40 flex justify-between text-[11px] transition-colors"
                  >
                    <span className="text-slate-200 font-medium">Mes {aj.mes} ({aj.fecha})</span>
                    <span className="font-bold text-[#34D399] font-mono">Ajuste {aj.tipo}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-lg shadow-sm transition-all bg-[#004d40] hover:bg-[#00382e] text-white flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>Emitir Contrato y Cuotas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
