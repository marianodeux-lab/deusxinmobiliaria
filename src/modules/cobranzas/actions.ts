"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface PeriodoCobranzaItem {
  id: string;
  contrato_id: string;
  carpeta_numero: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_alquiler: number;
  monto_expensas: number;
  monto_servicios: number;
  monto_punitorios: number;
  total_exigible: number;
  fecha_vencimiento: string;
  estado_cobranza: "cobrado" | "pendiente" | "mora" | "parcial" | "anulado";
  estado_liquidacion: "pendiente" | "liquidado" | "no_aplica";
  dias_mora: number;
  moneda: "ARS" | "USD";
  inmueble: {
    direccion: string;
    localidad: string;
  };
  inquilino: {
    nombre: string;
    documento: string;
    telefono?: string;
  };
  propietario: {
    nombre: string;
    documento: string;
    telefono?: string;
    cbu_alias?: string;
  };
  recibo_emitido?: {
    numero: string;
    fecha: string;
    medio_pago: string;
  };
}

export interface CobranzasKpis {
  totalExigibleArs: number;
  totalCobradoArs: number;
  totalPendienteArs: number;
  totalMoraArs: number;
  totalARendirArs: number;
  porcentajeCobrado: number;
  cantidadTotal: number;
  cantidadCobrados: number;
  cantidadPendientes: number;
  cantidadMora: number;
  cantidadARendir: number;
}

export interface RegistrarCobranzaInput {
  periodo_id?: string;
  contrato_id: string;
  carpeta_numero: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_alquiler: number;
  monto_expensas: number;
  monto_servicios: number;
  monto_punitorios: number;
  total_cobrado: number;
  medio_pago: string;
  referencia_pago?: string;
  observaciones?: string;
}

export interface HistorialReciboItem {
  id: string;
  numero_recibo: string;
  fecha_cobro: string;
  medio_pago: string;
  monto_total_cobrado: number;
  comprobante_referencia?: string;
  observaciones?: string;
  carpeta_numero: string;
  inquilino_nombre: string;
  inmueble_direccion: string;
  anulado: boolean;
  creado_al: string;
}

/**
 * Obtiene los períodos exigibles para el mes y año solicitados con métricas KPI consolidadas
 */
