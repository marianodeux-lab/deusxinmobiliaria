"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Search,
  Plus,
  Phone,
  Mail,
  User,
  Building,
  Key,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  BedDouble,
  MessageCircle,
  Eye,
  X,
  FileText,
  Calendar,
  Layers,
  ListFilter,
  ShieldCheck,
  AlertCircle,
  Home,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ReservaTemporariaItem,
  TemporariosKpis,
  PropiedadTemporalOption,
  actualizarEstadoReservaAction,
  actualizarLimpiezaReservaAction,
  crearReservaTemporariaAction,
  CrearReservaTemporariaInput,
} from "@/modules/temporarios/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

interface TemporariosHubProps {
  initialItems: ReservaTemporariaItem[];
  initialKpis: TemporariosKpis;
  propiedadesTemporales: PropiedadTemporalOption[];
  todasPropiedades: PropiedadTemporalOption[];
}

export function TemporariosHub({
  initialItems,
  initialKpis,
  propiedadesTemporales,
  todasPropiedades,
}: TemporariosHubProps) {
  const [items, setItems] = useState<ReservaTemporariaItem[]>(initialItems);
  const [kpis, setKpis] = useState<TemporariosKpis>(initialKpis);

  const [activeTab, setActiveTab] = useState<"reservas" | "housekeeping" | "calendario">("reservas");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCanal, setFilterCanal] = useState<string>("todos");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const [selectedReserva, setSelectedReserva] = useState<ReservaTemporariaItem | null>(null);
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filtrado de reservas
  const filteredItems = useMemo(() => {
    return items.filter((reserva) => {
      if (filterCanal !== "todos" && reserva.canal_reserva !== filterCanal) return false;
      if (filterEstado !== "todos" && reserva.estado_reserva !== filterEstado) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHuesped = reserva.huesped_nombre.toLowerCase().includes(q);
        const matchInmueble = reserva.direccion_inmueble.toLowerCase().includes(q);
        const matchCarpeta = reserva.carpeta_numero.toLowerCase().includes(q);
        const matchEmail = reserva.huesped_email?.toLowerCase().includes(q);
        return matchHuesped || matchInmueble || matchCarpeta || matchEmail;
      }
      return true;
    });
  }, [items, filterCanal, filterEstado, searchQuery]);

  // Manejar cambio de estado de reserva
  const handleCambiarEstado = async (
    reservaId: string,
    nuevoEstado: "confirmada" | "en_estadia" | "check_out_realizado" | "cancelada"
  ) => {
    setIsUpdating(reservaId);
    try {
      const res = await actualizarEstadoReservaAction(reservaId, nuevoEstado);
      if (res.success) {
        setItems((prev) =>
          prev.map((r) =>
            r.id === reservaId
              ? {
                  ...r,
                  estado_reserva: nuevoEstado,
                  estado_limpieza:
                    nuevoEstado === "check_out_realizado" ? "sucio_check_out" : r.estado_limpieza,
                }
              : r
          )
        );
        if (selectedReserva && selectedReserva.id === reservaId) {
          setSelectedReserva((prev) =>
            prev
              ? {
                  ...prev,
                  estado_reserva: nuevoEstado,
                  estado_limpieza:
                    nuevoEstado === "check_out_realizado" ? "sucio_check_out" : prev.estado_limpieza,
                }
              : null
          );
        }
      } else {
        alert("Error al actualizar: " + res.error);
      }
    } finally {
      setIsUpdating(null);
    }
  };

  // Manejar cambio de limpieza
  const handleCambiarLimpieza = async (
    reservaId: string,
    nuevoEstadoLimpieza: "limpio" | "en_limpieza" | "sucio_check_out" | "inspeccionado"
  ) => {
    setIsUpdating(reservaId);
    try {
      const res = await actualizarLimpiezaReservaAction(reservaId, nuevoEstadoLimpieza);
      if (res.success) {
        setItems((prev) =>
          prev.map((r) =>
            r.id === reservaId ? { ...r, estado_limpieza: nuevoEstadoLimpieza } : r
          )
        );
        if (selectedReserva && selectedReserva.id === reservaId) {
          setSelectedReserva((prev) =>
            prev ? { ...prev, estado_limpieza: nuevoEstadoLimpieza } : null
          );
        }
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
              <CalendarDays className="w-6 h-6 text-[#004d40]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Alquileres Temporarios & Vacacionales
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F2F1] text-[#004d40] border border-[#80CBC4]">
                  {items.length} Reservas
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Control de check-in / check-out, sincronización de canales (Airbnb/Booking), tarifas por noche y housekeeping.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("reservas")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "reservas"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Reservas
            </button>
            <button
              onClick={() => setActiveTab("calendario")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "calendario"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Matriz Ocupación
            </button>
            <button
              onClick={() => setActiveTab("housekeeping")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === "housekeeping"
                  ? "bg-white text-[#004d40] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Housekeeping
            </button>
          </div>

          <button
            onClick={() => setIsCrearModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#262832] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unidades Temporarias</span>
            <div className="w-7 h-7 rounded-lg bg-[#141519] border border-[#262832] flex items-center justify-center text-[#34D399]">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {kpis.totalPropiedadesTemporales}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Departamentos y casas activas
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#10B981]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0]">En Estadía (Hoy)</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#34D399] mt-2 font-mono">
            {kpis.huespedesEnEstadia}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            Huéspedes ocupando unidades
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#2DD4BF]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#99F6E4]">Tasa de Ocupación</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2DD4BF] mt-2 font-mono">
            {kpis.tasaOcupacionPromedio}%
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            Promedio mensual proyectado
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-[#10B981]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A7F3D0]">Facturación USD</span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] border border-[#10B981]/40 flex items-center justify-center text-[#34D399]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#34D399] mt-2 font-mono">
            US$ {kpis.ingresosMesUSD.toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            Reservas internacionales
          </div>
        </div>

        <div className="bg-[#1C1D23] p-4 rounded-xl border border-amber-500/30 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200">Facturación ARS</span>
            <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-300 mt-2 font-mono">
            ${kpis.ingresosMesARS.toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
            Reservas nacionales
          </div>
        </div>
      </div>

      {/* VISTA 1: TABLA DE RESERVAS */}
      {activeTab === "reservas" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por huésped, dirección o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filtro Canal */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Canal:</span>
                {["todos", "Directo", "Airbnb", "Booking.com"].map((canal) => (
                  <button
                    key={canal}
                    onClick={() => setFilterCanal(canal)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors",
                      filterCanal === canal
                        ? "bg-[#004d40] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {canal}
                  </button>
                ))}
              </div>

              {/* Filtro Estado */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5">Estado:</span>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-1"
                >
                  <option value="todos">Todos</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="en_estadia">En Estadía</option>
                  <option value="check_out_realizado">Check-out Realizado</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Reservas */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Huésped & Origen</th>
                    <th className="py-3 px-4">Propiedad Temporal</th>
                    <th className="py-3 px-4">Fechas & Noches</th>
                    <th className="py-3 px-4">Tarifa / Total</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Housekeeping</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron reservas con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((reserva) => (
                      <tr
                        key={reserva.id}
                        className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                        onClick={() => setSelectedReserva(reserva)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#E0F2F1] text-[#004d40] flex items-center justify-center font-bold text-xs shrink-0">
                              {reserva.huesped_nombre.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block text-xs group-hover:text-[#004d40]">
                                {reserva.huesped_nombre}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {reserva.huesped_origen || `${reserva.adultos} adultos`}
                              </span>
                            </div>
                            {reserva.huesped_telefono && (
                              <a
                                href={buildWhatsAppLink(
                                  reserva.huesped_telefono,
                                  `Hola ${reserva.huesped_nombre}, te contactamos de DeusX Inmobiliaria sobre tu reserva en ${reserva.direccion_inmueble}. Check-in: ${reserva.fecha_checkin}. Código de acceso: ${reserva.codigo_cerradura || "Se entrega en mano"}.`
                                )}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ml-1"
                                title="Enviar Voucher por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {reserva.direccion_inmueble}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            {reserva.carpeta_numero}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-700 text-xs">
                            {reserva.fecha_checkin} → {reserva.fecha_checkout}
                          </div>
                          <span className="text-[11px] font-bold text-[#004d40]">
                            {reserva.noches} {reserva.noches === 1 ? "noche" : "noches"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-800">
                            {reserva.moneda === "USD" ? `US$ ${reserva.total_estadia}` : `$${reserva.total_estadia.toLocaleString("es-AR")}`}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {reserva.moneda === "USD" ? `US$ ${reserva.tarifa_noche}/n` : `$${reserva.tarifa_noche.toLocaleString("es-AR")}/n`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <CanalBadge canal={reserva.canal_reserva} />
                        </td>

                        <td className="py-3.5 px-4">
                          <EstadoReservaBadge estado={reserva.estado_reserva} />
                        </td>

                        <td className="py-3.5 px-4">
                          <LimpiezaBadge limpieza={reserva.estado_limpieza} />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReserva(reserva);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-[#004d40] bg-[#E0F2F1] hover:bg-[#B2DFDB] rounded-md transition-colors"
                          >
                            Ver Voucher
                          </button>
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

      {/* VISTA 2: MATRIZ DE OCUPACIÓN / TIMELINE */}
      {activeTab === "calendario" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Cronograma de Ocupación por Unidad (Octubre 2026)
            </h3>
            <p className="text-xs text-slate-500">
              Visualización rápida de disponibilidad de cada propiedad temporal para cotizar reservas.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {(propiedadesTemporales.length > 0 ? propiedadesTemporales : todasPropiedades.slice(0, 4)).map(
              (prop) => {
                const reservasDeProp = items.filter((r) => r.propiedad_id === prop.id);
                return (
                  <div
                    key={prop.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#004d40]" />
                        <span className="font-bold text-xs text-slate-800">
                          {prop.direccion}
                        </span>
                        <span className="text-[10px] text-slate-400">({prop.localidad})</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {reservasDeProp.length} reservas registradas
                      </span>
                    </div>

                    {/* Timeline bar */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 gap-1 text-[10px] font-mono text-slate-400 text-center">
                        {["01-03", "04-06", "07-09", "10-12", "13-15", "16-18", "19-21", "22-24", "25-27", "28-30", "31", "Nov"].map((d, i) => (
                          <div key={i} className="border-b pb-0.5">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-12 gap-1 h-8 items-center bg-white rounded-lg p-1 border border-slate-200">
                        {reservasDeProp.length > 0 ? (
                          reservasDeProp.map((res) => (
                            <div
                              key={res.id}
                              onClick={() => setSelectedReserva(res)}
                              className="col-span-4 bg-teal-100 border border-teal-300 rounded text-[#004d40] px-2 py-1 flex items-center justify-between text-[10px] font-bold cursor-pointer hover:bg-teal-200 transition-colors truncate"
                              title={`${res.huesped_nombre} (${res.fecha_checkin} al ${res.fecha_checkout})`}
                            >
                              <span className="truncate">{res.huesped_nombre}</span>
                              <span className="font-mono text-[9px]">({res.noches}n)</span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-12 text-center text-[10px] text-slate-400 italic">
                            Disponible para nuevas reservas
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* VISTA 3: HOUSEKEEPING / LIMPIEZA */}
      {activeTab === "housekeeping" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <HousekeepingColumn
            title="Limpio & Listo"
            items={items.filter((i) => i.estado_limpieza === "limpio")}
            variant="teal"
            onSelect={setSelectedReserva}
            onCambiarLimpieza={handleCambiarLimpieza}
          />
          <HousekeepingColumn
            title="Sucio (Post Check-out)"
            items={items.filter((i) => i.estado_limpieza === "sucio_check_out")}
            variant="rose"
            onSelect={setSelectedReserva}
            onCambiarLimpieza={handleCambiarLimpieza}
            nextAction={{ label: "Poner en Limpieza", nextState: "en_limpieza" }}
          />
          <HousekeepingColumn
            title="En Limpieza"
            items={items.filter((i) => i.estado_limpieza === "en_limpieza")}
            variant="blue"
            onSelect={setSelectedReserva}
            onCambiarLimpieza={handleCambiarLimpieza}
            nextAction={{ label: "Listo para Inspección", nextState: "inspeccionado" }}
          />
          <HousekeepingColumn
            title="Inspeccionado / Aprobado"
            items={items.filter((i) => i.estado_limpieza === "inspeccionado")}
            variant="emerald"
            onSelect={setSelectedReserva}
            onCambiarLimpieza={handleCambiarLimpieza}
            nextAction={{ label: "Marcar Disponible", nextState: "limpio" }}
          />
        </div>
      )}

      {/* MODAL DETALLE & VOUCHER */}
      {selectedReserva && (
        <DetalleVoucherModal
          reserva={selectedReserva}
          onClose={() => setSelectedReserva(null)}
          onCambiarEstado={handleCambiarEstado}
          onCambiarLimpieza={handleCambiarLimpieza}
          isUpdating={isUpdating}
        />
      )}

      {/* MODAL NUEVA RESERVA */}
      {isCrearModalOpen && (
        <NuevaReservaModal
          isOpen={isCrearModalOpen}
          onClose={() => setIsCrearModalOpen(false)}
          propiedades={todasPropiedades}
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

function CanalBadge({ canal }: { canal: string }) {
  switch (canal) {
    case "Airbnb":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-700/50">
          Airbnb
        </span>
      );
    case "Booking.com":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/60 text-sky-300 border border-sky-700/50">
          Booking.com
        </span>
      );
    case "WhatsApp":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00382E]/60 text-[#34D399] border border-[#10B981]/40">
          WhatsApp
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#004D40]/60 text-[#34D399] border border-[#10B981]/40">
          Directo
        </span>
      );
  }
}

function EstadoReservaBadge({ estado }: { estado: string }) {
  switch (estado) {
    case "confirmada":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-950/60 text-amber-300 border border-amber-700/60">
          Confirmada
        </span>
      );
    case "en_estadia":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#00382E] text-[#34D399] border border-[#10B981]/50">
          En Estadía
        </span>
      );
    case "check_out_realizado":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#141519] text-slate-300 border border-[#262832]">
          Check-out OK
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-950/60 text-rose-300 border border-rose-700/60">
          Cancelada
        </span>
      );
  }
}

function LimpiezaBadge({ limpieza }: { limpieza: string }) {
  switch (limpieza) {
    case "limpio":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00382E]/60 text-[#34D399] border border-[#10B981]/40 flex items-center gap-1 w-max">
          <Sparkles className="w-2.5 h-2.5" /> Limpio
        </span>
      );
    case "en_limpieza":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/50 text-amber-300 border border-amber-700/50 flex items-center gap-1 w-max">
          <Clock className="w-2.5 h-2.5" /> En Limpieza
        </span>
      );
    case "inspeccionado":
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/50 text-purple-300 border border-purple-700/50 flex items-center gap-1 w-max">
          <ShieldCheck className="w-2.5 h-2.5" /> Inspeccionado
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/50 text-rose-300 border border-rose-700/50 flex items-center gap-1 w-max">
          <AlertCircle className="w-2.5 h-2.5" /> Sucio
        </span>
      );
  }
}

function HousekeepingColumn({
  title,
  items,
  variant,
  onSelect,
  onCambiarLimpieza,
  nextAction,
}: {
  title: string;
  items: ReservaTemporariaItem[];
  variant: "teal" | "rose" | "blue" | "emerald";
  onSelect: (r: ReservaTemporariaItem) => void;
  onCambiarLimpieza: (id: string, st: any) => void;
  nextAction?: { label: string; nextState: any };
}) {
  const borderStyles = {
    teal: "border-[#80CBC4] bg-[#E0F2F1]/80 text-[#004d40]",
    rose: "border-rose-300 bg-rose-50/80 text-rose-900",
    blue: "border-blue-300 bg-blue-50/80 text-blue-900",
    emerald: "border-emerald-300 bg-emerald-50/80 text-emerald-900",
  }[variant];

  return (
    <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-3 flex flex-col gap-3 min-h-[420px]">
      <div
        className={cn(
          "px-3 py-2 rounded-lg border flex items-center justify-between font-bold text-xs",
          borderStyles
        )}
      >
        <span>{title}</span>
        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-mono shadow-2xs">
          {items.length}
        </span>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
        {items.length === 0 ? (
          <div className="h-28 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
            Sin unidades en este estado
          </div>
        ) : (
          items.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r)}
              className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:border-teal-300 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 group-hover:text-[#004d40]">
                  {r.direccion_inmueble}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {r.carpeta_numero}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                Huésped: <span className="font-semibold text-slate-700">{r.huesped_nombre}</span>
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                Check-out: {r.fecha_checkout}
              </div>

              {nextAction && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCambiarLimpieza(r.id, nextAction.nextState);
                  }}
                  className="w-full mt-2 py-1 text-[10px] font-bold text-center bg-[#E0F2F1] hover:bg-[#B2DFDB] text-[#004d40] rounded transition-colors"
                >
                  {nextAction.label}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL VOUCHER & DETALLE DE RESERVA
// -----------------------------------------------------------------------------

function DetalleVoucherModal({
  reserva,
  onClose,
  onCambiarEstado,
  onCambiarLimpieza,
  isUpdating,
}: {
  reserva: ReservaTemporariaItem;
  onClose: () => void;
  onCambiarEstado: (id: string, st: any) => Promise<void>;
  onCambiarLimpieza: (id: string, st: any) => Promise<void>;
  isUpdating: string | null;
}) {
  const whatsappVoucherText = `*VOUCHER DE ALQUILER TEMPORARIO - DEUSX INMOBILIARIA*
---------------------------------------
Huésped: ${reserva.huesped_nombre}
Inmueble: ${reserva.direccion_inmueble} (${reserva.localidad})
Check-in: ${reserva.fecha_checkin} (desde las 14:00 hs)
Check-out: ${reserva.fecha_checkout} (hasta las 10:00 hs)
Noches: ${reserva.noches}
Cerradura Electrónica: ${reserva.codigo_cerradura || "Entrega en mano"}
---------------------------------------
Total Estadía: ${reserva.moneda === "USD" ? `US$ ${reserva.total_estadia}` : `$${reserva.total_estadia.toLocaleString("es-AR")}`}
¡Que disfrutes tu estadía!`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E0F2F1] text-[#004d40]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800">
                  Voucher de Estadía #{reserva.carpeta_numero}
                </h3>
                <CanalBadge canal={reserva.canal_reserva} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {reserva.direccion_inmueble}
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Card Huésped */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Huésped Principal
              </span>
              <span className="text-sm font-extrabold text-slate-800 block">
                {reserva.huesped_nombre}
              </span>
              <span className="text-xs text-slate-500">
                {reserva.huesped_origen || "Procedencia no indicada"} · {reserva.adultos} adultos
              </span>
            </div>

            {reserva.huesped_telefono && (
              <a
                href={buildWhatsAppLink(reserva.huesped_telefono, whatsappVoucherText)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Voucher
              </a>
            )}
          </div>

          {/* Grid Fechas y Tarifas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-in</span>
              <span className="text-sm font-bold text-slate-800 block font-mono">
                {reserva.fecha_checkin}
              </span>
              <span className="text-[10px] text-slate-400">14:00 hs</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-out</span>
              <span className="text-sm font-bold text-slate-800 block font-mono">
                {reserva.fecha_checkout}
              </span>
              <span className="text-[10px] text-slate-400">10:00 hs ({reserva.noches} noches)</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cerradura / Acceso</span>
              <span className="text-sm font-bold text-slate-800 block font-mono">
                {reserva.codigo_cerradura ? `Código PIN: ${reserva.codigo_cerradura}` : "Entrega en mano"}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Estadía</span>
              <span className="text-sm font-bold text-emerald-700 block font-mono">
                {reserva.moneda === "USD"
                  ? `US$ ${reserva.total_estadia}`
                  : `$${reserva.total_estadia.toLocaleString("es-AR")}`}
              </span>
            </div>
          </div>

          {/* Acciones de Flujo (Check-in / Check-out) */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
            <span className="text-[11px] font-extrabold text-[#004d40] uppercase tracking-wide block">
              Control Operativo de Estadía
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={isUpdating === reserva.id}
                onClick={() => onCambiarEstado(reserva.id, "en_estadia")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Hacer Check-in
              </button>

              <button
                disabled={isUpdating === reserva.id}
                onClick={() => onCambiarEstado(reserva.id, "check_out_realizado")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#004d40] hover:bg-[#00382e] text-white transition-colors"
              >
                Registrar Check-out
              </button>

              <button
                disabled={isUpdating === reserva.id}
                onClick={() => onCambiarEstado(reserva.id, "cancelada")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
              >
                Cancelar Reserva
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
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

// -----------------------------------------------------------------------------
// MODAL NUEVA RESERVA TEMPORARIA
// -----------------------------------------------------------------------------

function NuevaReservaModal({
  isOpen,
  onClose,
  propiedades,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  propiedades: PropiedadTemporalOption[];
  onCreated: () => void;
}) {
  const [propiedadId, setPropiedadId] = useState(propiedades[0]?.id || "");
  const [checkin, setCheckin] = useState("2026-10-10");
  const [checkout, setCheckout] = useState("2026-10-15");
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");
  const [tarifaNoche, setTarifaNoche] = useState<number>(50);
  const [tarifaLimpieza, setTarifaLimpieza] = useState<number>(20);
  const [huespedNombre, setHuespedNombre] = useState("");
  const [huespedTelefono, setHuespedTelefono] = useState("");
  const [huespedOrigen, setHuespedOrigen] = useState("");
  const [adultos, setAdultos] = useState<number>(2);
  const [canal, setCanal] = useState<any>("Airbnb");
  const [codigoCerradura, setCodigoCerradura] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!huespedNombre.trim() || !propiedadId || !checkin || !checkout) {
      setErrorMsg("Por favor complete el huésped, propiedad y fechas.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await crearReservaTemporariaAction({
        propiedad_id: propiedadId,
        fecha_checkin: checkin,
        fecha_checkout: checkout,
        moneda,
        tarifa_noche: Number(tarifaNoche),
        tarifa_limpieza: Number(tarifaLimpieza) || 0,
        huesped_nombre: huespedNombre.trim(),
        huesped_telefono: huespedTelefono.trim() || undefined,
        huesped_origen: huespedOrigen.trim() || undefined,
        adultos: Number(adultos) || 1,
        ninos: 0,
        canal_reserva: canal,
        codigo_cerradura: codigoCerradura.trim() || undefined,
      });

      if (res.success) {
        onCreated();
      } else {
        setErrorMsg(res.error || "Error al crear la reserva");
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
                Registrar Nueva Reserva Temporaria
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Alta de estadía vacacional / corporativa
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
              Propiedad Temporal *
            </label>
            <select
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            >
              {propiedades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.direccion} ({p.localidad})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Fecha Check-in *</label>
              <input
                type="date"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Fecha Check-out *</label>
              <input
                type="date"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="USD">USD (Dólares)</option>
                <option value="ARS">ARS (Pesos)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Tarifa por Noche</label>
              <input
                type="number"
                value={tarifaNoche}
                onChange={(e) => setTarifaNoche(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Canal de Venta</label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              >
                <option value="Directo">Directo</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Booking.com">Booking.com</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Nombre Huésped *</label>
              <input
                type="text"
                placeholder="Ej: Marcelo Tinelli"
                value={huespedNombre}
                onChange={(e) => setHuespedNombre(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">WhatsApp / Teléfono</label>
              <input
                type="text"
                placeholder="+54911..."
                value={huespedTelefono}
                onChange={(e) => setHuespedTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Procedencia</label>
              <input
                type="text"
                placeholder="Ciudad / País"
                value={huespedOrigen}
                onChange={(e) => setHuespedOrigen(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">PIN Cerradura Electrónica</label>
              <input
                type="text"
                placeholder="Ej: 5821"
                value={codigoCerradura}
                onChange={(e) => setCodigoCerradura(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
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
              {isSubmitting ? "Creando..." : "Confirmar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
