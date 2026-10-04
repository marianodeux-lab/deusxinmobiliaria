"use client";

import React, { useState, useMemo } from "react";
import {
  Wrench,
  Search,
  Plus,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Building,
  FolderKanban,
  User,
  Filter,
  Layers,
  ListFilter,
  MessageCircle,
  Eye,
  ChevronRight,
  ArrowRight,
  X,
  FileText,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TicketMantenimientoItem,
  MantenimientoKpis,
  cambiarEstadoTicketAction,
  crearTicketAction,
  actualizarTicketAction,
  CrearTicketInput,
} from "@/modules/mantenimiento/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

interface MantenimientoHubProps {
  initialItems: TicketMantenimientoItem[];
  initialKpis: MantenimientoKpis;
  propiedadesList: Array<{ id: string; direccion: string }>;
  proveedoresList: Array<{ id: string; nombre: string; telefono?: string }>;
  contratosList: Array<{ id: string; carpeta_numero: string; propiedad_id: string }>;
}

export function MantenimientoHub({
  initialItems,
  initialKpis,
  propiedadesList,
  proveedoresList,
  contratosList,
}: MantenimientoHubProps) {
  const [items, setItems] = useState<TicketMantenimientoItem[]>(initialItems);
  const [kpis, setKpis] = useState<MantenimientoKpis>(initialKpis);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterImputacion, setFilterImputacion] = useState<string>("todas");
  const [viewMode, setViewMode] = useState<"kanban" | "tabla">("kanban");

  const [selectedTicket, setSelectedTicket] = useState<TicketMantenimientoItem | null>(null);
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Filtrado de incidencias
  const filteredItems = useMemo(() => {
    return items.filter((ticket) => {
      // Filtro por Estado
      if (filterEstado !== "todos" && ticket.estado !== filterEstado) return false;

      // Filtro por Imputación
      if (filterImputacion !== "todas" && ticket.imputacion_gasto !== filterImputacion) return false;

      // Filtro por Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitulo = ticket.titulo.toLowerCase().includes(q);
        const matchDesc = ticket.descripcion.toLowerCase().includes(q);
        const matchDir = ticket.direccion_inmueble.toLowerCase().includes(q);
        const matchCarpeta = ticket.carpeta_numero?.toLowerCase().includes(q);
        const matchProv = ticket.proveedor_nombre?.toLowerCase().includes(q);
        return matchTitulo || matchDesc || matchDir || matchCarpeta || matchProv;
      }

      return true;
    });
  }, [items, filterEstado, filterImputacion, searchQuery]);

  // Manejar cambio rápido de estado
  const handleCambiarEstado = async (
    ticketId: string,
    nuevoEstado: "abierto" | "presupuestado" | "en_curso" | "completado" | "cancelado"
  ) => {
    setIsUpdatingStatus(ticketId);
    try {
      const res = await cambiarEstadoTicketAction(ticketId, nuevoEstado);
      if (res.success) {
        setItems((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, estado: nuevoEstado } : t))
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
        }
      } else {
        alert("Error al cambiar estado: " + res.error);
      }
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-teal-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-[#004d40]">
              <Wrench className="w-6 h-6 text-[#004d40]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Mantenimiento & Ordenes de Servicio
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                  {items.length} Incidencias
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Gestión operativa de reparaciones técnicas, asignación de gremios e imputación en liquidaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Kanban / Tabla */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === "kanban"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Tablero Kanban
            </button>
            <button
              onClick={() => setViewMode("tabla")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === "tabla"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Lista Detallada
            </button>
          </div>

          <button
            onClick={() => setIsCrearModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            Nueva Incidencia
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tickets Activos</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#004d40]">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2 font-mono">
            {kpis.abiertos + kpis.enCurso}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {kpis.abiertos} por iniciar · {kpis.enCurso} en curso
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">En Reparación</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2 font-mono">
            {kpis.enCurso}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">
            Con técnico asignado
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Urgencias Críticas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2 font-mono">
            {kpis.urgentes}
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5">
            Requieren atención prioritaria
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Costo Operativo Total</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 mt-2 font-mono">
            ${kpis.costoTotalMes.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Presupuestado y ejecutado
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Retención Propietarios</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700 mt-2 font-mono">
            ${kpis.deduciblesPropietario.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            A descontar en rendición
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & BÚSQUEDA */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por avería, dirección, técnico o carpeta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro Estado */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Estado:</span>
            {["todos", "abierto", "presupuestado", "en_curso", "completado"].map((st) => (
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
                {st === "en_curso" ? "En curso" : st}
              </button>
            ))}
          </div>

          {/* Filtro Imputación */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Imputación:</span>
            <select
              value={filterImputacion}
              onChange={(e) => setFilterImputacion(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-1"
            >
              <option value="todas">Todas</option>
              <option value="propietario">Propietario (Deduce)</option>
              <option value="inquilino">Inquilino (Suma)</option>
              <option value="inmobiliaria">Inmobiliaria</option>
              <option value="compartido">Compartido 50/50</option>
            </select>
          </div>
        </div>
      </div>

      {/* VISTA 1: TABLERO KANBAN */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Columna: Abierto */}
          <KanbanColumn
            title="Abiertos / Reportados"
            count={filteredItems.filter((i) => i.estado === "abierto").length}
            variant="slate"
            items={filteredItems.filter((i) => i.estado === "abierto")}
            onSelectTicket={setSelectedTicket}
            onCambiarEstado={handleCambiarEstado}
            isUpdatingStatus={isUpdatingStatus}
            nextAction={{ label: "Presupuestar", nextState: "presupuestado" }}
          />

          {/* Columna: Presupuestado */}
          <KanbanColumn
            title="Presupuestados"
            count={filteredItems.filter((i) => i.estado === "presupuestado").length}
            variant="amber"
            items={filteredItems.filter((i) => i.estado === "presupuestado")}
            onSelectTicket={setSelectedTicket}
            onCambiarEstado={handleCambiarEstado}
            isUpdatingStatus={isUpdatingStatus}
            nextAction={{ label: "Iniciar Reparación", nextState: "en_curso" }}
          />

          {/* Columna: En Curso */}
          <KanbanColumn
            title="En Curso / Trabajo"
            count={filteredItems.filter((i) => i.estado === "en_curso").length}
            variant="blue"
            items={filteredItems.filter((i) => i.estado === "en_curso")}
            onSelectTicket={setSelectedTicket}
            onCambiarEstado={handleCambiarEstado}
            isUpdatingStatus={isUpdatingStatus}
            nextAction={{ label: "Finalizar Obra", nextState: "completado" }}
          />

          {/* Columna: Completado */}
          <KanbanColumn
            title="Completados / Auditados"
            count={filteredItems.filter((i) => i.estado === "completado").length}
            variant="teal"
            items={filteredItems.filter((i) => i.estado === "completado")}
            onSelectTicket={setSelectedTicket}
            onCambiarEstado={handleCambiarEstado}
            isUpdatingStatus={isUpdatingStatus}
          />
        </div>
      ) : (
        /* VISTA 2: TABLA DETALLADA */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Prioridad / Título</th>
                  <th className="py-3 px-4">Inmueble / Carpeta</th>
                  <th className="py-3 px-4">Técnico Asignado</th>
                  <th className="py-3 px-4">Costo Estimado</th>
                  <th className="py-3 px-4">Imputación</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No se encontraron órdenes de mantenimiento con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <PriorityBadge prioridad={ticket.prioridad} />
                          <div>
                            <span className="font-bold text-slate-800 block text-xs group-hover:text-[#004d40]">
                              {ticket.titulo}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {ticket.descripcion}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{ticket.direccion_inmueble}</span>
                        </div>
                        {ticket.carpeta_numero && (
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <FolderKanban className="w-3 h-3" />
                            Carpeta #{ticket.carpeta_numero}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {ticket.proveedor_nombre}
                          </span>
                          {ticket.proveedor_telefono && (
                            <a
                              href={buildWhatsAppLink(
                                ticket.proveedor_telefono,
                                `Hola ${ticket.proveedor_nombre}, te consulto sobre la reparación "${ticket.titulo}" en ${ticket.direccion_inmueble}.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Contactar Técnico por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        ${ticket.costo_total.toLocaleString("es-AR")}
                      </td>

                      <td className="py-3.5 px-4">
                        <ImputacionBadge imputacion={ticket.imputacion_gasto} />
                      </td>

                      <td className="py-3.5 px-4">
                        <EstadoBadge estado={ticket.estado} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-md transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLE / DRAWER */}
      {selectedTicket && (
        <DetalleTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onCambiarEstado={handleCambiarEstado}
          onGuardarEdicion={async (ticketId, data) => {
            const res = await actualizarTicketAction(ticketId, data);
            if (res.success) {
              setItems((prev) =>
                prev.map((t) => (t.id === ticketId ? { ...t, ...data } : t))
              );
              setSelectedTicket((prev) => (prev ? { ...prev, ...data } : null));
            } else {
              alert("Error: " + res.error);
            }
          }}
          proveedoresList={proveedoresList}
        />
      )}

      {/* MODAL NUEVA INCIDENCIA */}
      {isCrearModalOpen && (
        <NuevaIncidenciaModal
          isOpen={isCrearModalOpen}
          onClose={() => setIsCrearModalOpen(false)}
          propiedadesList={propiedadesList}
          proveedoresList={proveedoresList}
          contratosList={contratosList}
          onCreated={() => {
            setIsCrearModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENTES AUXILIARES DEL HUB
// -----------------------------------------------------------------------------

function KanbanColumn({
  title,
  count,
  variant,
  items,
  onSelectTicket,
  onCambiarEstado,
  isUpdatingStatus,
  nextAction,
}: {
  title: string;
  count: number;
  variant: "slate" | "amber" | "blue" | "teal";
  items: TicketMantenimientoItem[];
  onSelectTicket: (t: TicketMantenimientoItem) => void;
  onCambiarEstado: (id: string, st: any) => void;
  isUpdatingStatus: string | null;
  nextAction?: { label: string; nextState: any };
}) {
  const borderHeader = {
    slate: "border-slate-300 bg-slate-100/70 text-slate-800",
    amber: "border-amber-300 bg-amber-50/70 text-amber-900",
    blue: "border-blue-300 bg-blue-50/70 text-blue-900",
    teal: "border-[#80CBC4] bg-[#E0F2F1]/70 text-[#004d40]",
  }[variant];

  return (
    <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-3 flex flex-col gap-3 min-h-[480px]">
      <div
        className={cn(
          "px-3 py-2 rounded-lg border flex items-center justify-between font-bold text-xs",
          borderHeader
        )}
      >
        <span>{title}</span>
        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-mono shadow-2xs">
          {count}
        </span>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
        {items.length === 0 ? (
          <div className="h-32 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
            Sin incidentes aquí
          </div>
        ) : (
          items.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:border-teal-300 space-y-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <PriorityBadge prioridad={ticket.prioridad} />
                <span className="font-mono font-bold text-xs text-slate-700">
                  ${ticket.costo_total.toLocaleString("es-AR")}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-[#004d40]">
                  {ticket.titulo}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {ticket.descripcion}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{ticket.direccion_inmueble}</span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-slate-500">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[120px] font-medium text-slate-700">
                      {ticket.proveedor_nombre}
                    </span>
                  </div>

                  {ticket.proveedor_telefono && (
                    <a
                      href={buildWhatsAppLink(
                        ticket.proveedor_telefono,
                        `Hola ${ticket.proveedor_nombre}, consulta sobre ticket "${ticket.titulo}".`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="WhatsApp al técnico"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <ImputacionBadge imputacion={ticket.imputacion_gasto} />

                {nextAction && (
                  <button
                    disabled={isUpdatingStatus === ticket.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCambiarEstado(ticket.id, nextAction.nextState);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#004d40] hover:text-[#002e26] bg-[#E0F2F1] hover:bg-[#B2DFDB] px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {isUpdatingStatus === ticket.id ? "Guardando..." : nextAction.label}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ prioridad }: { prioridad: string }) {
  switch (prioridad) {
    case "urgente":
      return (
        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-2.5 h-2.5" /> Urgente
        </span>
      );
    case "alta":
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Alta
        </span>
      );
    case "media":
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-teal-100 text-teal-800 border border-teal-200">
          Media
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Baja
        </span>
      );
  }
}

function ImputacionBadge({ imputacion }: { imputacion: string }) {
  switch (imputacion) {
    case "propietario":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Deduce Dueño
        </span>
      );
    case "inquilino":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Cobra Inquilino
        </span>
      );
    case "compartido":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          50% Compartido
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Inmobiliaria
        </span>
      );
  }
}

function EstadoBadge({ estado }: { estado: string }) {
  switch (estado) {
    case "abierto":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">
          Abierto
        </span>
      );
    case "presupuestado":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
          Presupuestado
        </span>
      );
    case "en_curso":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300">
          En Curso
        </span>
      );
    case "completado":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          Completado
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
          Cancelado
        </span>
      );
  }
}

// -----------------------------------------------------------------------------
// MODAL DETALLE & EDICIÓN DE TICKET
// -----------------------------------------------------------------------------

function DetalleTicketModal({
  ticket,
  onClose,
  onCambiarEstado,
  onGuardarEdicion,
  proveedoresList,
}: {
  ticket: TicketMantenimientoItem;
  onClose: () => void;
  onCambiarEstado: (id: string, st: any) => Promise<void>;
  onGuardarEdicion: (id: string, data: any) => Promise<void>;
  proveedoresList: Array<{ id: string; nombre: string; telefono?: string }>;
}) {
  const [costo, setCosto] = useState<number>(ticket.costo_total);
  const [imputacion, setImputacion] = useState(ticket.imputacion_gasto);
  const [prioridad, setPrioridad] = useState(ticket.prioridad);
  const [proveedorId, setProveedorId] = useState(ticket.proveedor_id || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onGuardarEdicion(ticket.id, {
        costo_total: Number(costo),
        imputacion_gasto: imputacion,
        prioridad: prioridad,
        proveedor_id: proveedorId || undefined,
      });
      alert("Cambios guardados con éxito.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E0F2F1] text-[#004d40]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800">
                  Orden de Trabajo #{ticket.id.slice(0, 8)}
                </h3>
                <EstadoBadge estado={ticket.estado} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {ticket.direccion_inmueble}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Descripción de la Avería
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800">
              {ticket.descripcion}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Costo Total (ARS)
              </label>
              <input
                type="number"
                value={costo}
                onChange={(e) => setCosto(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Imputación Financiera
              </label>
              <select
                value={imputacion}
                onChange={(e) => setImputacion(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="propietario">Deduce al Propietario en Rendición</option>
                <option value="inquilino">Suma en Cobranza al Inquilino</option>
                <option value="inmobiliaria">Asume Inmobiliaria (Gasto Operativo)</option>
                <option value="compartido">Compartido 50% y 50%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Técnico / Proveedor Asignado
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="">-- Sin Asignar --</option>
                {proveedoresList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.telefono ? `(${p.telefono})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Prioridad Operativa
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente (Crítica)</option>
              </select>
            </div>
          </div>

          {/* CONTACTOS RELACIONADOS & WHATSAPP DIRECTO */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-3">
            <span className="text-[11px] font-extrabold text-[#004d40] uppercase tracking-wide block">
              Contactos Directos de la Operación
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ticket.inquilino_nombre && (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">INQUILINO</span>
                    <span className="font-bold text-slate-800">{ticket.inquilino_nombre}</span>
                  </div>
                  {ticket.inquilino_telefono && (
                    <a
                      href={buildWhatsAppLink(
                        ticket.inquilino_telefono,
                        `Hola ${ticket.inquilino_nombre}, te contactamos de la inmobiliaria por la reparación de "${ticket.titulo}".`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              )}

              {ticket.propietario_nombre && (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">PROPIETARIO</span>
                    <span className="font-bold text-slate-800">{ticket.propietario_nombre}</span>
                  </div>
                  {ticket.propietario_telefono && (
                    <a
                      href={buildWhatsAppLink(
                        ticket.propietario_telefono,
                        `Hola ${ticket.propietario_nombre}, le informamos sobre la reparación "${ticket.titulo}" en su propiedad (${ticket.direccion_inmueble}). Presupuesto: $${ticket.costo_total.toLocaleString("es-AR")}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* TRANSICIÓN DE ESTADO */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Cambiar Estado del Ticket
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { st: "abierto", label: "Abierto" },
                { st: "presupuestado", label: "Presupuestado" },
                { st: "en_curso", label: "En Curso" },
                { st: "completado", label: "Completado" },
                { st: "cancelado", label: "Cancelado" },
              ].map(({ st, label }) => (
                <button
                  key={st}
                  onClick={() => onCambiarEstado(ticket.id, st)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    ticket.estado === st
                      ? "bg-[#004d40] text-white border-[#004d40]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white transition-colors disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL CREAR NUEVA INCIDENCIA
// -----------------------------------------------------------------------------

function NuevaIncidenciaModal({
  isOpen,
  onClose,
  propiedadesList,
  proveedoresList,
  contratosList,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  propiedadesList: Array<{ id: string; direccion: string }>;
  proveedoresList: Array<{ id: string; nombre: string; telefono?: string }>;
  contratosList: Array<{ id: string; carpeta_numero: string; propiedad_id: string }>;
  onCreated: () => void;
}) {
  const [propiedadId, setPropiedadId] = useState(propiedadesList[0]?.id || "");
  const [contratoId, setContratoId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"baja" | "media" | "alta" | "urgente">("media");
  const [costoTotal, setCostoTotal] = useState<number>(0);
  const [imputacionGasto, setImputacionGasto] = useState<
    "propietario" | "inquilino" | "inmobiliaria" | "compartido"
  >("propietario");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtrar contratos correspondientes a la propiedad seleccionada
  const contratosDisponibles = useMemo(() => {
    return contratosList.filter((c) => c.propiedad_id === propiedadId);
  }, [contratosList, propiedadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !propiedadId) {
      setErrorMsg("Por favor complete el título, la descripción y seleccione la propiedad.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await crearTicketAction({
        propiedad_id: propiedadId,
        contrato_id: contratoId || undefined,
        proveedor_id: proveedorId || undefined,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        prioridad,
        costo_total: Number(costoTotal) || 0,
        imputacion_gasto: imputacionGasto,
      });

      if (res.success) {
        onCreated();
      } else {
        setErrorMsg(res.error || "Error al crear ticket");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E0F2F1] text-[#004d40]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Registrar Nueva Incidencia / Ticket
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Alta de orden de mantenimiento técnico e imputación de gasto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              Propiedad Afectada *
            </label>
            <select
              value={propiedadId}
              onChange={(e) => {
                setPropiedadId(e.target.value);
                setContratoId("");
              }}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            >
              {propiedadesList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.direccion}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">
                Contrato / Carpeta (Opcional)
              </label>
              <select
                value={contratoId}
                onChange={(e) => setContratoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="">-- Sin Contrato Vinculado --</option>
                {contratosDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    Carpeta #{c.carpeta_numero}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">
                Técnico / Proveedor
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="">-- Asignar más tarde --</option>
                {proveedoresList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.telefono ? `(${p.telefono})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              Título Breve de la Avería *
            </label>
            <input
              type="text"
              placeholder="Ej: Pérdida de agua bajo bacha cocina"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              Descripción Detallada *
            </label>
            <textarea
              rows={3}
              placeholder="Detalle de los síntomas, quién lo reportó y qué se requiere..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Presupuesto (ARS)</label>
              <input
                type="number"
                placeholder="0.00"
                value={costoTotal || ""}
                onChange={(e) => setCostoTotal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Imputación</label>
              <select
                value={imputacionGasto}
                onChange={(e) => setImputacionGasto(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="propietario">Propietario</option>
                <option value="inquilino">Inquilino</option>
                <option value="inmobiliaria">Inmobiliaria</option>
                <option value="compartido">Compartido</option>
              </select>
            </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creando..." : "Crear Incidencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
