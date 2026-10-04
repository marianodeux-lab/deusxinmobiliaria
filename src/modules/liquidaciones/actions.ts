"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface LiquidacionPendienteItem {
  periodo_id: string;
  contrato_id: string;
  carpeta_numero: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_alquiler: number;
  monto_punitorios: number;
  total_bruto_percibido: number;
  moneda: "ARS" | "USD";
  porcentaje_comision_defecto: number;
  monto_comision_calculado: number;
  monto_neto_estimado: number;
  inmueble: {
    direccion: string;
    localidad: string;
  };
  propietario: {
    id: string;
    nombre: string;
    documento: string;
    telefono?: string;
    cbu_alias?: string;
  };
  inquilino: {
    nombre: string;
    documento: string;
    telefono?: string;
  };
}

export interface LiquidacionRealizadaItem {
  id: string;
  numero_liquidacion: string;
  fecha_liquidacion: string;
  contrato_id: string;
  carpeta_numero: string;
  inmueble: {
    direccion: string;
    localidad: string;
  };
  propietario: {
    id: string;
    nombre: string;
    documento: string;
    telefono?: string;
    cbu_alias?: string;
  };
  monto_bruto_percibido: number;
  monto_honorarios_inmobiliaria: number;
  monto_iva_honorarios: number;
  monto_gastos_reparaciones: number;
  monto_retenciones_impositivas: number;
  monto_neto_liquidado: number;
  medio_pago: string;
  cbu_destino_propietario?: string;
  comprobante_transferencia?: string;
  estado: string;
  creado_al: string;
}

export interface LiquidacionesKpis {
  totalPendienteRendirArs: number;
  totalRendidoMesArs: number;
  totalComisionesGanadasArs: number;
  totalBrutoPercibidoMesArs: number;
  cantidadPendientes: number;
  cantidadRendidas: number;
}

export interface RegistrarLiquidacionInput {
  periodo_id: string;
  contrato_id: string;
  propietario_id: string;
  carpeta_numero: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_bruto_percibido: number;
  monto_honorarios_inmobiliaria: number;
  monto_iva_honorarios: number;
  monto_gastos_reparaciones: number;
  monto_retenciones_impositivas: number;
  monto_neto_liquidado: number;
  medio_pago: string;
  cuenta_origen_inmobiliaria?: string;
  cbu_destino_propietario?: string;
  comprobante_transferencia?: string;
  observaciones?: string;
}

/**
 * Obtiene el tablero de liquidaciones pendientes e historial de rendiciones
 */
