"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  MapPin,
  Users,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Save,
  Home,
  Check,
  Percent,
  Sparkles,
  Info,
  Globe,
  Wand2,
  Eye,
  ExternalLink,
  MessageCircle,
  Bed,
  Bath,
  Maximize2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface PropietarioAsignado {
  id: string;
  nombre: string;
  cuit: string;
  cbu_alias: string;
  porcentaje: number;
  honorario_porcentual: number;
}

const PROPIETARIOS_MOCK = [
  { id: "p-1", nombre: "STIGLICH, MARIA PAULA", cuit: "27-28495123-4", cbu_alias: "PAULA.PROPIEDADES" },
  { id: "p-2", nombre: "FUREGA, LUIS ALBERTO", cuit: "20-17849302-8", cbu_alias: "LUIS.FUREGA.BNA" },
  { id: "p-3", nombre: "DI MARCO, CARLOS", cuit: "20-22114433-2", cbu_alias: "CARLOS.DIMARCO" },
  { id: "p-4", nombre: "DI MARCO, PABLO", cuit: "20-24556677-1", cbu_alias: "PABLO.DIMARCO" },
];

export function NuevaPropiedadForm() {
  const router = useRouter();

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo_inmueble: "departamento",
    destino: "vivienda",
    direccion_calle: "",
    direccion_numero: "",
    piso_dpto: "",
    unidad_funcional: "",
    localidad: "Mar del Plata",
    provincia: "Buenos Aires",
    codigo_postal: "7600",
    barrio: "",
    partida_inmobiliaria: "",
    nomenclatura_catastral: "",
    ambientes: 2,
    dormitorios: 1,
    banios: 1,
    cocheras: 0,
    superficie_total: "",
    superficie_cubierta: "",
    expensas_estimadas: "",
    notas: "",

    // Publicación en Vidriera Web & Portales
    publicar_en_vidriera: true,
    operacion_web: "alquiler" as "alquiler" | "venta" | "temporal",
    moneda_web: "ARS" as "ARS" | "USD",
    precio_web: "420000",
    mostrar_precio_web: true,
    destacada_web: false,
    titulo_web: "Moderno Departamento Luminoso",
    descripcion_web: "Excelente unidad al contrafrente abierto, muy luminoso. Living comedor espacioso con cocina integrada, dormitorio con placard y baño completo.",
    imagen_web: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  });

  // Lista de co-propietarios con split porcentual y honorario de administración (estilo SPOT)
  const [propietarios, setPropietarios] = useState<PropietarioAsignado[]>([
    {
      id: "p-1",
      nombre: "STIGLICH, MARIA PAULA",
      cuit: "27-28495123-4",
      cbu_alias: "PAULA.PROPIEDADES",
      porcentaje: 100,
      honorario_porcentual: 8,
    },
  ]);

  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [previewTab, setPreviewTab] = useState<"ficha" | "vidriera">("vidriera");

  // Cálculo de suma de porcentajes
  const totalPorcentaje = propietarios.reduce((acc, p) => acc + (Number(p.porcentaje) || 0), 0);
  const porcentajeValido = totalPorcentaje === 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPropietario = () => {
    if (!selectedPersonaId) return;
    const persona = PROPIETARIOS_MOCK.find((p) => p.id === selectedPersonaId);
    if (!persona) return;
    if (propietarios.some((p) => p.id === persona.id)) return;

    // Ajustar split
    const nuevoPorcentaje = Math.max(0, 100 - totalPorcentaje);
    setPropietarios((prev) => [
      ...prev,
      {
        ...persona,
        porcentaje: nuevoPorcentaje,
        honorario_porcentual: 8,
      },
    ]);
    setSelectedPersonaId("");
  };

  const handleRemovePropietario = (id: string) => {
    setPropietarios((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePorcentajeChange = (id: string, nuevoValor: number) => {
    setPropietarios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, porcentaje: nuevoValor } : p))
    );
  };

  const handleHonorarioChange = (id: string, nuevoValor: number) => {
    setPropietarios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, honorario_porcentual: nuevoValor } : p))
    );
  };

  // Generador de descripción comercial asistida por IA
  const handleGenerateAIDescription = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const tipo = formData.tipo_inmueble.charAt(0).toUpperCase() + formData.tipo_inmueble.slice(1);
      const amb = `${formData.ambientes} ambientes`;
      const op = formData.operacion_web === "alquiler" ? "alquiler permanente" : formData.operacion_web === "venta" ? "venta directa" : "alquiler temporario";
      const ubi = `${formData.direccion_calle || "Ubicación destacada"} ${formData.direccion_numero || ""}, ${formData.localidad}`;

      const nuevoTitulo = `${tipo} ${amb} en ${op === "venta directa" ? "Venta" : "Alquiler"} - ${formData.localidad}`;
      const nuevaDesc = `Excelente oportunidad en ${op}. ${tipo} de ${amb} (${formData.dormitorios} dorm., ${formData.banios} baño) con vista abierta y gran luminosidad natural en ${ubi}. Living-comedor amplio, cocina funcional con amoblamientos de calidad.${formData.expensas_estimadas ? ` Bajas expensas estimadas en $ ${formData.expensas_estimadas}.` : ""} ¡Coordiná tu visita por WhatsApp!`;

      setFormData((prev) => ({
        ...prev,
        titulo_web: nuevoTitulo,
        descripcion_web: nuevaDesc,
      }));
      setIsGeneratingAI(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!porcentajeValido) {
      alert("La suma de porcentajes de los propietarios debe ser exactamente 100%");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`¡Propiedad en ${formData.direccion_calle} ${formData.direccion_numero} guardada con éxito! Publicada en la Vidriera: ${formData.publicar_en_vidriera ? "SÍ" : "NO"}`);
      router.push("/propiedades");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header con migas de pan y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/propiedades"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="w-5 h-5 text-[#26a69a]" />
              Alta de Inmueble & Publicación Web
            </h1>
            <p className="text-xs text-slate-500">
              Registrá la propiedad, configurá los titulares y publicala en tu Vidriera Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/propiedades"
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving || !porcentajeValido || !formData.direccion_calle}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-[0.98]",
              porcentajeValido && formData.direccion_calle
                ? "bg-[#004d40] hover:bg-[#00382e] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "Guardar Inmueble"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Formulario Principal (2 Columnas) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tarjeta 1: Ubicación & Identificación */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4 h-4 text-[#26a69a]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Ubicación y Nomenclatura Catastral
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Inmueble *
                </label>
                <select
                  value={formData.tipo_inmueble}
                  onChange={(e) => handleInputChange("tipo_inmueble", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                >
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="ph">PH</option>
                  <option value="local">Local Comercial</option>
                  <option value="oficina">Oficina</option>
                  <option value="cochera">Cochera</option>
                  <option value="galpon">Galpón / Depósito</option>
                  <option value="terreno">Terreno / Lote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destino de Uso *
                </label>
                <select
                  value={formData.destino}
                  onChange={(e) => handleInputChange("destino", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                >
                  <option value="vivienda">Vivienda Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="temporal">Alquiler Temporario</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calle / Avenida *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mitre, Av. Colón, Güemes"
                  value={formData.direccion_calle}
                  onChange={(e) => handleInputChange("direccion_calle", e.target.value)}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1419"
                  value={formData.direccion_numero}
                  onChange={(e) => handleInputChange("direccion_numero", e.target.value)}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Piso / Departamento
                </label>
                <input
                  type="text"
                  placeholder="Ej: 5° B, PB 2"
                  value={formData.piso_dpto}
                  onChange={(e) => handleInputChange("piso_dpto", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidad Funcional (UF)
                </label>
                <input
                  type="text"
                  placeholder="Ej: UF 077-045141-8"
                  value={formData.unidad_funcional}
                  onChange={(e) => handleInputChange("unidad_funcional", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localidad *
                </label>
                <input
                  type="text"
                  value={formData.localidad}
                  onChange={(e) => handleInputChange("localidad", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formData.provincia}
                  onChange={(e) => handleInputChange("provincia", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Partida Inmobiliaria / Catastro
                </label>
                <input
                  type="text"
                  placeholder="Ej: 077-123456"
                  value={formData.partida_inmobiliaria}
                  onChange={(e) => handleInputChange("partida_inmobiliaria", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Co-Titularidad & Honorarios de Administración (Estilo SPOT) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#26a69a]" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Co-Titularidad & Honorarios de Administración
                </h2>
              </div>

              {/* Indicador de suma 100% */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Split Total:</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums border",
                    porcentajeValido
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-rose-50 text-rose-800 border-rose-300 animate-pulse"
                  )}
                >
                  {totalPorcentaje}%
                </span>
              </div>
            </div>

            {/* Selector de nuevo propietario */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <select
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#26a69a] outline-none"
              >
                <option value="">Seleccionar propietario existente del CRM...</option>
                {PROPIETARIOS_MOCK.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.cuit})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddPropietario}
                disabled={!selectedPersonaId}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                  selectedPersonaId
                    ? "bg-[#26a69a] hover:bg-[#1e8e84] text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Listado de propietarios asignados con split y honorarios % */}
            <div className="space-y-2.5">
              {propietarios.map((propietario) => (
                <div
                  key={propietario.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-colors gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {propietario.nombre}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {propietario.cuit} • CBU/Alias:{" "}
                      <strong className="text-slate-700">{propietario.cbu_alias}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* % Split titular */}
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] text-slate-500 font-semibold">% Titular:</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={propietario.porcentaje}
                        onChange={(e) =>
                          handlePorcentajeChange(propietario.id, Number(e.target.value))
                        }
                        className="w-14 text-xs text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded p-1.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                      />
                    </div>

                    {/* % Honorario de administración pactado */}
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] text-slate-500 font-semibold">Hon. Inmob:</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={propietario.honorario_porcentual}
                          onChange={(e) =>
                            handleHonorarioChange(propietario.id, Number(e.target.value))
                          }
                          className="w-14 text-xs text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded p-1.5 pr-4 focus:ring-2 focus:ring-[#26a69a] outline-none"
                        />
                        <span className="absolute right-1 text-[10px] text-slate-400 font-mono">%</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePropietario(propietario.id)}
                      disabled={propietarios.length === 1}
                      title="Quitar titular"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!porcentajeValido && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                El porcentaje entre los titulares debe sumar exactamente 100%. (Actualmente suma {totalPorcentaje}%)
              </p>
            )}
          </div>

          {/* Tarjeta 3: Características Físicas & Gastos */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Home className="w-4 h-4 text-[#26a69a]" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Características y Gastos
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambientes
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ambientes}
                  onChange={(e) => handleInputChange("ambientes", Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dormitorios
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dormitorios}
                  onChange={(e) => handleInputChange("dormitorios", Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Baños
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.banios}
                  onChange={(e) => handleInputChange("banios", Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cocheras
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cocheras}
                  onChange={(e) => handleInputChange("cocheras", Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Superficie Total (m²)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 65"
                  value={formData.superficie_total}
                  onChange={(e) => handleInputChange("superficie_total", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expensas Ordinarias Estimadas ($)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 45000"
                  value={formData.expensas_estimadas}
                  onChange={(e) => handleInputChange("expensas_estimadas", e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Publicación en Vidriera Web & Portales (Superando SPOT "Publicación & I.A.") */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#26a69a]" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Publicación en Vidriera Online & I.A.
                </h2>
              </div>

              {/* Switch Publicar */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {formData.publicar_en_vidriera ? "Publicada en Web" : "Borrador Privado"}
                </span>
                <input
                  type="checkbox"
                  checked={formData.publicar_en_vidriera}
                  onChange={(e) => handleInputChange("publicar_en_vidriera", e.target.checked)}
                  className="w-4 h-4 accent-[#004d40] rounded"
                />
              </label>
            </div>

            {formData.publicar_en_vidriera ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Modalidad de Publicación *
                    </label>
                    <select
                      value={formData.operacion_web}
                      onChange={(e) => handleInputChange("operacion_web", e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none font-semibold text-slate-800"
                    >
                      <option value="alquiler">En Alquiler Permanente</option>
                      <option value="venta">En Venta Directa</option>
                      <option value="temporal">Alquiler Temporario</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Moneda de Publicación
                    </label>
                    <select
                      value={formData.moneda_web}
                      onChange={(e) => handleInputChange("moneda_web", e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none font-mono"
                    >
                      <option value="ARS">Pesos Argentinos (ARS $)</option>
                      <option value="USD">Dólares Estadounidenses (USD U$D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Precio de Publicación *
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 450000 o 120000"
                      value={formData.precio_web}
                      onChange={(e) => handleInputChange("precio_web", e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mostrar_precio_web}
                      onChange={(e) => handleInputChange("mostrar_precio_web", e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#004d40] rounded"
                    />
                    <span className="text-slate-700 font-medium">Mostrar precio al público</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.destacada_web}
                      onChange={(e) => handleInputChange("destacada_web", e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#004d40] rounded"
                    />
                    <span className="text-slate-700 font-medium">Destacar en portada</span>
                  </label>
                </div>

                {/* Título y Generador de IA */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Título Comercial Atractivo:
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAIDescription}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#004d40] hover:text-[#002d25] bg-[#E0F2F1] hover:bg-[#B2DFDB] px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Wand2 className={cn("w-3 h-3 text-[#004d40]", isGeneratingAI && "animate-spin")} />
                      <span>{isGeneratingAI ? "Generando con IA..." : "Redactar Ficha con IA"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.titulo_web}
                    onChange={(e) => handleInputChange("titulo_web", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción Comercial para la Web:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion_web}
                    onChange={(e) => handleInputChange("descripcion_web", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                Esta propiedad se mantendrá como registro interno de administración. No será visible en el catálogo de tu Vidriera Online.
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha: Vista Previa en Vivo (Live Preview Dual) */}
        <div className="space-y-4">
          <div className="sticky top-20 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#26a69a]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Vista Previa
                </h3>
              </div>

              {/* Selector de modo de vista previa */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewTab("vidriera")}
                  className={cn(
                    "px-2 py-1 rounded-md transition-colors",
                    previewTab === "vidriera" ? "bg-white text-[#004d40] shadow-2xs" : "text-slate-500"
                  )}
                >
                  Vidriera Web
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("ficha")}
                  className={cn(
                    "px-2 py-1 rounded-md transition-colors",
                    previewTab === "ficha" ? "bg-white text-[#004d40] shadow-2xs" : "text-slate-500"
                  )}
                >
                  Ficha ERP
                </button>
              </div>
            </div>

            {/* Render Preview */}
            {previewTab === "vidriera" ? (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Así se verá en tu catálogo online:
                </span>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={formData.imagen_web}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide text-white bg-[#004d40] shadow-xs">
                        {formData.operacion_web === "alquiler"
                          ? "En Alquiler"
                          : formData.operacion_web === "venta"
                          ? "En Venta"
                          : "Temporario"}
                      </span>
                      {formData.destacada_web && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                          Destacada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black font-mono text-slate-900">
                        {formData.mostrar_precio_web && formData.precio_web
                          ? formatCurrency(Number(formData.precio_web), formData.moneda_web)
                          : "Consultar Precio"}
                      </span>
                      {formData.expensas_estimadas && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Exp. $ {formData.expensas_estimadas}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {formData.titulo_web || "Sin título comercial"}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#26a69a]" />
                      <span>{formData.direccion_calle || "Calle"} {formData.direccion_numero}, {formData.localidad}</span>
                    </p>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-slate-400" />
                        <span>{formData.dormitorios} Dorm.</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3 text-slate-400" />
                        <span>{formData.banios} Baño(s)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-slate-400" />
                        <span>{formData.superficie_total || "--"} m²</span>
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-bold text-[#004d40] bg-[#e0f2f1] rounded-lg">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Consultar por WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] font-extrabold text-[#004d40] bg-[#e0f2f1] px-2 py-0.5 rounded uppercase">
                    {formData.tipo_inmueble} • {formData.destino}
                  </span>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">
                    {formData.direccion_calle || "Dirección no especificada"}{" "}
                    {formData.direccion_numero}
                  </h4>

                  {formData.piso_dpto && (
                    <p className="text-slate-600 font-medium">Piso/Dpto: {formData.piso_dpto}</p>
                  )}

                  <p className="text-slate-500 mt-1">
                    {formData.localidad}, {formData.provincia}
                  </p>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold text-slate-700 mb-1.5">
                    Titulares ({propietarios.length}):
                  </h5>
                  <div className="space-y-1.5">
                    {propietarios.map((p) => (
                      <div
                        key={p.id}
                        className="text-xs p-2 bg-[#f0f9f8] rounded border border-[#b2dfdb] flex justify-between items-center"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                          {p.nombre}
                        </span>
                        <div className="text-right font-mono text-[10px]">
                          <span className="font-bold text-[#004d40] block">{p.porcentaje}% Titular</span>
                          <span className="text-slate-500 block">Hon: {p.honorario_porcentual}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving || !porcentajeValido || !formData.direccion_calle}
                className={cn(
                  "w-full py-2.5 px-4 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                  porcentajeValido && formData.direccion_calle
                    ? "bg-[#004d40] hover:bg-[#00382e] text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                <span>Confirmar y Guardar Inmueble</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
