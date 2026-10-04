"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  FolderKanban,
  CheckCircle2,
  Eye,
  MessageCircle,
  Shield,
  Wrench,
  UserCheck,
  User,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PersonaCRMItem,
  PersonasKpis,
  crearPersonaAction,
  actualizarPersonaAction,
} from "@/modules/personas/actions";
import { buildWhatsAppLink } from "@/lib/whatsapp/whatsappHelper";

interface PersonasHubProps {
  initialItems: PersonaCRMItem[];
  initialKpis: PersonasKpis;
}

export function PersonasHub({ initialItems, initialKpis }: PersonasHubProps) {
  const [items, setItems] = useState<PersonaCRMItem[]>(initialItems);
  const [kpis, setKpis] = useState<PersonasKpis>(initialKpis);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRol, setFilterRol] = useState<"todos" | "propietario" | "inquilino" | "garante" | "proveedor">("todos");

  const [selectedPersonaDrawer, setSelectedPersonaDrawer] = useState<PersonaCRMItem | null>(null);
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);

  // Filtrado de personas
  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      // Filtro de Rol
      if (filterRol !== "todos" && !p.roles.includes(filterRol)) return false;

      // Filtro de Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNombre = p.nombre_completo.toLowerCase().includes(q);
        const matchDoc = p.documento_numero.includes(q);
        const matchEmail = p.email?.toLowerCase().includes(q);
        const matchTel = p.telefono?.includes(q);
        const matchDir = p.direccion?.toLowerCase().includes(q);
        const matchAlias = p.cbu_alias?.toLowerCase().includes(q);
        const matchCarpetas = p.contratos_vinculados.some((c) => c.carpeta_numero.includes(q));
        return matchNombre || matchDoc || matchEmail || matchTel || matchDir || matchAlias || matchCarpetas;
      }

      return true;
    });
  }, [items, filterRol, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E0F2F1] text-[#004d40]">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                CRM & Directorio Unificado de Personas
              </h1>
              <p className="text-xs text-slate-500">
                Gestión centralizada de Propietarios, Inquilinos, Garantes y Proveedores con legajos y datos bancarios.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCrearModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Persona</span>
        </button>
      </div>

      {/* 2. TARJETAS KPI EJECUTIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI: Total */}
        <div className="p-3.5 rounded-2xl bg-[#1C1D23] border border-[#262832] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Contactos
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141519] border border-[#262832] text-slate-300 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-white font-mono">
            {kpis.totalPersonas}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Registrados en el sistema</div>
        </div>

        {/* KPI: Propietarios */}
        {/* KPI: Propietarios */}
        <div className="p-3.5 rounded-2xl bg-[#1C1D23] border border-[#10B981]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Propietarios
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40 flex items-center justify-center">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#34D399] font-mono">
            {kpis.totalPropietarios}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Locadores titulares</div>
        </div>

        {/* KPI: Inquilinos */}
        <div className="p-3.5 rounded-2xl bg-[#1C1D23] border border-[#10B981]/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A7F3D0] uppercase tracking-wider">
              Inquilinos
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#00382E] text-[#34D399] border border-[#10B981]/40 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#34D399] font-mono">
            {kpis.totalInquilinos}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Locatarios en alquiler</div>
        </div>

        {/* KPI: Garantes */}
        <div className="p-3.5 rounded-2xl bg-[#1C1D23] border border-purple-500/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-200 uppercase tracking-wider">
              Garantes
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-700/50 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-purple-300 font-mono">
            {kpis.totalGarantes}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Co-deudores fiadores</div>
        </div>

        {/* KPI: Proveedores */}
        <div className="p-3.5 rounded-2xl bg-[#1C1D23] border border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-200 uppercase tracking-wider">
              Proveedores
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-700/50 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-amber-300 font-mono">
            {kpis.totalProveedores}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Técnicos & Mantenimiento</div>
        </div>
      </div>

      {/* 3. BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI, Teléfono, CBU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-colors"
          />
        </div>

        {/* Píldoras de Rol */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterRol("todos")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
              filterRol === "todos"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Todos ({items.length})
          </button>

          <button
            onClick={() => setFilterRol("propietario")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterRol === "propietario"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
            )}
          >
            <span>Propietarios</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/60 font-bold">
              {kpis.totalPropietarios}
            </span>
          </button>

          <button
            onClick={() => setFilterRol("inquilino")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterRol === "inquilino"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60"
            )}
          >
            <span>Inquilinos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200/60 font-bold">
              {kpis.totalInquilinos}
            </span>
          </button>

          <button
            onClick={() => setFilterRol("garante")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterRol === "garante"
                ? "bg-purple-700 text-white"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60"
            )}
          >
            <span>Garantes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200/60 font-bold">
              {kpis.totalGarantes}
            </span>
          </button>

          <button
            onClick={() => setFilterRol("proveedor")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
              filterRol === "proveedor"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
            )}
          >
            <span>Proveedores</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/60 font-bold">
              {kpis.totalProveedores}
            </span>
          </button>
        </div>
      </div>

      {/* 4. TABLA DIRECTORIO DE PERSONAS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nombre / Razón Social</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Roles en Sistema</th>
                <th className="py-3 px-4">Contacto Directo</th>
                <th className="py-3 px-4">CBU / Alias Bancario</th>
                <th className="py-3 px-4">Contratos / Carpetas</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No se encontraron personas con ese criterio</p>
                    <p className="text-xs text-slate-400 mt-1">Pruebe ajustando los filtros de rol o búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((persona) => (
                  <tr key={persona.id} className="hover:bg-[#242630] transition-colors">
                    {/* 1. NOMBRE */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-white">
                        {persona.nombre_completo}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Persona {persona.tipo_persona}
                      </div>
                    </td>

                    {/* 2. DOCUMENTO */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-mono font-medium text-slate-200">
                        {persona.documento_tipo}: {persona.documento_numero}
                      </span>
                    </td>

                    {/* 3. ROLES */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {persona.roles.map((r, i) => (
                          <span
                            key={i}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              r === "propietario" && "bg-[#00382E] text-[#34D399] border border-[#10B981]/40",
                              r === "inquilino" && "bg-[#004D40]/60 text-[#34D399] border border-[#10B981]/40",
                              r === "garante" && "bg-purple-950/60 text-purple-300 border border-purple-700/60",
                              r === "proveedor" && "bg-amber-950/60 text-amber-300 border border-amber-700/60"
                            )}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 4. CONTACTO */}
                    <td className="py-3 px-4 align-top">
                      {persona.telefono && (
                        <div className="flex items-center gap-1.5 text-slate-200 font-mono">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{persona.telefono}</span>
                        </div>
                      )}
                      {persona.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5 truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{persona.email}</span>
                        </div>
                      )}
                    </td>

                    {/* 5. CBU / ALIAS */}
                    <td className="py-3 px-4 align-top">
                      {persona.cbu_alias ? (
                        <div className="font-mono text-[#34D399] bg-[#00382E]/60 px-2 py-0.5 rounded border border-[#10B981]/30 inline-flex items-center gap-1 text-[11px]">
                          <CreditCard className="w-3 h-3 text-[#10B981]" />
                          <span>{persona.cbu_alias}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No registrado</span>
                      )}
                    </td>

                    {/* 6. CONTRATOS VINCULADOS */}
                    <td className="py-3 px-4 align-top">
                      {persona.contratos_vinculados.length === 0 ? (
                        <span className="text-slate-400 italic text-[11px]">Sin contratos</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {persona.contratos_vinculados.map((c, i) => (
                            <span
                              key={i}
                              title={`${c.direccion_inmueble} (${c.rol})`}
                              className="px-2 py-0.5 bg-[#141519] text-slate-200 font-mono font-bold text-[10px] rounded border border-[#262832]"
                            >
                              #{c.carpeta_numero.length > 5 ? c.carpeta_numero.slice(-4) : c.carpeta_numero}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* 7. ACCIONES */}
                    <td className="py-3 px-4 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        {persona.telefono && (
                          <a
                            href={buildWhatsAppLink(persona.telefono, `Hola ${persona.nombre_completo}, le escribimos de DeusX Inmobiliaria.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#34D399] hover:text-white hover:bg-[#00382E] rounded-lg transition-colors border border-[#10B981]/30"
                            title="Chatear por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setSelectedPersonaDrawer(persona)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 font-bold text-xs text-slate-300 hover:text-white bg-[#141519] hover:bg-[#1C1D23] rounded-lg border border-[#262832] transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Legajo</span>
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

      {/* 5. MODAL DRAWER: LEGAJO DIGITAL DE PERSONA */}
      {selectedPersonaDrawer && (
        <LegajoPersonaModal
          persona={selectedPersonaDrawer}
          onClose={() => setSelectedPersonaDrawer(null)}
          onUpdate={(updated) => {
            setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedPersonaDrawer(updated);
          }}
        />
      )}

      {/* 6. MODAL DRAWER: ALTA DE NUEVA PERSONA */}
      {isCrearModalOpen && (
        <NuevaPersonaModal
          onClose={() => setIsCrearModalOpen(false)}
          onSuccess={(nuevaPersona) => {
            const parsed: PersonaCRMItem = {
              id: nuevaPersona.id,
              tipo_persona: nuevaPersona.tipo_persona,
              nombre_completo: nuevaPersona.nombre_completo,
              documento_tipo: nuevaPersona.documento_tipo,
              documento_numero: nuevaPersona.documento_numero,
              email: nuevaPersona.email,
              telefono: nuevaPersona.telefono,
              direccion: nuevaPersona.direccion,
              cbu_alias: nuevaPersona.cbu_alias,
              banco_nombre: nuevaPersona.banco_nombre,
              notas: nuevaPersona.notas,
              roles: ["inquilino"],
              contratos_vinculados: [],
              creado_al: nuevaPersona.creado_al,
            };
            setItems((prev) => [parsed, ...prev]);
            setKpis((prev) => ({ ...prev, totalPersonas: prev.totalPersonas + 1 }));
            setIsCrearModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ==============================================================================
// MODAL LEGAJO DIGITAL
// ==============================================================================

function LegajoPersonaModal({
  persona,
  onClose,
  onUpdate,
}: {
  persona: PersonaCRMItem;
  onClose: () => void;
  onUpdate: (p: PersonaCRMItem) => void;
}) {
  const [telefono, setTelefono] = useState(persona.telefono || "");
  const [email, setEmail] = useState(persona.email || "");
  const [direccion, setDireccion] = useState(persona.direccion || "");
  const [cbuAlias, setCbuAlias] = useState(persona.cbu_alias || "");
  const [notas, setNotas] = useState(persona.notas || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await actualizarPersonaAction(persona.id, {
        telefono,
        email,
        direccion,
        cbu_alias: cbuAlias,
        notas,
      });

      onUpdate({
        ...persona,
        telefono,
        email,
        direccion,
        cbu_alias: cbuAlias,
        notas,
      });
      alert("Legajo actualizado correctamente.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-800 rounded">
                Legajo #{persona.documento_numero}
              </span>
              <h3 className="font-bold text-slate-900 text-base">{persona.nombre_completo}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {persona.documento_tipo} {persona.documento_numero} • Persona {persona.tipo_persona}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 flex items-center justify-center">
            ✕
          </button>
        </div>

        <form onSubmit={handleGuardar} className="py-4 space-y-4 text-xs">
          {/* Roles */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Roles activos:</span>
            <div className="flex gap-1">
              {persona.roles.map((r, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Formulario editable */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Teléfono:</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">Domicilio Real:</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">CBU / CVU / Alias Bancario:</label>
            <input
              type="text"
              value={cbuAlias}
              onChange={(e) => setCbuAlias(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
            />
          </div>

          {/* Contratos Vinculados */}
          <div>
            <span className="text-[10px] font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider">
              Contratos y Locaciones Asociadas:
            </span>
            {persona.contratos_vinculados.length === 0 ? (
              <p className="text-slate-400 italic">No tiene contratos asociados actualmente.</p>
            ) : (
              <div className="space-y-1.5">
                {persona.contratos_vinculados.map((c, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-800">Carpeta #{c.carpeta_numero}</span>
                      <span className="text-slate-500 ml-1.5">({c.direccion_inmueble})</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200">
                      {c.rol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">Notas & Observaciones:</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {persona.telefono && (
              <a
                href={buildWhatsAppLink(persona.telefono, `Hola ${persona.nombre_completo}, le escribimos de DeusX Inmobiliaria.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Abrir WhatsApp</span>
              </a>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-xl shadow-md disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================================================================
// MODAL NUEVA PERSONA
// ==============================================================================

function NuevaPersonaModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (p: any) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipoPersona, setTipoPersona] = useState<"fisica" | "juridica">("fisica");
  const [docTipo, setDocTipo] = useState<"DNI" | "CUIT" | "CUIL" | "PASAPORTE">("DNI");
  const [docNumero, setDocNumero] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cbuAlias, setCbuAlias] = useState("");
  const [notas, setNotas] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !docNumero.trim()) {
      alert("Por favor complete nombre y número de documento.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await crearPersonaAction({
        nombre_completo: nombre,
        tipo_persona: tipoPersona,
        documento_tipo: docTipo,
        documento_numero: docNumero,
        email,
        telefono,
        direccion,
        cbu_alias: cbuAlias,
        notas,
      });

      if (!res.success) throw new Error(res.error || "No se pudo crear la persona");
      onSuccess(res.persona);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E0F2F1] text-[#004d40]">
              <UserCheck className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Registrar Nueva Persona en CRM</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 flex items-center justify-center">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">Nombre Completo / Razón Social:</label>
            <input
              type="text"
              required
              placeholder="Ej: PEREZ JUAN CARLOS"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Tipo Persona:</label>
              <select
                value={tipoPersona}
                onChange={(e) => setTipoPersona(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              >
                <option value="fisica">Física</option>
                <option value="juridica">Jurídica</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Tipo Doc:</label>
              <select
                value={docTipo}
                onChange={(e) => setDocTipo(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              >
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Nº Documento:</label>
              <input
                type="text"
                required
                placeholder="Sin puntos"
                value={docNumero}
                onChange={(e) => setDocNumero(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Teléfono (con código de área):</label>
              <input
                type="text"
                placeholder="Ej: 5492317415612"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Email:</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">Domicilio Real:</label>
            <input
              type="text"
              placeholder="Calle, número y localidad"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">CBU / Alias Bancario:</label>
            <input
              type="text"
              placeholder="Ej: titular.rentas.galicia"
              value={cbuAlias}
              onChange={(e) => setCbuAlias(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-xl shadow-md disabled:opacity-50"
            >
              {isProcessing ? "Registrando..." : "Registrar Persona"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