export async function getPeriodosCobranzaAction(filtro?: {
  mes?: number;
  anio?: number;
}): Promise<{
  success: boolean;
  items: PeriodoCobranzaItem[];
  kpis: CobranzasKpis;
  periodo_seleccionado: { mes: number; anio: number };
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const hoy = new Date();
    const mes = filtro?.mes ?? hoy.getMonth() + 1;
    const anio = filtro?.anio ?? hoy.getFullYear();

    // 1. Consultar periodos_contrato con relaciones
    const { data: periodos, error: pErr } = await admin
      .from("periodos_contrato")
      .select(`
        id,
        tenant_id,
        contrato_id,
        periodo_mes,
        periodo_anio,
        monto_alquiler,
        monto_expensas_ordinarias,
        monto_servicios_tasas,
        monto_punitorios_calculados,
        monto_total_exigible,
        fecha_vencimiento,
        estado_cobranza,
        estado_liquidacion,
        contratos (
          id,
          carpeta_numero,
          dia_vencimiento_pago,
          moneda_base,
          propiedades (
            direccion_calle,
            direccion_numero,
            localidad
          ),
          contrato_participantes (
            rol,
            personas (
              nombre_completo,
              documento_numero,
              telefono,
              cbu_alias
            )
          )
        ),
        cobranza_imputaciones (
          cobranza_id,
          cobranzas (
            numero_recibo,
            fecha_cobro,
            medio_pago,
            monto_total_cobrado
          )
        )
      `)
      .eq("periodo_anio", anio)
      .eq("periodo_mes", mes)
      .order("fecha_vencimiento", { ascending: true });

    if (pErr) {
      console.error("Error al consultar periodos_contrato:", pErr);
      return {
        success: false,
        items: [],
        kpis: {
          totalExigibleArs: 0,
          totalCobradoArs: 0,
          totalPendienteArs: 0,
          totalMoraArs: 0,
          totalARendirArs: 0,
          porcentajeCobrado: 0,
          cantidadTotal: 0,
          cantidadCobrados: 0,
          cantidadPendientes: 0,
          cantidadMora: 0,
          cantidadARendir: 0,
        },
        periodo_seleccionado: { mes, anio },
        error: pErr.message,
      };
    }

    const items: PeriodoCobranzaItem[] = [];

    let totalExigibleArs = 0;
    let totalCobradoArs = 0;
    let totalPendienteArs = 0;
    let totalMoraArs = 0;
    let totalARendirArs = 0;
    let cantidadCobrados = 0;
    let cantidadPendientes = 0;
    let cantidadMora = 0;
    let cantidadARendir = 0;

    for (const p of periodos || []) {
      const c = Array.isArray(p.contratos) ? p.contratos[0] : p.contratos;
      if (!c) continue;

      const prop = Array.isArray(c.propiedades) ? c.propiedades[0] : c.propiedades;
      const partes = c.contrato_participantes || [];

      const inquilinoParte = partes.find((cp: any) => cp.rol === "inquilino");
      const inquilinoPersona = inquilinoParte ? (Array.isArray(inquilinoParte.personas) ? inquilinoParte.personas[0] : inquilinoParte.personas) : null;

      const propietarioParte = partes.find((cp: any) => cp.rol === "propietario");
      const propietarioPersona = propietarioParte ? (Array.isArray(propietarioParte.personas) ? propietarioParte.personas[0] : propietarioParte.personas) : null;

      // Calcular mora dinámica
      const fechaVenc = new Date(p.fecha_vencimiento + "T00:00:00");
      const diffMs = hoy.getTime() - fechaVenc.getTime();
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let estadoFinal: "cobrado" | "pendiente" | "mora" | "parcial" | "anulado" = p.estado_cobranza as any;
      let diasMora = 0;
      let punitorios = Number(p.monto_punitorios_calculados) || 0;

      if (p.estado_cobranza === "pendiente" || p.estado_cobranza === "parcial") {
        if (diffDias > 0) {
          estadoFinal = "mora";
          diasMora = diffDias;
          // Tasa punitoria estándar 0.15% diario sobre canon de alquiler
          punitorios = Math.round(Number(p.monto_alquiler) * 0.0015 * diasMora);
        } else {
          estadoFinal = "pendiente";
          diasMora = 0;
        }
      }

      const montoAlquiler = Number(p.monto_alquiler) || 0;
      const montoExpensas = Number(p.monto_expensas_ordinarias) || 0;
      const montoServicios = Number(p.monto_servicios_tasas) || 0;
      const totalExigible = montoAlquiler + montoExpensas + montoServicios + punitorios;

      // Imputación de cobranza emitida (si existe)
      const imputacion = p.cobranza_imputaciones?.[0];
      const cob = imputacion ? (Array.isArray(imputacion.cobranzas) ? imputacion.cobranzas[0] : imputacion.cobranzas) : null;

      const reciboEmitido = cob
        ? {
            numero: cob.numero_recibo,
            fecha: cob.fecha_cobro,
            medio_pago: cob.medio_pago,
          }
        : p.estado_cobranza === "cobrado"
        ? {
            numero: `0001-${p.id.slice(-6)}`,
            fecha: p.fecha_vencimiento,
            medio_pago: "transferencia",
          }
        : undefined;

      // Sumatorias para KPIs
      totalExigibleArs += totalExigible;

      if (estadoFinal === "cobrado") {
        totalCobradoArs += totalExigible;
        cantidadCobrados++;
        if (p.estado_liquidacion !== "liquidado") {
          totalARendirArs += Math.round(montoAlquiler * 0.95); // aproximado neto
          cantidadARendir++;
        }
      } else if (estadoFinal === "mora") {
        totalMoraArs += totalExigible;
        cantidadMora++;
      } else {
        totalPendienteArs += totalExigible;
        cantidadPendientes++;
      }

      items.push({
        id: p.id,
        contrato_id: c.id,
        carpeta_numero: c.carpeta_numero || "S/N",
        periodo_mes: p.periodo_mes,
        periodo_anio: p.periodo_anio,
        monto_alquiler: montoAlquiler,
        monto_expensas: montoExpensas,
        monto_servicios: montoServicios,
        monto_punitorios: punitorios,
        total_exigible: totalExigible,
        fecha_vencimiento: p.fecha_vencimiento,
        estado_cobranza: estadoFinal,
        estado_liquidacion: p.estado_liquidacion,
        dias_mora: diasMora,
        moneda: c.moneda_base || "ARS",
        inmueble: {
          direccion: `${prop?.direccion_calle || "Calle"} ${prop?.direccion_numero || ""}`.trim(),
          localidad: prop?.localidad || "Capital Federal",
        },
        inquilino: {
          nombre: inquilinoPersona?.nombre_completo || "Inquilino no registrado",
          documento: inquilinoPersona?.documento_numero || "DNI S/N",
          telefono: inquilinoPersona?.telefono,
        },
        propietario: {
          nombre: propietarioPersona?.nombre_completo || "Propietario no registrado",
          documento: propietarioPersona?.documento_numero || "DNI S/N",
          telefono: propietarioPersona?.telefono,
          cbu_alias: propietarioPersona?.cbu_alias,
        },
        recibo_emitido: reciboEmitido,
      });
    }

    const cantidadTotal = items.length;
    const porcentajeCobrado = cantidadTotal > 0 ? Math.round((cantidadCobrados / cantidadTotal) * 100) : 0;

    return {
      success: true,
      items,
      kpis: {
        totalExigibleArs,
        totalCobradoArs,
        totalPendienteArs,
        totalMoraArs,
        totalARendirArs,
        porcentajeCobrado,
        cantidadTotal,
        cantidadCobrados,
        cantidadPendientes,
        cantidadMora,
        cantidadARendir,
      },
      periodo_seleccionado: { mes, anio },
    };
  } catch (err: any) {
    console.error("Excepción en getPeriodosCobranzaAction:", err);
    return {
      success: false,
      items: [],
      kpis: {
        totalExigibleArs: 0,
        totalCobradoArs: 0,
        totalPendienteArs: 0,
        totalMoraArs: 0,
        totalARendirArs: 0,
        porcentajeCobrado: 0,
        cantidadTotal: 0,
        cantidadCobrados: 0,
        cantidadPendientes: 0,
        cantidadMora: 0,
        cantidadARendir: 0,
      },
      periodo_seleccionado: { mes: 10, anio: 2026 },
      error: err.message,
    };
  }
}

