"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Phone,
  MessageCircle,
  Share2,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Globe
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface PropiedadPublica {
  id: string;
  titulo: string;
  tipo: string;
  operacion: "alquiler" | "venta" | "temporal";
  moneda: "ARS" | "USD";
  precio: number;
  expensas?: number;
  direccion: string;
  localidad: string;
  ambientes: number;
  dormitorios: number;
  banios: number;
  superficie: number;
  imagen: string;
  destacada?: boolean;
}

const PROPIEDADES_VIDRIERA: PropiedadPublica[] = [
  {
    id: "v-1",
    titulo: "Semipiso 3 Ambientes con Vista Panorámica",
    tipo: "Departamento",
    operacion: "alquiler",
    moneda: "ARS",
    precio: 450000,
    expensas: 45000,
    direccion: "Mitre 1419, Edificio Lauquen",
    localidad: "Mar del Plata",
    ambientes: 3,
    dormitorios: 2,
    banios: 2,
    superficie: 85,
    imagen: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    destacada: true,
  },
  {
    id: "v-2",
    titulo: "Departamento Moderno a Estrenar",
    tipo: "Departamento",
    operacion: "alquiler",
    moneda: "ARS",
    precio: 380000,
    expensas: 32000,
    direccion: "Sarmiento 2751",
    localidad: "Mar del Plata",
    ambientes: 2,
    dormitorios: 1,
    banios: 1,
    superficie: 52,
    imagen: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "v-3",
    titulo: "Chalet Tradicional con Parque y Piscina",
    tipo: "Casa",
    operacion: "venta",
    moneda: "USD",
    precio: 185000,
    direccion: "Arturo Frondizi 840",
    localidad: "9 de Julio",
    ambientes: 4,
    dormitorios: 3,
    banios: 2,
    superficie: 240,
    imagen: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    destacada: true,
  },
  {
    id: "v-4",
    titulo: "Monoambiente Céntrico Luminoso",
    tipo: "Departamento",
    operacion: "temporal",
    moneda: "USD",
    precio: 45,
    direccion: "Edison 441",
    localidad: "Mar del Plata",
    ambientes: 1,
    dormitorios: 1,
    banios: 1,
    superficie: 34,
    imagen: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
];

export default function VidrieraPublicaPage() {
  const [filtroOperacion, setFiltroOperacion] = useState<"todos" | "alquiler" | "venta" | "temporal">("todos");
  const [busqueda, setBusqueda] = useState("");

  const propiedadesFiltradas = useMemo(() => {
    return PROPIEDADES_VIDRIERA.filter((p) => {
      const matchOp = filtroOperacion === "todos" || p.operacion === filtroOperacion;
      const matchText =
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.localidad.toLowerCase().includes(busqueda.toLowerCase());
      return matchOp && matchText;
    });
  }, [filtroOperacion, busqueda]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Banner de Dominio Personalizado / Info de Tenant */}
      <div className="bg-[#004d40] text-white text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#80cbc4]" />
            <span>Vidriera Oficial • <strong>DeusX Inmobiliarias</strong></span>
            <span className="hidden sm:inline text-[#80cbc4]">| Matrícula N° 3412</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[#80cbc4] hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              <span>Acceso Administrador (ERP)</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Header Público de la Inmobiliaria */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Recursos/DeusX.png"
              alt="DeusX Inmobiliarias"
              className="h-8 w-auto object-contain filter drop-shadow-sm"
            />
            <div className="hidden sm:block leading-none border-l border-slate-200 pl-3">
              <span className="font-extrabold text-sm text-[#004d40] block">Deus Inmobiliaria</span>
              <span className="text-[10px] text-slate-500 font-medium block">Gestión & Propiedades</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://wa.me/5492235123456?text=Hola,%20quisiera%20consultar%20por%20sus%20propiedades"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Inmobiliaria</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero & Buscador de la Vidriera */}
      <section className="bg-gradient-to-r from-[#004d40] via-[#00695c] to-[#004d40] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block bg-[#80cbc4]/20 text-[#80cbc4] border border-[#80cbc4]/40 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
            Catálogo Online de Propiedades
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Encontrá tu próximo hogar o inversión
          </h1>
          <p className="text-sm text-slate-200 max-w-xl mx-auto">
            Propiedades verificadas en alquiler permanente, temporario y venta directa en Mar del Plata y 9 de Julio.
          </p>

          {/* Filtros Rápidos */}
          <div className="bg-white p-3 rounded-2xl shadow-xl max-w-2xl mx-auto text-slate-800 flex flex-col sm:flex-row gap-2 items-center mt-6">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por barrio, calle o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto">
              <button
                onClick={() => setFiltroOperacion("todos")}
                className={cn(
                  "px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                  filtroOperacion === "todos"
                    ? "bg-[#004d40] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroOperacion("alquiler")}
                className={cn(
                  "px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                  filtroOperacion === "alquiler"
                    ? "bg-[#004d40] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Alquiler
              </button>
              <button
                onClick={() => setFiltroOperacion("venta")}
                className={cn(
                  "px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                  filtroOperacion === "venta"
                    ? "bg-[#004d40] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Venta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grilla Pública de Propiedades */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Propiedades Publicadas ({propiedadesFiltradas.length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">Actualizado hoy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propiedadesFiltradas.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Imagen con Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={prop.imagen}
                    alt={prop.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs",
                        prop.operacion === "alquiler"
                          ? "bg-[#004d40]"
                          : prop.operacion === "venta"
                          ? "bg-blue-600"
                          : "bg-amber-600"
                      )}
                    >
                      {prop.operacion === "alquiler"
                        ? "En Alquiler"
                        : prop.operacion === "venta"
                        ? "En Venta"
                        : "Alquiler Temporario"}
                    </span>
                    {prop.destacada && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                        Destacada
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido de la Propiedad */}
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-black font-mono tabular-nums text-slate-900">
                      {formatCurrency(prop.precio, prop.moneda)}
                      {prop.operacion === "alquiler" && <span className="text-xs font-normal text-slate-500 ml-1">/ mes</span>}
                      {prop.operacion === "temporal" && <span className="text-xs font-normal text-slate-500 ml-1">/ noche</span>}
                    </div>
                    {prop.expensas && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Exp. {formatCurrency(prop.expensas, "ARS")}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#004d40] transition-colors">
                    {prop.titulo}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#26a69a]" />
                    <span className="truncate">{prop.direccion}, {prop.localidad}</span>
                  </p>

                  {/* Atributos / Características */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.dormitorios} Dorm.</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.banios} Baño(s)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.superficie} m²</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de Contacto Rápido WhatsApp */}
              <div className="p-4 pt-0">
                <a
                  href={`https://wa.me/5492235123456?text=Hola,%20estoy%20interesado%20en%20la%20propiedad:%20${encodeURIComponent(prop.titulo)}%20(${prop.direccion})`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[#004d40] bg-[#e0f2f1] hover:bg-[#b2dfdb] rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#004d40]" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Público */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Deus Inmobiliaria. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1 font-mono text-[11px]">
            <span>Powered by</span>
            <strong className="text-slate-800">DeusX Inmobiliarias</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
