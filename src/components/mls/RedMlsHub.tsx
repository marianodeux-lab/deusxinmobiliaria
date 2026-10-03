"use client";

import React, { useState, useMemo } from "react";
import {
  Share2,
  Building,
  Search,
  Filter,
  Users,
  Compass,
  ArrowRight,
  Send,
  MessageCircle,
  FileText,
  Plus,
  CheckCircle2,
  BadgeDollarSign,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Car,
  Tag,
  ShieldCheck,
  ChevronRight,
  Handshake
} from "lucide-react";
import { MlsPropiedadItem, MlsBusquedaItem, publicarMlsBusquedaAction } from "@/modules/mls/actions";
import { formatCurrency, cn } from "@/lib/utils";

interface RedMlsHubProps {
  initialPropiedades: MlsPropiedadItem[];
  initialBusquedas: MlsBusquedaItem[];
}

export function RedMlsHub({ initialPropiedades, initialBusquedas }: RedMlsHubProps) {
  const [activeTab, setActiveTab] = useState<"catalogo" | "busquedas">("catalogo");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOperacion, setFilterOperacion] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [showModalBusqueda, setShowModalBusqueda] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  // Form state para nueva búsqueda
  const [formBusqueda, setFormBusqueda] = useState({
    tipo_operacion: "alquiler" as "alquiler" | "venta" | "temporal",
    tipo_inmueble: "departamento",
    localidad: "9 de Julio",
    precio_maximo: 400000,
    moneda: "ARS" as "ARS" | "USD",
    dormitorios_min: 2,
    requiere_cochera: true,
    descripcion: "",
    contacto_nombre: "Juan Martín Deus",
    contacto_telefono: "+54 9 2317 415612",
  });

  // Filtrado de propiedades compartidas
  const filteredPropiedades = useMemo(() => {
    return initialPropiedades.filter((p) => {
      const matchText =
        p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.localidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.inmobiliaria.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      const matchOperacion = filterOperacion === "todos" || p.operacion === filterOperacion;
      const matchTipo = filterTipo === "todos" || p.tipo_inmueble.toLowerCase().includes(filterTipo);

      return matchText && matchOperacion && matchTipo;
    });
  }, [initialPropiedades, searchTerm, filterOperacion, filterTipo]);

  // Filtrado de búsquedas
  const filteredBusquedas = useMemo(() => {
    return initialBusquedas.filter((b) => {
      const matchText =
        b.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.localidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.contacto.inmobiliaria.toLowerCase().includes(searchTerm.toLowerCase());

      const matchOperacion = filterOperacion === "todos" || b.tipo_operacion === filterOperacion;
      return matchText && matchOperacion;
    });
  }, [initialBusquedas, searchTerm, filterOperacion]);

  const handleCrearBusqueda = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await publicarMlsBusquedaAction(formBusqueda);
    if (res.success) {
      setModalSuccess(true);
      setTimeout(() => {
        setModalSuccess(false);
        setShowModalBusqueda(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Oficial de la Red MLS DeusX */}
      <div className="bg-gradient-to-r from-[#004d40] via-[#00695c] to-[#00796b] text-white rounded-2xl p-6 shadow-xl border border-[#80CBC4]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-inner">
              <Handshake className="w-8 h-8 text-[#80CBC4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Red MLS Colaborativa DeusX
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#80CBC4] text-[#004d40] rounded-full">
                  Co-Brokering B2B
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                Interconectá tu cartera con colegas martilleros de la red. Compartí honorarios 50/50, cruzá clientes demandantes con inventario disponible y multiplicá tus cierres mensuales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModalBusqueda(true)}
              className="px-4 py-2.5 text-xs font-bold text-[#004d40] bg-white hover:bg-[#E0F2F1] rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#004d40]" />
              <span>+ Publicar Búsqueda de Cliente</span>
            </button>
          </div>
        </div>

        {/* Mini stats del MLS */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-white/70 block text-[11px]">Cartera Compartida</span>
            <span className="font-bold text-sm font-mono text-white">
              {initialPropiedades.length} Inmuebles en Red
            </span>
          </div>
          <div>
            <span className="text-white/70 block text-[11px]">Búsquedas Activas</span>
            <span className="font-bold text-sm font-mono text-white">
              {initialBusquedas.length} Demandas de Colegas
            </span>
          </div>
          <div>
            <span className="text-white/70 block text-[11px]">Split Estándar</span>
            <span className="font-bold text-sm font-mono text-[#80CBC4]">
              50% / 50% Comisión
            </span>
          </div>
          <div>
            <span className="text-white/70 block text-[11px]">Red Profesional</span>
            <span className="font-bold text-sm text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#80CBC4]" />
              100% Martilleros Matriculados
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas Principales */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("catalogo")}
            className={cn(
              "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "catalogo"
                ? "border-[#00796b] text-[#004d40]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Building className="w-4 h-4" />
            <span>Cartera Compartida en Red ({filteredPropiedades.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("busquedas")}
            className={cn(
              "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "busquedas"
                ? "border-[#00796b] text-[#004d40]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Compass className="w-4 h-4" />
            <span>Radar de Búsquedas Activas ({filteredBusquedas.length})</span>
            <span className="px-1.5 py-0.2 bg-[#E0F2F1] text-[#004d40] text-[10px] font-mono font-bold rounded-full">
              Reverse Matching
            </span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "catalogo"
                ? "Buscar por dirección, localidad o colega..."
                : "Buscar en demandas activas de colegas..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796b]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterOperacion}
            onChange={(e) => setFilterOperacion(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00796b]"
          >
            <option value="todos">Cualquier Operación</option>
            <option value="alquiler">Alquiler Permanente</option>
            <option value="venta">Venta</option>
            <option value="temporal">Alquiler Temporal</option>
          </select>

          {activeTab === "catalogo" && (
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00796b]"
            >
              <option value="todos">Todos los Inmuebles</option>
              <option value="departamento">Departamentos</option>
              <option value="casa">Casas / Chalets</option>
              <option value="local">Locales Comerciales</option>
            </select>
          )}
        </div>
      </div>

      {/* Vista 1: Cartera Compartida de Inmuebles (Co-brokering) */}
      {activeTab === "catalogo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPropiedades.map((p) => {
            const whatsappMsg = encodeURIComponent(
              `Hola! Te contacto a través de la Red MLS DeusX por la propiedad compartida en ${p.direccion} (${p.localidad}). Tengo un cliente interesado para coordinar visita.`
            );
            const waUrl = `https://wa.me/${p.inmobiliaria.whatsapp?.replace(/[^0-9]/g, "")}?text=${whatsappMsg}`;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Cabecera / Badge de Co-Brokering */}
                <div className="p-3 bg-gradient-to-r from-[#E0F2F1] to-[#F1F8E9] border-b border-[#80CBC4]/40 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#004d40] text-white">
                    {p.operacion}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#004d40] bg-white px-2 py-0.5 rounded-full border border-[#80CBC4]/60 shadow-2xs">
                    <Handshake className="w-3.5 h-3.5 text-[#00796b]" />
                    <span>Split {p.comision_compartida}%</span>
                  </span>
                </div>

                {/* Contenido Ficha */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#00796b]" />
                      <span>{p.localidad}, Bs. As.</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00796b] transition-colors mt-0.5 line-clamp-1">
                      {p.direccion}
                    </h3>

                    {/* Precio */}
                    <div className="mt-2 text-lg font-bold font-mono text-[#004d40]">
                      {p.moneda === "USD" ? `USD ${p.precio.toLocaleString()}` : formatCurrency(p.precio, "ARS")}
                    </div>

                    {/* Especificaciones */}
                    <div className="mt-3 grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.dormitorios} dorm</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.banios} baño</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.superficie} m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Datos del Colega Propietario de la Ficha */}
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-500">Publicado por colega de la red:</div>
                    <div className="text-xs font-bold text-slate-800">{p.inmobiliaria.nombre}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.inmobiliaria.matricula}</div>

                    {/* Botones Operativos de Co-brokering */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => alert("Ficha técnica neutra (marca blanca) generada para enviar a tu cliente sin los datos del colega.")}
                        className="py-1.5 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ficha Neutra</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 text-[11px] font-bold text-white bg-[#00796b] hover:bg-[#004d40] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Contactar</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista 2: Radar de Búsquedas Activas (Reverse Matching de Demanda) */}
      {activeTab === "busquedas" && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Reverse Matching:</strong> Colegas con compradores e inquilinos calificados buscando propiedades. Si tenés una propiedad que calza, contactalos para cerrar la operación al 50%.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBusquedas.map((b) => {
              const waDemanda = encodeURIComponent(
                `Hola ${b.contacto.nombre}! Te contacto por la búsqueda activa en la Red MLS DeusX de ${b.tipo_inmueble} en ${b.localidad}. Tengo una propiedad en cartera que coincide con lo que busca tu cliente.`
              );
              const waUrl = `https://wa.me/${b.contacto.telefono?.replace(/[^0-9]/g, "")}?text=${waDemanda}`;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-[#80CBC4] transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#E0F2F1] text-[#004d40]">
                          Busca {b.tipo_operacion}
                        </span>
                        <span className="text-xs font-bold text-slate-800 capitalize">
                          {b.tipo_inmueble}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00796b]">
                        Hasta {b.moneda === "USD" ? `USD ${b.precio_maximo.toLocaleString()}` : formatCurrency(b.precio_maximo, "ARS")}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.localidad} {b.zona_barrio && `(${b.zona_barrio})`}</span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed italic">
                      "{b.descripcion}"
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span>Mín. {b.dormitorios_min} dorm.</span>
                      <span>•</span>
                      <span>{b.requiere_cochera ? "Con cochera" : "Sin cochera requerida"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Colega solicitante:</span>
                      <span className="text-xs font-bold text-slate-800">
                        {b.contacto.inmobiliaria} ({b.contacto.nombre})
                      </span>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>Tengo Inmueble Coincidente</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Publicar Nueva Búsqueda Activa */}
      {showModalBusqueda && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Publicar Búsqueda Activa en la Red MLS
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compartí la demanda de tu cliente con los colegas de la red. Si alguno tiene una propiedad que calza, te contactará para cerrar la operación juntos.
            </p>

            {modalSuccess ? (
              <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-xs font-bold">
                ✓ Búsqueda compartida exitosamente en la Red MLS DeusX
              </div>
            ) : (
              <form onSubmit={handleCrearBusqueda} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tipo Operación
                    </label>
                    <select
                      value={formBusqueda.tipo_operacion}
                      onChange={(e) => setFormBusqueda({ ...formBusqueda, tipo_operacion: e.target.value as any })}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="alquiler">Alquiler Permanente</option>
                      <option value="venta">Venta</option>
                      <option value="temporal">Alquiler Temporal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tipo Inmueble
                    </label>
                    <select
                      value={formBusqueda.tipo_inmueble}
                      onChange={(e) => setFormBusqueda({ ...formBusqueda, tipo_inmueble: e.target.value })}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="departamento">Departamento</option>
                      <option value="casa">Casa / Chalet</option>
                      <option value="local">Local Comercial</option>
                      <option value="terreno">Lote / Terreno</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Localidad / Ciudad
                    </label>
                    <input
                      type="text"
                      value={formBusqueda.localidad}
                      onChange={(e) => setFormBusqueda({ ...formBusqueda, localidad: e.target.value })}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Presupuesto Máximo
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={formBusqueda.moneda}
                        onChange={(e) => setFormBusqueda({ ...formBusqueda, moneda: e.target.value as any })}
                        className="text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 w-20"
                      >
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                      </select>
                      <input
                        type="number"
                        value={formBusqueda.precio_maximo}
                        onChange={(e) => setFormBusqueda({ ...formBusqueda, precio_maximo: Number(e.target.value) })}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Descripción detallada de la demanda
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Busca 2 ambientes luminoso, con cochera y balcón, garantías propietarias demostrables..."
                    value={formBusqueda.descripcion}
                    onChange={(e) => setFormBusqueda({ ...formBusqueda, descripcion: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModalBusqueda(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00332c] rounded-lg shadow-sm"
                  >
                    Publicar Búsqueda en la Red
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