export async function getLiquidacionesDashboardAction(filtro?: {
  mes?: number;
  anio?: number;
}): Promise<{
  success: boolean;
  pendientes: LiquidacionPendienteItem[];
  historial: LiquidacionRealizadaItem[];
  kpis: LiquidacionesKpis;
  periodo_seleccionado: { mes: number; anio: number };
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const hoy = new Date();
    const mes = filtro?.mes ?? hoy.getMonth() + 1;
    const anio = filtro?.anio ?? hoy.getFullYear();

    // 1. Obtener alquileres cobrados pendientes de rendición al dueño
    const { data: periodosPendientes, error: pErr } = await admin
      .from("periodos_contrato")
      .select(`
        id,
        contrato_id,
        periodo_mes,
        periodo_anio,
        monto_alquiler,
        monto_punitorios_calculados,
        contratos (
          id,
          carpeta_numero,
          moneda_base,
          propiedades (
            direccion_calle,
            direccion_numero,
            localidad
          ),
          contrato_participantes (
            rol,
            personas (
              id,
              nombre_completo,
              documento_numero,
              telefono,
              cbu_alias
            )
          )
        )
      `)
      .eq("periodo_anio", anio)
      .eq("periodo_mes", mes)
      .eq("estado_cobranza", "cobrado")
      .eq("estado_liquidacion", "pendiente");

    if (pErr) {
      console.error("Error al consultar periodos pendientes de rendición:", pErr);
    }

    const pendientes: LiquidacionPendienteItem[] = [];
    let totalPendienteRendirArs = 0;

    for (const p of periodosPendientes || []) {
      const c = Array.isArray(p.contratos) ? p.contratos[0] : p.contratos;
      if (!c) continue;

      const prop = Array.isArray(c.propiedades) ? c.propiedades[0] : c.propiedades;
      const partes = c.contrato_participantes || [];

      const inquilinoParte = partes.find((cp: any) => cp.rol === "inquilino");
      const inquilinoPersona = inquilinoParte ? (Array.isArray(inquilinoParte.personas) ? inquilinoParte.personas[0] : inquilinoParte.personas) : null;

      const propietarioParte = partes.find((cp: any) => cp.rol === "propietario");
      const propietarioPersona = propietarioParte ? (Array.isArray(propietarioParte.personas) ? propietarioParte.personas[0] : propietarioParte.personas) : null;

      const montoAlquiler = Number(p.monto_alquiler) || 0;
      const montoPunitorios = Number(p.monto_punitorios_calculados) || 0;
      const totalBruto = montoAlquiler + montoPunitorios;

      // Comisión por defecto: 4.13% (habitual en contratos de alquiler en PBA / CABA)
      const porcComision = 4.13;
      const montoComision = Math.round(montoAlquiler * (porcComision / 100));
      const montoNeto = totalBruto - montoComision;

      totalPendienteRendirArs += montoNeto;

      pendientes.push({
        periodo_id: p.id,
        contrato_id: c.id,
        carpeta_numero: c.carpeta_numero || "S/N",
        periodo_mes: p.periodo_mes,
        periodo_anio: p.periodo_anio,
        monto_alquiler: montoAlquiler,
        monto_punitorios: montoPunitorios,
        total_bruto_percibido: totalBruto,
        moneda: c.moneda_base || "ARS",
        porcentaje_comision_defecto: porcComision,
        monto_comision_calculado: montoComision,
        monto_neto_estimado: montoNeto,
        inmueble: {
          direccion: `${prop?.direccion_calle || "Calle"} ${prop?.direccion_numero || ""}`.trim(),
          localidad: prop?.localidad || "Capital Federal",
        },
        propietario: {
          id: propietarioPersona?.id || "",
          nombre: propietarioPersona?.nombre_completo || "Propietario no registrado",
          documento: propietarioPersona?.documento_numero || "DNI S/N",
          telefono: propietarioPersona?.telefono,
          cbu_alias: propietarioPersona?.cbu_alias,
        },
        inquilino: {
          nombre: inquilinoPersona?.nombre_completo || "Inquilino",
          documento: inquilinoPersona?.documento_numero || "DNI S/N",
          telefono: inquilinoPersona?.telefono,
        },
      });
    }

    // 2. Obtener historial de liquidaciones ya emitidas
    const { data: liquidacionesData, error: lErr } = await admin
      .from("liquidaciones")
      .select(`
        id,
        numero_liquidacion,
        fecha_liquidacion,
        contrato_id,
        propietario_id,
        monto_bruto_percibido,
        monto_honorarios_inmobiliaria,
        monto_iva_honorarios,
        monto_gastos_reparaciones,
        monto_retenciones_impositivas,
        monto_neto_liquidado,
        medio_pago,
        cbu_destino_propietario,
        comprobante_transferencia,
        estado,
        creado_al,
        personas (
          nombre_completo,
          documento_numero,
          telefono
        ),
        contratos (
          carpeta_numero,
          propiedades (
            direccion_calle,
            direccion_numero,
            localidad
          )
        )
      `)
      .order("creado_al", { ascending: false });

    if (lErr) {
      console.error("Error al consultar historial de liquidaciones:", lErr);
    }

    const historial: LiquidacionRealizadaItem[] = [];
    let totalRendidoMesArs = 0;
    let totalComisionesGanadasArs = 0;
    let totalBrutoPercibidoMesArs = 0;

    for (const l of liquidacionesData || []) {
      const per = Array.isArray(l.personas) ? l.personas[0] : l.personas;
      const c = Array.isArray(l.contratos) ? l.contratos[0] : l.contratos;
      const prop = c?.propiedades ? (Array.isArray(c.propiedades) ? c.propiedades[0] : c.propiedades) : null;

      const bruto = Number(l.monto_bruto_percibido) || 0;
      const honorarios = Number(l.monto_honorarios_inmobiliaria) || 0;
      const neto = Number(l.monto_neto_liquidado) || 0;

      if (l.estado !== "anulado") {
        totalRendidoMesArs += neto;
        totalComisionesGanadasArs += honorarios;
        totalBrutoPercibidoMesArs += bruto;
      }

      historial.push({
        id: l.id,
        numero_liquidacion: l.numero_liquidacion,
        fecha_liquidacion: l.fecha_liquidacion,
        contrato_id: l.contrato_id,
        carpeta_numero: c?.carpeta_numero || "S/N",
        inmueble: {
          direccion: prop ? `${prop.direccion_calle} ${prop.direccion_numero || ""}`.trim() : "Propiedad",
          localidad: prop?.localidad || "Capital Federal",
        },
        propietario: {
          id: l.propietario_id,
          nombre: per?.nombre_completo || "Propietario",
          documento: per?.documento_numero || "DNI S/N",
          telefono: per?.telefono,
          cbu_alias: l.cbu_destino_propietario,
        },
        monto_bruto_percibido: bruto,
        monto_honorarios_inmobiliaria: honorarios,
        monto_iva_honorarios: Number(l.monto_iva_honorarios) || 0,
        monto_gastos_reparaciones: Number(l.monto_gastos_reparaciones) || 0,
        monto_retenciones_impositivas: Number(l.monto_retenciones_impositivas) || 0,
        monto_neto_liquidado: neto,
        medio_pago: l.medio_pago,
        cbu_destino_propietario: l.cbu_destino_propietario,
        comprobante_transferencia: l.comprobante_transferencia,
        estado: l.estado,
        creado_al: l.creado_al,
      });
    }

    return {
      success: true,
      pendientes,
      historial,
      kpis: {
        totalPendienteRendirArs,
        totalRendidoMesArs,
        totalComisionesGanadasArs,
        totalBrutoPercibidoMesArs,
        cantidadPendientes: pendientes.length,
        cantidadRendidas: historial.filter((h) => h.estado !== "anulado").length,
      },
      periodo_seleccionado: { mes, anio },
    };
  } catch (err: any) {
    console.error("Excepción en getLiquidacionesDashboardAction:", err);
    return {
      success: false,
      pendientes: [],
      historial: [],
      kpis: {
        totalPendienteRendirArs: 0,
        totalRendidoMesArs: 0,
        totalComisionesGanadasArs: 0,
        totalBrutoPercibidoMesArs: 0,
        cantidadPendientes: 0,
        cantidadRendidas: 0,
      },
      periodo_seleccionado: { mes: 10, anio: 2026 },
      error: err.message,
    };
  }
}