/**
 * Registra formalmente el cobro, asienta el recibo en 'cobranzas' y actualiza el período
 */
export async function registrarCobranzaAction(input: RegistrarCobranzaInput) {
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

    // 2. Localizar o crear el período de contrato
    let periodoId = input.periodo_id;

    if (!periodoId) {
      const { data: periodoExist } = await admin
        .from("periodos_contrato")
        .select("id")
        .eq("contrato_id", input.contrato_id)
        .eq("periodo_anio", input.periodo_anio)
        .eq("periodo_mes", input.periodo_mes)
        .maybeSingle();

      if (periodoExist) {
        periodoId = periodoExist.id;
      }
    }

    if (periodoId) {
      await admin
        .from("periodos_contrato")
        .update({
          estado_cobranza: "cobrado",
          monto_punitorios_calculados: input.monto_punitorios,
          monto_expensas_ordinarias: input.monto_expensas,
          monto_servicios_tasas: input.monto_servicios,
        })
        .eq("id", periodoId);
    } else {
      const { data: nuevoPeriodo, error: pErr } = await admin
        .from("periodos_contrato")
        .insert({
          tenant_id: tenantId,
          contrato_id: input.contrato_id,
          periodo_mes: input.periodo_mes,
          periodo_anio: input.periodo_anio,
          monto_alquiler: input.monto_alquiler,
          monto_expensas_ordinarias: input.monto_expensas,
          monto_servicios_tasas: input.monto_servicios,
          monto_punitorios_calculados: input.monto_punitorios,
          fecha_vencimiento: `${input.periodo_anio}-${String(input.periodo_mes).padStart(2, "0")}-10`,
          estado_cobranza: "cobrado",
          estado_liquidacion: "pendiente",
        })
        .select()
        .single();

      if (pErr) throw pErr;
      periodoId = nuevoPeriodo.id;
    }

    // 3. Generar número de recibo correlativo
    const numeroRecibo = `0001-${Date.now().toString().slice(-6)}`;
    const fechaHoy = new Date().toISOString().split("T")[0];

    // 4. Asentar en la tabla cobranzas
    const medioPagoFormateado = input.medio_pago.toLowerCase().includes("efectivo")
      ? "efectivo"
      : input.medio_pago.toLowerCase().includes("cheque")
      ? "cheque"
      : input.medio_pago.toLowerCase().includes("deposito")
      ? "deposito"
      : "transferencia";

    const { data: nuevaCobranza, error: cobErr } = await admin
      .from("cobranzas")
      .insert({
        tenant_id: tenantId,
        contrato_id: input.contrato_id,
        numero_recibo: numeroRecibo,
        fecha_cobro: fechaHoy,
        medio_pago: medioPagoFormateado,
        moneda_cobro: "ARS",
        monto_total_cobrado: input.total_cobrado,
        tipo_cambio_aplicado: 1.0,
        monto_equivalente_moneda_base: input.total_cobrado,
        comprobante_referencia: input.referencia_pago,
        observaciones: input.observaciones,
        anulado: false,
      })
      .select()
      .single();

    if (cobErr) {
      console.error("Error al registrar cobranza en ledger:", cobErr);
    } else if (nuevaCobranza && periodoId) {
      // 5. Imputar cobro al período
      await admin.from("cobranza_imputaciones").insert({
        cobranza_id: nuevaCobranza.id,
        periodo_contrato_id: periodoId,
        monto_imputado_alquiler: input.monto_alquiler,
        monto_imputado_expensas: input.monto_expensas,
        monto_imputado_servicios: input.monto_servicios,
        monto_imputado_punitorios: input.monto_punitorios,
        monto_imputado_otros: 0,
      });
    }

    revalidatePath("/contratos");
    revalidatePath("/cobranzas");
    revalidatePath("/");

    return {
      success: true,
      numeroRecibo,
      fechaEmision: new Date().toLocaleDateString("es-AR"),
    };
  } catch (err: any) {
    console.error("Error al registrar cobranza:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene el historial de comprobantes/recibos emitidos
 */
export async function getHistorialRecibosAction(limit = 50): Promise<{
  success: boolean;
  recibos: HistorialReciboItem[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("cobranzas")
      .select(`
        id,
        numero_recibo,
        fecha_cobro,
        medio_pago,
        monto_total_cobrado,
        comprobante_referencia,
        observaciones,
        anulado,
        creado_al,
        contratos (
          carpeta_numero,
          propiedades (
            direccion_calle,
            direccion_numero,
            localidad
          ),
          contrato_participantes (
            rol,
            personas (
              nombre_completo
            )
          )
        )
      `)
      .order("creado_al", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error al consultar historial de recibos:", error);
      return { success: false, recibos: [], error: error.message };
    }

    const recibos: HistorialReciboItem[] = (data || []).map((c: any) => {
      const contrato = Array.isArray(c.contratos) ? c.contratos[0] : c.contratos;
      const prop = contrato?.propiedades ? (Array.isArray(contrato.propiedades) ? contrato.propiedades[0] : contrato.propiedades) : null;
      const inq = contrato?.contrato_participantes?.find((p: any) => p.rol === "inquilino");
      const inqPersona = inq?.personas ? (Array.isArray(inq.personas) ? inq.personas[0] : inq.personas) : null;

      return {
        id: c.id,
        numero_recibo: c.numero_recibo,
        fecha_cobro: c.fecha_cobro,
        medio_pago: c.medio_pago,
        monto_total_cobrado: Number(c.monto_total_cobrado) || 0,
        comprobante_referencia: c.comprobante_referencia,
        observaciones: c.observaciones,
        carpeta_numero: contrato?.carpeta_numero || "S/N",
        inquilino_nombre: inqPersona?.nombre_completo || "Inquilino",
        inmueble_direccion: prop ? `${prop.direccion_calle} ${prop.direccion_numero || ""}`.trim() : "Propiedad",
        anulado: !!c.anulado,
        creado_al: c.creado_al,
      };
    });

    return { success: true, recibos };
  } catch (err: any) {
    console.error("Excepción en getHistorialRecibosAction:", err);
    return { success: false, recibos: [], error: err.message };
  }
}
