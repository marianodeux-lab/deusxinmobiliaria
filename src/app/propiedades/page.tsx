import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Building, Plus, Search, MapPin, Users, Home, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MOCK_PROPIEDADES = [
  {
    id: "prop-1",
    direccion: "Sarmiento 2751",
    piso_dpto: "Dpto 3B",
    localidad: "Mar del Plata",
    tipo: "Departamento",
    destino: "Vivienda",
    ambientes: 2,
    propietarios: [{ nombre: "STIGLICH, MARIA PAULA", porcentaje: 100 }],
    estado: "Alquilado (Carpeta #3)",
  },
  {
    id: "prop-2",
    direccion: "Mitre 1419",
    piso_dpto: "Edificio Lauquen, 5B",
    uf: "UF 077-045141-8",
    localidad: "Mar del Plata",
    tipo: "Departamento",
    destino: "Vivienda",
    ambientes: 3,
    propietarios: [{ nombre: "FUREGA, LUIS ALBERTO", porcentaje: 100 }],
    estado: "Alquilado (Carpeta #4)",
  },
  {
    id: "prop-3",
    direccion: "La Rioja 885",
    piso_dpto: "1° PB",
    uf: "UF 077-31948",
    localidad: "Mar del Plata",
    tipo: "Departamento",
    destino: "Vivienda",
    ambientes: 2,
    propietarios: [
      { nombre: "DI MARCO, CARLOS", porcentaje: 50 },
      { nombre: "DI MARCO, PABLO", porcentaje: 50 },
    ],
    estado: "Alquilado (Carpeta #5)",
  },
  {
    id: "prop-4",
    direccion: "Edison 441",
    piso_dpto: "Dpto 6",
    localidad: "Mar del Plata",
    tipo: "Departamento",
    destino: "Vivienda",
    ambientes: 1,
    propietarios: [{ nombre: "BRANCE, HECTOR HORACIO", porcentaje: 100 }],
    estado: "Alquilado (Carpeta #6)",
  },
  {
    id: "prop-5",
    direccion: "Hidalgo 352",
    piso_dpto: "Dpto 6B",
    localidad: "Mar del Plata",
    tipo: "Departamento",
    destino: "Alquiler Temporario",
    ambientes: 3,
    propietarios: [{ nombre: "STIGLICH, MARIA PAULA", porcentaje: 100 }],
    estado: "Alquilado (Carpeta #8)",
  },
];

export default function PropiedadesPage() {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar />

        <main className="flex-1 p-5 space-y-4 max-w-[1600px] w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building className="w-5 h-5 text-[#26a69a]" />
                Catálogo de Propiedades e Inmuebles
              </h1>
              <p className="text-xs text-slate-500">
                Inventario de unidades administradas, co-titulares y estados de ocupación
              </p>
            </div>

            <Link
              href="/propiedades/nueva"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Propiedad</span>
            </Link>
          </div>

          {/* Grilla de Inmuebles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_PROPIEDADES.map((prop) => (
              <div
                key={prop.id}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-[#80cbc4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#004d40] bg-[#e0f2f1] px-2 py-0.5 rounded uppercase">
                      {prop.tipo} • {prop.destino}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {prop.estado}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {prop.direccion}
                      {prop.piso_dpto && (
                        <span className="text-slate-500 font-normal ml-1">({prop.piso_dpto})</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#26a69a]" />
                      <span>{prop.localidad}</span>
                      {prop.uf && <span className="font-mono text-[11px]">• {prop.uf}</span>}
                    </p>
                  </div>

                  {/* Co-titulares */}
                  <div className="border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      PROPIETARIO(S):
                    </span>
                    <div className="space-y-1">
                      {prop.propietarios.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
                          <span className="truncate">{p.nombre}</span>
                          <span className="font-mono font-bold text-[#004d40]">{p.porcentaje}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{prop.ambientes} Ambientes</span>
                  <Link
                    href="/contratos/nuevo"
                    className="text-[#004d40] hover:text-[#002d25] font-semibold flex items-center gap-1"
                  >
                    <span>Asociar Contrato</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