/**
 * Registra formalmente la liquidación al locador y marca el período como liquidado
 */
export async function registrarLiquidacionAction(input: RegistrarLiquidacionInput) {
  try {
    const admin = createAdminClient();

    // 1. Obtener contrato y tenant
    const { data: contrato, error: cErr } = await admin
      .from("contratos")
      .select("tenant_id")
      .eq("id", input.contrato_id)
      .single();

    if (cErr || !contrato) {
      return { success: false, error: "Contrato no encontrado" };
    }

    const tenantId = contrato.tenant_id;

    // 2. Generar correlativo de liquidación (LIQ-0001-XXXXXX)
    const numeroLiquidacion = `LIQ-0001-${Date.now().toString().slice(-6)}`;
    const fechaHoy = new Date().toISOString().split("T")[0];

    // 3. Insertar en tabla liquidaciones
    const medioPagoFormateado = input.medio_pago.toLowerCase().includes("efectivo")
      ? "efectivo"
      : input.medio_pago.toLowerCase().includes("cheque")
      ? "cheque"
      : "transferencia";

    const { data: nuevaLiq, error: lErr } = await admin
      .from("liquidaciones")
      .insert({
        tenant_id: tenantId,
        contrato_id: input.contrato_id,
        propietario_id: input.propietario_id,
        numero_liquidacion: numeroLiquidacion,
        fecha_liquidacion: fechaHoy,
        monto_bruto_percibido: input.monto_bruto_percibido,
        monto_honorarios_inmobiliaria: input.monto_honorarios_inmobiliaria,
        monto_iva_honorarios: input.monto_iva_honorarios || 0,
        monto_gastos_reparaciones: input.monto_gastos_reparaciones || 0,
        monto_retenciones_impositivas: input.monto_retenciones_impositivas || 0,
        monto_neto_liquidado: input.monto_neto_liquidado,
        medio_pago: medioPagoFormateado,
        cuenta_origen_inmobiliaria: input.cuenta_origen_inmobiliaria || "Cuenta Operativa Deus Inmobiliaria",
        cbu_destino_propietario: input.cbu_destino_propietario,
        comprobante_transferencia: input.comprobante_transferencia,
        estado: "liquidado",
      })
      .select()
      .single();

    if (lErr) {
      console.error("Error al registrar liquidación en BD:", lErr);
      throw lErr;
    }

    // 4. Actualizar período_contrato a estado_liquidacion = 'liquidado'
    if (input.periodo_id) {
      await admin
        .from("periodos_contrato")
        .update({
          estado_liquidacion: "liquidado",
        })
        .eq("id", input.periodo_id);
    }

    revalidatePath("/liquidaciones");
    revalidatePath("/cobranzas");
    revalidatePath("/contratos");
    revalidatePath("/");

    return {
      success: true,
      numeroLiquidacion,
      fechaLiquidacion: new Date().toLocaleDateString("es-AR"),
    };
  } catch (err: any) {
    console.error("Error al registrar liquidación:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Anula una liquidación y devuelve el período a pendiente de rendición
 */
export async function anularLiquidacionAction(liquidacion_id: string, periodo_id?: string) {
  try {
    const admin = createAdminClient();

    await admin
      .from("liquidaciones")
      .update({ estado: "anulado" })
      .eq("id", liquidacion_id);

    if (periodo_id) {
      await admin
        .from("periodos_contrato")
        .update({ estado_liquidacion: "pendiente" })
        .eq("id", periodo_id);
    }

    revalidatePath("/liquidaciones");
    revalidatePath("/cobranzas");
    revalidatePath("/contratos");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
