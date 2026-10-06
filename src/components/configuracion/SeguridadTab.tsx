"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Database,
  Building,
  Mail,
  BadgeCheck,
} from "lucide-react";
import {
  cambiarPasswordAction,
  getTenantUsuariosInfoAction,
  invitarOperadorAction,
  UsuarioLicenciaItem,
} from "@/modules/configuracion/actions";
import { cn } from "@/lib/utils";

export function SeguridadTab() {
  // Estado para cambio de contraseña
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");
  const [showPassActual, setShowPassActual] = useState(false);
  const [showPassNueva, setShowPassNueva] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Estado para operadores y licencia
  const [usuarios, setUsuarios] = useState<UsuarioLicenciaItem[]>([]);
  const [limiteUsuarios, setLimiteUsuarios] = useState(5);
  const [planSaas, setPlanSaas] = useState("pro");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Modal para invitar operador
  const [showInvitar, setShowInvitar] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPass, setNuevoPass] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"operador" | "admin">("operador");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const fetchUsuarios = async () => {
    setIsLoadingUsers(true);
    const res = await getTenantUsuariosInfoAction();
    if (res.success) {
      setUsuarios(res.usuarios);
      setLimiteUsuarios(res.limiteUsuarios);
      setPlanSaas(res.planSaas);
    }
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (passNueva.length < 6) {
      setPassError("La nueva contraseña debe tener como mínimo 6 caracteres.");
      return;
    }

    if (passNueva !== passConfirmar) {
      setPassError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setIsUpdatingPass(true);
    try {
      const res = await cambiarPasswordAction(passActual, passNueva);
      if (res.success) {
        setPassSuccess(true);
        setPassActual("");
        setPassNueva("");
        setPassConfirmar("");
        setTimeout(() => setPassSuccess(false), 5000);
      } else {
        setPassError(res.error || "Error al actualizar la contraseña.");
      }
    } catch (err: any) {
      setPassError(err.message || "Error al actualizar la contraseña.");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleInvitarOperador = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);

    if (!nuevoEmail.includes("@")) {
      setInviteError("Ingrese un correo electrónico válido.");
      return;
    }

    if (nuevoPass.length < 6) {
      setInviteError("La contraseña temporal debe tener al menos 6 caracteres.");
      return;
    }

    setIsInviting(true);
    try {
      const res = await invitarOperadorAction(nuevoEmail, nuevoPass, nuevoRol);
      if (res.success) {
        setInviteSuccess(true);
        setNuevoEmail("");
        setNuevoPass("");
        await fetchUsuarios();
        setTimeout(() => {
          setInviteSuccess(false);
          setShowInvitar(false);
        }, 2000);
      } else {
        setInviteError(res.error || "Error al agregar responsable.");
      }
    } catch (err: any) {
      setInviteError(err.message || "Error al agregar responsable.");
    } finally {
      setIsInviting(false);
    }
  };

  const cupoOcupado = usuarios.filter((u) => u.activo).length;
  const cupoMaximo = limiteUsuarios || 5;
  const cupoDisponible = cupoMaximo - cupoOcupado;

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE CAMBIO DE CONTRASEÑA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Seguridad de la Cuenta & Cambio de Contraseña</h2>
              <p className="text-xs text-slate-500">
                Actualizá tu clave personal de acceso al panel de DeusX Inmobiliaria.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            Auth Supabase SSL
          </span>
        </div>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Tu contraseña ha sido actualizada con éxito! Utilizala en tu próximo inicio de sesión.</span>
          </div>
        )}

        {passError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassActual ? "text" : "password"}
                value={passActual}
                onChange={(e) => setPassActual(e.target.value)}
                placeholder="Ingresá tu clave actual"
                required
                className="w-full text-xs p-2.5 pr-9 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00796b]"
              />
              <button
                type="button"
                onClick={() => setShowPassActual(!showPassActual)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassActual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassNueva ? "text" : "password"}
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full text-xs p-2.5 pr-9 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00796b]"
              />
              <button
                type="button"
                onClick={() => setShowPassNueva(!showPassNueva)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassNueva ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={passConfirmar}
              onChange={(e) => setPassConfirmar(e.target.value)}
              placeholder="Reingresá la nueva clave"
              required
              minLength={6}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#00796b]"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isUpdatingPass}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isUpdatingPass ? "Actualizando clave..." : "Guardar Nueva Contraseña"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. SECCIÓN DE CONTROL DE LICENCIA SAAS & RESPONSABLES DEL EQUIPO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Responsables & Operadores de la Licencia
              </h2>
              <p className="text-xs text-slate-500">
                Cada responsable accede con su propio usuario y contraseña, auditando sus operaciones bajo la misma base unificada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">
                Cupo: {cupoOcupado} de {cupoMaximo} operadores
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {cupoDisponible > 0 ? `${cupoDisponible} lugares disponibles` : "Cupo máximo alcanzado"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInvitar(true)}
              disabled={cupoDisponible <= 0}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#00796b] hover:bg-[#004d40] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Agregar Responsable</span>
            </button>
          </div>
        </div>

        {/* Tarjeta Explicativa de la Arquitectura Multi-Tenant Unificada */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-slate-50 border border-teal-200/60 flex items-start gap-3">
          <Database className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-950 space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>Arquitectura SaaS: Base de Datos Central con Aislamiento RLS</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                Máximo 5 Licencias
              </span>
            </div>
            <p className="text-[11px] text-teal-900/90 leading-relaxed">
              La plataforma mantiene <strong>una única base de datos relacional</strong> con políticas de seguridad Row-Level Security (RLS). Cada uno de los hasta 5 responsables ingresa con su propio usuario y contraseña independiente, pudiendo emitir recibos, liquidar y cargar contratos de manera simultánea sin cruzarse jamás con otras inmobiliarias.
            </p>
          </div>
        </div>

        {/* Formulario Modal Inline para Agregar Responsable */}
        {showInvitar && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00796b]" />
                <span>Alta de Nuevo Operador / Responsable</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowInvitar(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>

            {inviteSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Operador creado y vinculado a la licencia con éxito!</span>
              </div>
            )}

            {inviteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInvitarOperador} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Correo Electrónico (Usuario)
                </label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="ejemplo@inmobiliaria.com"
                  required
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  value={nuevoPass}
                  onChange={(e) => setNuevoPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Rol de Acceso
                </label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="operador">Operador (Cobranzas, Contratos, Agenda)</option>
                  <option value="admin">Administrador (Acceso Completo)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowInvitar(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#004d40] hover:bg-[#00382e] rounded-lg shadow-xs"
                >
                  {isInviting ? "Registrando..." : "Crear Acceso"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listado de Operadores Activos en la Licencia */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-4">Usuario / Email</th>
                <th className="py-2.5 px-4">Rol en la Inmobiliaria</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Sesión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Cargando operadores de la licencia...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No se encontraron usuarios vinculados.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{u.email}</span>
                      {u.esActual && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          Tu Usuario
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          u.rol === "owner"
                            ? "bg-purple-100 text-purple-800"
                            : u.rol === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Activo
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {u.esActual ? "Conectado ahora" : "Habilitado"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
