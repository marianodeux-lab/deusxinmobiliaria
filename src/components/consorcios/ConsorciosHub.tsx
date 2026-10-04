"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  User,
  Building,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  MessageCircle,
  Eye,
  X,
  FileText,
  Layers,
  ListFilter,
  ShieldCheck,
  AlertTriangle,
  FolderKanban,
  Edit,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConsorcioItem,
  ExpensaItem,
  ConsorciosKpis,
  actualizarExpensaPeriodoAction,
  marcarExpensaCobradaAction,
} from "@/modules/consorcios/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

interface ConsorciosHubProps {
  initialConsorcios: ConsorcioItem[];
  initialExpensas: ExpensaItem[];
  initialKpis: ConsorciosKpis;
}

export function ConsorciosHub({
  initialConsorcios,
  initialExpensas,
  initialKpis,
}: ConsorciosHubProps) {
  const [consorcios, setConsorcios] = useState<ConsorcioItem[]>(initialConsorcios);
  const [expensas, setExpensas] = useState<ExpensaItem[]>(initialExpensas);
  const [kpis, setKpis] = useState<ConsorciosKpis>(initialKpis);

  const [activeTab, setActiveTab] = useState<"expensas" | "consorcios" | "normativa">("expensas");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConsorcio, setFilterConsorcio] = useState<string>("todos");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const [selectedExpensa, setSelectedExpensa] = useState<ExpensaItem | null>(null);
  const [editingExpensa, setEditingExpensa] = useState<ExpensaItem | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filtrado de expensas
  const filteredExpensas = useMemo(() => {
    return expensas.filter((exp) => {
      if (filterConsorcio !== "todos" && exp.consorcio_nombre !== filterConsorcio) return false;
      if (filterEstado !== "todos" && exp.estado_pago !== filterEstado) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDir = exp.direccion_inmueble.toLowerCase().includes(q);
        const matchInq = exp.inquilino_nombre?.toLowerCase().includes(q);
        const matchCons = exp.consorcio_nombre.toLowerCase().includes(q);
        const matchCarpeta = exp.carpeta_numero.toLowerCase().includes(q);
        return matchDir || matchInq || matchCons || matchCarpeta;
      }
      return true;
    });
  }, [expensas, filterConsorcio, filterEstado, searchQuery]);

  // Manejar marcar cobrada
  const handleMarcarCobrada = async (periodoId: string) => {
    setIsUpdating(periodoId);
    try {
      const res = await marcarExpensaCobradaAction(periodoId);
      if (res.success) {
        setExpensas((prev) =>
          prev.map((e) => (e.id === periodoId ? { ...e, estado_pago: "cobrado" } : e))
        );
        if (selectedExpensa && selectedExpensa.id === periodoId) {
          setSelectedExpensa((prev) => (prev ? { ...prev, estado_pago: "cobrado" } : null));
        }
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-teal-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-[#004d40]">
              <Building2 className="w-6 h-6 text-[#004d40]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Consorcios & Liquidación de Expensas
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                  {expensas.length} Liquidaciones
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Prorrateo de gastos comunes, distinción entre expensas ordinarias y extraordinarias, y avisos de cobro por WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("expensas")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "expensas"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Liquidaciones
            </button>
            <button
              onClick={() => setActiveTab("consorcios")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "consorcios"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Building className="w-3.5 h-3.5" />
              Edificios ({consorcios.length})
            </button>
            <button
              onClick={() => setActiveTab("normativa")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "normativa"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Info className="w-3.5 h-3.5" />
              Guía Legal
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#262832] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Edificios / Consorcios</span>
            <div className="w-7 h-7 rounded-lg bg-[#141519] border border-[#262832] flex items-center justify-center text-[#34D399]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {kpis.totalConsorcios}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            {kpis.unidadesAdministradas} unidades funcionales
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#10B981]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0]">Total Expensas Mes</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#34D399] mt-2 font-mono">
            ${kpis.totalExpensasMes.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            Total emitido para el período
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-purple-500/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-200">Ordinarias (Inquilinos)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-300 mt-2 font-mono">
            ${kpis.ordinariasInquilinos.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Gastos habituales y servicios
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200">Extraordinarias (Dueños)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-300">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-300 mt-2 font-mono">
            ${kpis.extraordinariasPropietarios.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Fondo de reserva y mejoras
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#2DD4BF]/30 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#99F6E4]">Cobranza de Expensas</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2DD4BF] mt-2 font-mono">
            {kpis.tasaCobranzaExpensas}%
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Efectividad de recaudación
          </div>
        </div>
      </div>

      {/* VISTA 1: LIQUIDACIONES DE EXPENSAS */}
      {activeTab === "expensas" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-[#1C1D23] p-3.5 rounded-xl border border-[#262832] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por inmueble, inquilino, consorcio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filtro Consorcio */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Edificio:</span>
                <select
                  value={filterConsorcio}
                  onChange={(e) => setFilterConsorcio(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-1"
                >
                  <option value="todos">Todos los Edificios</option>
                  {consorcios.map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Estado:</span>
                {["todos", "pendiente", "cobrado", "vencido"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterEstado(st)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors",
                      filterEstado === st
                        ? "bg-[#004d40] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de Expensas */}
          <div className="bg-[#1C1D23] rounded-xl border border-[#262832] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#101115] border-b border-[#262832] text-[11px] font-bold text-slate-100 uppercase tracking-wider">
                    <th className="py-3 px-4">Inmueble / Consorcio</th>
                    <th className="py-3 px-4">Carpeta & Inquilino</th>
                    <th className="py-3 px-4">Ordinarias (Inquilino)</th>
                    <th className="py-3 px-4">Extraordinarias (Dueño)</th>
                    <th className="py-3 px-4">Total Expensas</th>
                    <th className="py-3 px-4">1º Vto</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredExpensas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron liquidaciones de expensas con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredExpensas.map((exp) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                        onClick={() => setSelectedExpensa(exp)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 text-xs group-hover:text-[#004d40]">
                            {exp.direccion_inmueble}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {exp.consorcio_nombre}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{exp.inquilino_nombre}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                            <FolderKanban className="w-3 h-3" />
                            Carpeta #{exp.carpeta_numero}
                            {exp.inquilino_telefono && (
                              <a
                                href={buildWhatsAppLink(
                                  exp.inquilino_telefono,
                                  `Hola ${exp.inquilino_nombre}, te enviamos el aviso de expensas de ${exp.direccion_inmueble} ($${exp.monto_ordinarias.toLocaleString("es-AR")}). Vencimiento: ${exp.fecha_vencimiento_1}.`
                                )}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ml-1"
                                title="Enviar Aviso por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                          ${exp.monto_ordinarias.toLocaleString("es-AR")}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-amber-700">
                          ${exp.monto_extraordinarias.toLocaleString("es-AR")}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-black text-slate-800">
                          ${exp.total_expensas.toLocaleString("es-AR")}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {exp.fecha_vencimiento_1}
                        </td>

                        <td className="py-3.5 px-4">
                          <EstadoPagoBadge estado={exp.estado_pago} />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingExpensa(exp);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-[#004d40] hover:bg-teal-50"
                              title="Modificar montos de expensas"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExpensa(exp);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-md transition-colors"
                            >
                              Liquidación
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: EDIFICIOS & CONSORCIOS */}
      {activeTab === "consorcios" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consorcios.map((c) => (
            <div
              key={c.id}
              className="bg-[#1C1D23] rounded-xl border border-[#262832] shadow-sm p-5 space-y-4 hover:border-[#10B981]/50 transition-all"
            >
              <div className="flex items-center justify-between border-b border-[#262832] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{c.nombre}</h3>
                    <p className="text-xs text-slate-300 font-medium">
                      {c.direccion} · {c.localidad}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00382E] text-[#34D399] border border-[#10B981]/40">
                  {c.unidades_count} Unidades
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#141519] border border-[#262832]">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">
                    Administración
                  </span>
                  <span className="font-bold text-white block mt-0.5">{c.administrador}</span>
                  {c.telefono_admin && (
                    <span className="text-[11px] text-slate-300 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {c.telefono_admin}
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-[#141519] border border-[#262832]">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">
                    Cuenta Pago Expensas
                  </span>
                  <span className="font-bold text-white block mt-0.5">{c.banco}</span>
                  <span className="text-[11px] font-mono text-[#34D399] font-bold mt-1 block">
                    Alias: {c.cbu_alias}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-200 uppercase block mb-1.5">
                  Unidades Funcionales Vinculadas
                </span>
                <div className="space-y-1">
                  {c.propiedades_vinculadas.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#141519] rounded border border-[#262832]"
                    >
                      <span className="font-medium text-slate-200">{p.direccion}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {p.unidad_funcional || "U.F."} ({p.piso_dpto || "P.B."})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA 3: GUÍA LEGAL & NORMATIVA */}
      {activeTab === "normativa" && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#004d40]" />
              Criterio Legal de Imputación de Expensas en Argentina
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Marco legal bajo el Código Civil y Comercial de la Nación y Ley de Locaciones Urbanas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h4 className="font-bold text-sm text-purple-900">
                  Expensas Ordinarias (A cargo del Inquilino)
                </h4>
              </div>
              <p className="text-xs text-purple-800/90 leading-relaxed">
                Son aquellos gastos habituales derivados del uso cotidiano y mantenimiento corriente del inmueble:
              </p>
              <ul className="text-xs text-purple-900 list-disc pl-5 space-y-1">
                <li>Sueldo y cargas sociales del encargado del edificio.</li>
                <li>Luz de espacios comunes, bombas de agua y fuerza motriz.</li>
                <li>Mantenimiento habitual de ascensores y matafuegos.</li>
                <li>Artículos de limpieza y desinfección de áreas comunes.</li>
              </ul>
              <div className="pt-2 text-[11px] font-bold text-purple-700">
                Se suman automáticamente al recibo mensual de cobro al inquilino.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h4 className="font-bold text-sm text-amber-900">
                  Expensas Extraordinarias (A cargo del Propietario)
                </h4>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Son gastos estructurales o imprevistos que incrementan el valor patrimonial del edificio:
              </p>
              <ul className="text-xs text-amber-900 list-disc pl-5 space-y-1">
                <li>Pintura general de fachadas, medianeras y hall principal.</li>
                <li>Reparación o cambio total de calderas o cañerías maestras.</li>
                <li>Integración del Fondo de Reserva o fondos especiales.</li>
                <li>Indemnizaciones laborales por despido de personal.</li>
              </ul>
              <div className="pt-2 text-[11px] font-bold text-amber-700">
                No corresponden al inquilino. Se rinden y deducen en la liquidación del propietario.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE / LIQUIDACIÓN DE EXPENSAS */}
      {selectedExpensa && (
        <DetalleExpensaModal
          expensa={selectedExpensa}
          onClose={() => setSelectedExpensa(null)}
          onMarcarCobrada={handleMarcarCobrada}
          isUpdating={isUpdating}
        />
      )}

      {/* MODAL EDITAR MONTOS DE EXPENSA */}
      {editingExpensa && (
        <EditarExpensaModal
          expensa={editingExpensa}
          onClose={() => setEditingExpensa(null)}
          onSaved={(ordinarias, extraordinarias) => {
            setExpensas((prev) =>
              prev.map((e) =>
                e.id === editingExpensa.id
                  ? {
                      ...e,
                      monto_ordinarias: ordinarias,
                      monto_extraordinarias: extraordinarias,
                      total_expensas: ordinarias + extraordinarias,
                    }
                  : e
              )
            );
            setEditingExpensa(null);
          }}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENTES AUXILIARES
// -----------------------------------------------------------------------------

function EstadoPagoBadge({ estado }: { estado: string }) {
  switch (estado) {
    case "cobrado":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          Abonada
        </span>
      );
    case "vencido":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
          Vencida
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
          Pendiente
        </span>
      );
  }
}

function DetalleExpensaModal({
  expensa,
  onClose,
  onMarcarCobrada,
  isUpdating,
}: {
  expensa: ExpensaItem;
  onClose: () => void;
  onMarcarCobrada: (periodoId: string) => Promise<void>;
  isUpdating: string | null;
}) {
  const whatsappAvisoText = `*LIQUIDACIÓN DE EXPENSAS - ${expensa.consorcio_nombre.toUpperCase()}*
---------------------------------------
Inmueble: ${expensa.direccion_inmueble}
Período: ${expensa.periodo_mes}/${expensa.periodo_anio}
---------------------------------------
Expensas Ordinarias: $${expensa.monto_ordinarias.toLocaleString("es-AR")} (a cargo inquilino)
Expensas Extraordinarias: $${expensa.monto_extraordinarias.toLocaleString("es-AR")} (a cargo propietario)
Total a abonar: $${expensa.monto_ordinarias.toLocaleString("es-AR")}
1er Vencimiento: ${expensa.fecha_vencimiento_1}
---------------------------------------
Podés abonarlo junto con el alquiler o transferir a la administración. DeusX Inmobiliaria.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E0F2F1] text-[#004d40]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800">
                  Liquidación de Expensas
                </h3>
                <EstadoPagoBadge estado={expensa.estado_pago} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {expensa.consorcio_nombre} · {expensa.direccion_inmueble}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Inquilino Asignado
              </span>
              <span className="text-sm font-extrabold text-slate-800 block">
                {expensa.inquilino_nombre}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Carpeta #{expensa.carpeta_numero}
              </span>
            </div>

            {expensa.inquilino_telefono && (
              <a
                href={buildWhatsAppLink(expensa.inquilino_telefono, whatsappAvisoText)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Aviso
              </a>
            )}
          </div>

          <div className="space-y-2 border-t border-b border-slate-100 py-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Expensas Ordinarias:</span>
              <span className="font-mono font-bold text-purple-700 text-sm">
                ${expensa.monto_ordinarias.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">
                Expensas Extraordinarias (Fondo Reserva):
              </span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                ${expensa.monto_extraordinarias.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="font-extrabold text-slate-800">Total Liquidado:</span>
              <span className="font-mono font-black text-slate-900 text-base">
                ${expensa.total_expensas.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                1er Vencimiento
              </span>
              <span className="font-bold font-mono text-slate-800 block mt-0.5">
                {expensa.fecha_vencimiento_1}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                2do Vencimiento (Recargo)
              </span>
              <span className="font-bold font-mono text-slate-800 block mt-0.5">
                {expensa.fecha_vencimiento_2 || "Sin recargo"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {expensa.estado_pago !== "cobrado" && (
              <button
                disabled={isUpdating === expensa.periodo_id}
                onClick={() => onMarcarCobrada(expensa.periodo_id)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white transition-colors disabled:opacity-50"
              >
                {isUpdating === expensa.periodo_id ? "Guardando..." : "Marcar como Abonada"}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function EditarExpensaModal({
  expensa,
  onClose,
  onSaved,
}: {
  expensa: ExpensaItem;
  onClose: () => void;
  onSaved: (ordinarias: number, extraordinarias: number) => void;
}) {
  const [ordinarias, setOrdinarias] = useState<number>(expensa.monto_ordinarias);
  const [extraordinarias, setExtraordinarias] = useState<number>(expensa.monto_extraordinarias);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await actualizarExpensaPeriodoAction(
        expensa.periodo_id,
        Number(ordinarias),
        Number(extraordinarias)
      );
      if (res.success) {
        onSaved(Number(ordinarias), Number(extraordinarias));
      } else {
        alert("Error al actualizar: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Modificar Expensas del Período
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {expensa.direccion_inmueble}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">
              Expensas Ordinarias (ARS) - Inquilino
            </label>
            <input
              type="number"
              value={ordinarias}
              onChange={(e) => setOrdinarias(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              Expensas Extraordinarias (ARS) - Propietario
            </label>
            <input
              type="number"
              value={extraordinarias}
              onChange={(e) => setExtraordinarias(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar Expensas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
