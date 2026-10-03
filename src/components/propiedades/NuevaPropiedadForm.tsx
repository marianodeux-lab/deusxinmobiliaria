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
  Info
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface PropietarioAsignado {
  id: string;
  nombre: string;
  cuit: string;
  cbu_alias: string;
  porcentaje: number;
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
  });

  // Lista de co-propietarios con split porcentual
  const [propietarios, setPropietarios] = useState<PropietarioAsignado[]>([
    {
      id: "p-1",
      nombre: "STIGLICH, MARIA PAULA",
      cuit: "27-28495123-4",
      cbu_alias: "PAULA.PROPIEDADES",
      porcentaje: 100,
    },
  ]);

  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!porcentajeValido) {
      alert("La suma de porcentajes de los propietarios debe ser exactamente 100%");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`¡Propiedad en ${formData.direccion_calle} ${formData.direccion_numero} creada con éxito con ${propietarios.length} propietario(s)!`);
      router.push("/");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header con migas de pan y acciones */}
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
              <Building className="w-5 h-5 text-[#26a69a]" />
              Alta de Nueva Propiedad
            </h1>
            <p className="text-xs text-slate-500">
              Registrá el inmueble para su administración y asigná sus titulares
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
        {/* Columna Izquierda: Formulario Principal (2 Columnas de ancho) */}
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

          {/* Tarjeta 2: Multi-Titularidad (Propietarios y Splits %) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#26a69a]" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Co-Titularidad & Propietarios (Splits %)
                </h2>
              </div>

              {/* Indicador de suma 100% */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Total asignado:</span>
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

            {/* Listado de propietarios asignados con sliders o inputs de % */}
            <div className="space-y-2.5">
              {propietarios.map((propietario) => (
                <div
                  key={propietario.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-colors"
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

                  <div className="flex items-center gap-3 pl-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] text-slate-500 font-semibold">% Split:</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={propietario.porcentaje}
                        onChange={(e) =>
                          handlePorcentajeChange(propietario.id, Number(e.target.value))
                        }
                        className="w-16 text-xs text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded p-1.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
                      />
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
                Para poder guardar, el porcentaje entre los titulares debe sumar exactamente 100%. (Actualmente suma {totalPorcentaje}%)
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas Privadas / Observaciones de Administración
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Llave del medidor en administración. El propietario solicita liquidaciones únicamente el día 15."
                value={formData.notas}
                onChange={(e) => handleInputChange("notas", e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#26a69a] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Vista Previa en Vivo (Live Preview) */}
        <div className="space-y-4">
          <div className="sticky top-20 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-[#26a69a]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ficha del Inmueble (Vista Previa)
              </h3>
            </div>

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

                {formData.unidad_funcional && (
                  <p className="text-slate-500 font-mono text-[11px]">{formData.unidad_funcional}</p>
                )}

                <p className="text-slate-500 mt-1">
                  {formData.localidad}, {formData.provincia}
                </p>
              </div>

              {/* Características rápidas */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Ambientes</span>
                  <strong className="text-slate-800">{formData.ambientes} Amb.</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Expensas</span>
                  <strong className="text-slate-800">
                    {formData.expensas_estimadas ? `$ ${formData.expensas_estimadas}` : "Sin expensas"}
                  </strong>
                </div>
              </div>

              {/* Propietarios y splits */}
              <div>
                <h5 className="text-[11px] font-bold text-slate-700 mb-1.5">
                  Titulares Asignados ({propietarios.length}):
                </h5>
                <div className="space-y-1.5">
                  {propietarios.map((p) => (
                    <div
                      key={p.id}
                      className="text-xs p-2 bg-[#f0f9f8] rounded border border-[#b2dfdb] flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {p.nombre}
                      </span>
                      <span className="font-mono font-bold text-[#004d40]">
                        {p.porcentaje}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
