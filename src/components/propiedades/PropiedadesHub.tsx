"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Search,
  Filter,
  MapPin,
  Home,
  CheckCircle2,
  Clock,
  Globe,
  Share2,
  ExternalLink,
  MessageCircle,
  Phone,
  LayoutGrid,
  List,
  Eye,
  FolderKanban,
  Bed,
  Bath,
  Car,
  Maximize2,
  Tag,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import {
  PropiedadItem,
  PropiedadesKpis,
  togglePublicarVidrieraAction,
  toggleDestacadaWebAction,
} from "@/modules/propiedades/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

interface PropiedadesHubProps {
  initialItems: PropiedadItem[];
  initialKpis: PropiedadesKpis;
}

export function PropiedadesHub({ initialItems, initialKpis }: PropiedadesHubProps) {
  const [items, setItems] = useState<PropiedadItem[]>(initialItems);
  const [kpis, setKpis] = useState<PropiedadesKpis>(initialKpis);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "alquilados" | "disponibles" | "vidriera">("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [selectedPropiedadDrawer, setSelectedPropiedadDrawer] = useState<PropiedadItem | null>(null);

  // Filtrado de propiedades
  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      // Filtro de Estado
      if (filterStatus === "alquilados" && (!p.contrato_activo || p.contrato_activo.estado !== "vigente")) return false;
      if (filterStatus === "disponibles" && (p.contrato_activo && p.contrato_activo.estado === "vigente")) return false;
      if (filterStatus === "vidriera" && !p.publicar_en_vidriera) return false;

      // Filtro de Tipo
      if (filterTipo !== "todos" && p.tipo_inmueble.toLowerCase() !== filterTipo.toLowerCase()) return false;

      // Filtro de Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDir = `${p.direccion_calle} ${p.direccion_numero} ${p.localidad}`.toLowerCase().includes(q);
        const matchCodigo = p.codigo_interno?.toLowerCase().includes(q);
        const matchPropietario = p.propietarios.some((pr) => pr.nombre.toLowerCase().includes(q));
        const matchInquilino = p.contrato_activo?.inquilino_nombre?.toLowerCase().includes(q);
        const matchCarpeta = p.contrato_activo?.carpeta_numero?.toLowerCase().includes(q);
        return matchDir || matchCodigo || matchPropietario || matchInquilino || matchCarpeta;
      }

      return true;
    });
  }, [items, filterStatus, filterTipo, searchQuery]);

  // Conmutar publicación en vidriera
  const handleToggleVidriera = async (propiedadId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setItems((prev) =>
      prev.map((p) => (p.id === propiedadId ? { ...p, publicar_en_vidriera: newVal } : p))
    );
    setKpis((prev) => ({
      ...prev,
      totalPublicadasVidriera: newVal
        ? prev.totalPublicadasVidriera + 1
        : Math.max(0, prev.totalPublicadasVidriera - 1),
    }));

    await togglePublicarVidrieraAction(propiedadId, newVal);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E0F2F1] text-[#004d40]">
              <Building className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Catálogo de Propiedades e Inmuebles
              </h1>
              <p className="text-xs text-slate-500">
                Inventario centralizado de inmuebles, vinculación con contratos, ocupación y vidriera web pública.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/configuracion/vidriera"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#004d40]" />
            <span>Vidriera Web</span>
          </Link>

          <Link
            href="/propiedades/nueva"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Propiedad</span>
          </Link>
        </div>
      </div>

      {/* 2. TARJETAS KPI EJECUTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Inmuebles */}
        <div className="p-4 rounded-2xl bg-[#1C1D23] border border-[#262832] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Inmuebles
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#141519] border border-[#262832] text-slate-300 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {kpis.totalPropiedades}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Unidades físicas en la cartera activa
          </div>
        </div>

        {/* KPI 2: Alquiladas / Ocupación */}
        <div className="p-4 rounded-2xl bg-[#1C1D23] border border-[#10B981]/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Alquiladas (Ocupación)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00382E] border border-[#10B981]/40 text-[#34D399] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#34D399] font-mono tracking-tight">
              {kpis.totalAlquiladas}
            </span>
            <span className="text-xs font-bold text-[#A7F3D0]">
              {kpis.tasaOcupacion}% Ocupación
            </span>
          </div>
          {/* Barra de Ocupación */}
          <div className="mt-2 w-full bg-[#101115] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#10B981] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.tasaOcupacion)}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-300 font-medium">
            {kpis.totalAlquiladas} inmuebles con contrato de locación vigente
          </div>
        </div>

        {/* KPI 3: Disponibles / Vacantes */}
        <div className="p-4 rounded-2xl bg-[#1C1D23] border border-[#2DD4BF]/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#99F6E4] uppercase tracking-wider">
              Disponibles / Vacantes
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00382E] border border-[#2DD4BF]/40 text-[#2DD4BF] flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-[#2DD4BF] font-mono tracking-tight">
              {kpis.totalDisponibles}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 font-medium">
            Listas para alquiler o venta inmediata
          </div>
        </div>

        {/* KPI 4: Publicadas en Vidriera Web */}
        <div className="p-4 rounded-2xl bg-[#1C1D23] border border-[#10B981]/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Vidriera Web Online
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#00382E] border border-[#10B981]/40 text-[#34D399] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#34D399] font-mono tracking-tight">
              {kpis.totalPublicadasVidriera}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00382E] text-[#34D399] border border-[#10B981]/40">
              NIC.ar
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 font-medium">
            Propiedades visibles en el portal público de la agencia
          </div>
        </div>
      </div>

      {/* 3. BARRA DE BÚSQUEDA, FILTROS Y MODO DE VISTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Domicilio, Propietario, Inquilino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-colors"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus("todos")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
              filterStatus === "todos"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Todos ({items.length})
          </button>

          <button
            onClick={() => setFilterStatus("alquilados")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterStatus === "alquilados"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
            )}
          >
            <span>Alquilados</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/60 font-bold">
              {kpis.totalAlquiladas}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("disponibles")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterStatus === "disponibles"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60"
            )}
          >
            <span>Disponibles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200/60 font-bold">
              {kpis.totalDisponibles}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("vidriera")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterStatus === "vidriera"
                ? "bg-teal-700 text-white"
                : "bg-[#E0F2F1] text-[#004d40] hover:bg-teal-100"
            )}
          >
            <span>En Vidriera</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#B2DFDB] font-bold">
              {kpis.totalPublicadasVidriera}
            </span>
          </button>

          {/* Selector de Tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:bg-white"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="departamento">Departamentos</option>
            <option value="casa">Casas</option>
            <option value="local">Locales Comerciales</option>
            <option value="oficina">Oficinas</option>
            <option value="cochera">Cocheras</option>
            <option value="terreno">Terrenos</option>
          </select>

          {/* Switch Grid vs Tabla */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              )}
              title="Vista Galería"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              )}
              title="Vista Tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL: GRID O TABLA */}
      {viewMode === "grid" ? (
        /* VISTA GALERÍA / TARJETAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">No se encontraron propiedades con los filtros seleccionados</p>
              <p className="text-xs text-slate-400 mt-1">Pruebe limpiando la búsqueda o cambiando el tipo de inmueble.</p>
            </div>
          ) : (
            filteredItems.map((p) => {
              const estaAlquilado = p.contrato_activo && p.contrato_activo.estado === "vigente";
              const primerPropietario = p.propietarios[0] || { nombre: "Sin Propietario" };

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="p-4 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-700">
                        {p.tipo_inmueble}
                      </span>

                      {/* Badge de Estado de Ocupación */}
                      {estaAlquilado ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Alquilado (#{p.contrato_activo?.carpeta_numero})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Home className="w-3 h-3 text-blue-600" />
                          Disponible
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {p.direccion_calle} {p.direccion_numero}
                        {p.piso_dpto && <span className="text-slate-500 font-normal ml-1">({p.piso_dpto})</span>}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{p.localidad}, {p.provincia}</span>
                      </p>
                    </div>
                  </div>

                  {/* Características Físicas */}
                  <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 grid grid-cols-4 gap-2 text-center text-xs text-slate-600">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900">{p.ambientes}</span>
                      <span className="text-[10px] text-slate-400">Ambientes</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900">{p.dormitorios}</span>
                      <span className="text-[10px] text-slate-400">Dormit.</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900">{p.banios}</span>
                      <span className="text-[10px] text-slate-400">Baños</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900">
                        {p.superficie_total ? `${p.superficie_total} m²` : "--"}
                      </span>
                      <span className="text-[10px] text-slate-400">Superficie</span>
                    </div>
                  </div>

                  {/* Bloque de Información Locativa / Comercial */}
                  <div className="p-4 flex-1 space-y-3">
                    {estaAlquilado ? (
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-[#10B981]/35 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#34D399] font-bold uppercase">
                            Canon Locativo Vigente:
                          </span>
                          <span className="font-mono font-bold text-white text-xs">
                            {formatCurrency(p.contrato_activo?.valor_alquiler_actual || 0, p.contrato_activo?.moneda_base || "ARS")}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Inquilino: <span className="font-bold text-white">{p.contrato_activo?.inquilino_nombre}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-[#262832] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Precio de Publicación:
                          </span>
                          <span className="font-mono font-bold text-white text-xs">
                            {p.precio_web ? formatCurrency(p.precio_web, p.moneda_web) : "A Consultar"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Destino: {p.destino} • Operación: {p.operacion_web}
                        </div>
                      </div>
                    )}

                    {/* Propietario & Contacto */}
                    <div className="text-xs pt-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Propietario:</span>
                        <span className="font-bold text-slate-200 line-clamp-1">{primerPropietario.nombre}</span>
                      </div>
                      {primerPropietario.telefono && (
                        <a
                          href={buildWhatsAppLink(
                            primerPropietario.telefono,
                            `Hola ${primerPropietario.nombre}, le escribimos de DeusX Inmobiliaria respecto a su propiedad en ${p.direccion_calle} ${p.direccion_numero}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#34D399] hover:text-white hover:bg-[#00382E] rounded-lg transition-colors border border-[#10B981]/30"
                          title="Contactar al Propietario por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Footer de Acciones & Toggle de Vidriera */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    {/* Toggle Vidriera Online */}
                    <button
                      onClick={() => handleToggleVidriera(p.id, p.publicar_en_vidriera)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors",
                        p.publicar_en_vidriera
                          ? "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
                          : "bg-slate-200/80 text-slate-600 hover:bg-slate-300"
                      )}
                      title={p.publicar_en_vidriera ? "Visible en el sitio web de la inmobiliaria" : "No publicado en la web"}
                    >
                      <Globe className="w-3 h-3 text-teal-700" />
                      <span>{p.publicar_en_vidriera ? "En Vidriera" : "Oculto Web"}</span>
                    </button>

                    {/* Ver Ficha Técnica */}
                    <button
                      onClick={() => setSelectedPropiedadDrawer(p)}
                      className="inline-flex items-center gap-1 px-3 py-1 font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver Ficha</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VISTA TABLA DETALLADA */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Inmueble / Domicilio</th>
                  <th className="py-3 px-4">Tipo & Destino</th>
                  <th className="py-3 px-4">Amb / Dorm / Sup</th>
                  <th className="py-3 px-4">Propietario Locador</th>
                  <th className="py-3 px-4">Estado / Ocupación</th>
                  <th className="py-3 px-4">Canon / Precio</th>
                  <th className="py-3 px-4 text-center">Vidriera</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No se encontraron propiedades.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((p) => {
                    const estaAlquilado = p.contrato_activo && p.contrato_activo.estado === "vigente";
                    const primerProp = p.propietarios[0] || { nombre: "Sin Propietario" };

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {p.direccion_calle} {p.direccion_numero}
                            {p.piso_dpto && <span className="text-slate-500 font-normal ml-1">({p.piso_dpto})</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {p.localidad}
                          </div>
                        </td>

                        <td className="py-3 px-4 capitalize text-slate-700">
                          <span className="font-semibold">{p.tipo_inmueble}</span>
                          <span className="text-[10px] text-slate-400 block">{p.destino}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {p.ambientes} amb • {p.dormitorios} dorm • {p.superficie_total ? `${p.superficie_total}m²` : "--"}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{primerProp.nombre}</div>
                          {primerProp.telefono && (
                            <div className="text-[10px] text-slate-500">{primerProp.telefono}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {estaAlquilado ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Alquilado (#{p.contrato_activo?.carpeta_numero})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <Home className="w-3 h-3 text-blue-600" />
                              Disponible
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {estaAlquilado ? (
                            formatCurrency(p.contrato_activo?.valor_alquiler_actual || 0, p.contrato_activo?.moneda_base || "ARS")
                          ) : p.precio_web ? (
                            formatCurrency(p.precio_web, p.moneda_web)
                          ) : (
                            <span className="text-slate-400 font-normal">A consultar</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleVidriera(p.id, p.publicar_en_vidriera)}
                            className={cn(
                              "p-1 rounded-md transition-colors",
                              p.publicar_en_vidriera
                                ? "text-teal-700 hover:bg-teal-50"
                                : "text-slate-300 hover:bg-slate-100"
                            )}
                            title={p.publicar_en_vidriera ? "Visible en Vidriera Web" : "Oculto en Web"}
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedPropiedadDrawer(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ficha</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DRAWER MODAL DE FICHA TÉCNICA DE LA PROPIEDAD */}
      {selectedPropiedadDrawer && (
        <FichaTecnicaModal
          propiedad={selectedPropiedadDrawer}
          onClose={() => setSelectedPropiedadDrawer(null)}
        />
      )}
    </div>
  );
}

// ==============================================================================
// MODAL DRAWER DE FICHA TÉCNICA DETALLADA
// ==============================================================================

interface FichaTecnicaModalProps {
  propiedad: PropiedadItem;
  onClose: () => void;
}

function FichaTecnicaModal({ propiedad, onClose }: FichaTecnicaModalProps) {
  const estaAlquilado = propiedad.contrato_activo && propiedad.contrato_activo.estado === "vigente";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#E0F2F1] text-[#004d40] rounded">
                {propiedad.tipo_inmueble}
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {propiedad.direccion_calle} {propiedad.direccion_numero}
                {propiedad.piso_dpto && <span className="text-slate-500 font-normal ml-1">({propiedad.piso_dpto})</span>}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {propiedad.localidad}, {propiedad.provincia} {propiedad.codigo_postal ? `(CP ${propiedad.codigo_postal})` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Ficha Catastral & Identificación */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Código Interno:</span>
              <span className="font-mono font-bold text-slate-800">{propiedad.codigo_interno || "S/C"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Unidad Funcional:</span>
              <span className="font-mono text-slate-800">{propiedad.unidad_funcional || "--"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Partida Inmobiliaria:</span>
              <span className="font-mono text-slate-800">{propiedad.partida_inmobiliaria || "No declarada"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Catastro:</span>
              <span className="font-mono text-slate-800">{propiedad.nomenclatura_catastral || "--"}</span>
            </div>
          </div>

          {/* Características de la Propiedad */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-slate-500">
              Características & Ambientes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-sm font-extrabold text-slate-900 block">{propiedad.ambientes}</span>
                <span className="text-[10px] text-slate-500">Ambientes</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-sm font-extrabold text-slate-900 block">{propiedad.dormitorios}</span>
                <span className="text-[10px] text-slate-500">Dormitorios</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-sm font-extrabold text-slate-900 block">{propiedad.banios}</span>
                <span className="text-[10px] text-slate-500">Baños</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                <span className="text-sm font-extrabold text-slate-900 block">
                  {propiedad.superficie_total ? `${propiedad.superficie_total} m²` : "--"}
                </span>
                <span className="text-[10px] text-slate-500">Superficie Total</span>
              </div>
            </div>
          </div>

          {/* Estado de Contrato de Locación */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-slate-500">
              Estado de Ocupación / Contrato
            </h4>
            {estaAlquilado ? (
              <div className="p-3 bg-[#141519] rounded-xl border border-[#10B981]/35 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#34D399]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>Contrato de Alquiler Vigente (Carpeta #{propiedad.contrato_activo?.carpeta_numero})</span>
                  </div>
                  <span className="font-mono font-extrabold text-white text-sm">
                    {formatCurrency(propiedad.contrato_activo?.valor_alquiler_actual || 0, propiedad.contrato_activo?.moneda_base || "ARS")} / mes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-[#262832]">
                  <div>
                    <span className="text-slate-400 block">Inquilino (Locatario):</span>
                    <span className="font-bold text-white">{propiedad.contrato_activo?.inquilino_nombre}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vencimiento del Contrato:</span>
                    <span className="font-bold font-mono text-slate-200">{propiedad.contrato_activo?.fecha_fin}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#141519] rounded-xl border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Home className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Inmueble Disponible / Vacante para Comercializar</span>
                </div>
                <Link
                  href="/contratos"
                  className="px-3 py-1 bg-gradient-to-r from-[#004D40] to-[#10B981] hover:brightness-110 text-white rounded-lg font-bold text-xs shadow-2xs"
                >
                  Crear Contrato
                </Link>
              </div>
            )}
          </div>

          {/* Propietarios / Titulares */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider text-slate-500">
              Propietarios / Titulares
            </h4>
            <div className="space-y-1.5">
              {propiedad.propietarios.length === 0 ? (
                <p className="text-slate-400 italic">No hay propietarios vinculados directamente.</p>
              ) : (
                propiedad.propietarios.map((pr, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{pr.nombre}</span>
                      <span className="text-[10px] text-slate-500">{pr.documento}</span>
                    </div>
                    {pr.cbu_alias && (
                      <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        CBU: {pr.cbu_alias}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notas Adicionales */}
          {propiedad.notas && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 block">Notas & Observaciones:</span>
              <p className="text-slate-700 text-xs mt-0.5">{propiedad.notas}</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/configuracion/vidriera"
            className="text-xs font-semibold text-teal-800 hover:underline flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Ver en Vidriera Online</span>
          </Link>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
