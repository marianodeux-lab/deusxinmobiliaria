"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedTenant } from "@/lib/supabase/auth-tenant";
import { revalidatePath } from "next/cache";

export interface ReservaTemporariaItem {
  id: string;
  carpeta_numero: string;
  propiedad_id: string;
  direccion_inmueble: string;
  localidad: string;
  fecha_checkin: string; // YYYY-MM-DD
  fecha_checkout: string; // YYYY-MM-DD
  noches: number;
  moneda: "USD" | "ARS";
  tarifa_noche: number;
  total_estadia: number;
  tarifa_limpieza: number;
  deposito_garantia: number;
  huesped_nombre: string;
  huesped_telefono?: string;
  huesped_email?: string;
  huesped_origen?: string;
  adultos: number;
  ninos: number;
  estado_reserva: "confirmada" | "en_estadia" | "check_out_realizado" | "cancelada";
  estado_limpieza: "limpio" | "en_limpieza" | "sucio_check_out" | "inspeccionado";
  canal_reserva: "Directo" | "Airbnb" | "Booking.com" | "Vrbo" | "WhatsApp";
  codigo_cerradura?: string;
  observaciones?: string;
}

export interface TemporariosKpis {
  totalPropiedadesTemporales: number;
  reservasActivasMes: number;
  huespedesEnEstadia: number;
  ingresosMesUSD: number;
  ingresosMesARS: number;
  tasaOcupacionPromedio: number;
}

export interface PropiedadTemporalOption {
  id: string;
  direccion: string;
  localidad: string;
  destino: string;
}

export interface CrearReservaTemporariaInput {
  propiedad_id: string;
  fecha_checkin: string;
  fecha_checkout: string;
  moneda: "USD" | "ARS";
  tarifa_noche: number;
  tarifa_limpieza?: number;
  deposito_garantia?: number;
  huesped_nombre: string;
  huesped_telefono?: string;
  huesped_email?: string;
  huesped_origen?: string;
  adultos: number;
  ninos: number;
  canal_reserva: "Directo" | "Airbnb" | "Booking.com" | "Vrbo" | "WhatsApp";
  codigo_cerradura?: string;
  observaciones?: string;
}

/**
 * Obtiene el dashboard de Alquileres Temporarios, propiedades y reservas
 */
export async function getTemporariosHubAction(): Promise<{
  success: boolean;
  items: ReservaTemporariaItem[];
  propiedadesTemporales: PropiedadTemporalOption[];
  todasPropiedades: PropiedadTemporalOption[];
  kpis: TemporariosKpis;
  error?: string;
}> {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const supabase = createAdminClient();

    // 1. Obtener propiedades disponibles del tenant
    const { data: propsData, error: propsErr } = await supabase
      .from("propiedades")
      .select("id, direccion_calle, direccion_numero, localidad, destino")
      .eq("tenant_id", tenantId)
      .order("direccion_calle");

    if (propsErr) {
      console.error("Error al obtener propiedades temporarias:", propsErr);
      throw propsErr;
    }

    const todasPropiedades: PropiedadTemporalOption[] = (propsData || []).map((p) => ({
      id: p.id,
      direccion: `${p.direccion_calle} ${p.direccion_numero || ""}`.trim(),
      localidad: p.localidad || "Ciudad",
      destino: p.destino,
    }));

    const propiedadesTemporales = todasPropiedades.filter((p) => p.destino === "temporal");

    // 2. Obtener contratos que representen reservas temporarias del tenant
    const { data: reservasData, error: reservasErr } = await supabase
      .from("contratos")
      .select(`
        id,
        carpeta_numero,
        propiedad_id,
        estado,
        fecha_inicio,
        fecha_fin,
        moneda_base,
        valor_alquiler_actual,
        notas,
        propiedades:propiedad_id (id, direccion_calle, direccion_numero, localidad)
      `)
      .eq("tenant_id", tenantId)
      .order("fecha_inicio", { ascending: true });

    if (reservasErr) {
      console.error("Error al obtener contratos/reservas:", reservasErr);
      throw reservasErr;
    }

    // Filtrar contratos de alquiler temporario (carpeta_numero empieza con TEMP o notas tiene JSON de huesped)
    const items: ReservaTemporariaItem[] = [];

    (reservasData || []).forEach((c: any) => {
      let isTemporal = c.carpeta_numero?.startsWith("TEMP-");
      let meta: any = {};

      if (c.notas) {
        try {
          meta = JSON.parse(c.notas);
          if (meta.huesped_nombre) isTemporal = true;
        } catch {
          // Si no es JSON pero empieza con TEMP
          if (isTemporal) {
            meta = { huesped_nombre: "Huésped Registrado" };
          }
        }
      }

      if (isTemporal) {
        const checkin = new Date(c.fecha_inicio);
        const checkout = new Date(c.fecha_fin);
        const diffDays = Math.max(
          1,
          Math.round((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
        );

        const prop = c.propiedades;
        const dir = prop ? `${prop.direccion_calle} ${prop.direccion_numero || ""}`.trim() : "Inmueble";

        const totalEstadia = Number(c.valor_alquiler_actual) || meta.total_estadia || 0;
        const tarifaNoche = meta.tarifa_noche || Math.round(totalEstadia / diffDays);

        items.push({
          id: c.id,
          carpeta_numero: c.carpeta_numero,
          propiedad_id: c.propiedad_id,
          direccion_inmueble: dir,
          localidad: prop?.localidad || "Ciudad",
          fecha_checkin: c.fecha_inicio,
          fecha_checkout: c.fecha_fin,
          noches: diffDays,
          moneda: (c.moneda_base as any) || "USD",
          tarifa_noche: tarifaNoche,
          total_estadia: totalEstadia,
          tarifa_limpieza: meta.tarifa_limpieza || 0,
          deposito_garantia: meta.deposito_garantia || 0,
          huesped_nombre: meta.huesped_nombre || "Huésped Sin Nombre",
          huesped_telefono: meta.huesped_telefono || undefined,
          huesped_email: meta.huesped_email || undefined,
          huesped_origen: meta.huesped_origen || undefined,
          adultos: meta.adultos || 1,
          ninos: meta.ninos || 0,
          estado_reserva: meta.estado_reserva || (c.estado === "vigente" ? "confirmada" : "check_out_realizado"),
          estado_limpieza: meta.estado_limpieza || "limpio",
          canal_reserva: meta.canal_reserva || "Directo",
          codigo_cerradura: meta.codigo_cerradura || undefined,
          observaciones: meta.observaciones || undefined,
        });
      }
    });

    // 3. Métricas KPIs
    let ingresosUSD = 0;
    let ingresosARS = 0;
    let enEstadiaCount = 0;

    items.forEach((item) => {
      if (item.estado_reserva !== "cancelada") {
        if (item.moneda === "USD") {
          ingresosUSD += item.total_estadia;
        } else {
          ingresosARS += item.total_estadia;
        }
      }
      if (item.estado_reserva === "en_estadia") {
        enEstadiaCount++;
      }
    });

    // Tasa de ocupación estimada en base a días reservados vs 30 días
    const totalNochesMes = items
      .filter((i) => i.estado_reserva !== "cancelada")
      .reduce((acc, curr) => acc + curr.noches, 0);

    const baseNochesDisponibles = Math.max(1, propiedadesTemporales.length * 30);
    const tasaOcupacion = propiedadesTemporales.length > 0 
      ? Math.min(100, Math.round((totalNochesMes / baseNochesDisponibles) * 100))
      : 0;

    const kpis: TemporariosKpis = {
      totalPropiedadesTemporales: propiedadesTemporales.length,
      reservasActivasMes: items.filter((i) => i.estado_reserva !== "cancelada").length,
      huespedesEnEstadia: enEstadiaCount,
      ingresosMesUSD: ingresosUSD,
      ingresosMesARS: ingresosARS,
      tasaOcupacionPromedio: tasaOcupacion,
    };

    return {
      success: true,
      items,
      propiedadesTemporales,
      todasPropiedades,
      kpis,
    };
  } catch (error: any) {
    console.error("Error en getTemporariosHubAction:", error);
    return {
      success: false,
      items: [],
      propiedadesTemporales: [],
      todasPropiedades: [],
      kpis: {
        totalPropiedadesTemporales: 0,
        reservasActivasMes: 0,
        huespedesEnEstadia: 0,
        ingresosMesUSD: 0,
        ingresosMesARS: 0,
        tasaOcupacionPromedio: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Crea una nueva reserva de alquiler temporario
 */
export async function crearReservaTemporariaAction(
  input: CrearReservaTemporariaInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const supabase = createAdminClient();

    // Obtener propiedad y verificar que pertenezca al tenant autenticado
    const { data: prop, error: propErr } = await supabase
      .from("propiedades")
      .select("tenant_id")
      .eq("id", input.propiedad_id)
      .eq("tenant_id", tenantId)
      .single();

    if (propErr || !prop) {
      return { success: false, error: "Propiedad no encontrada o no autorizada" };
    }

    // Calcular noches
    const inDate = new Date(input.fecha_checkin);
    const outDate = new Date(input.fecha_checkout);
    const noches = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalEstadia = input.tarifa_noche * noches + (input.tarifa_limpieza || 0);

    const carpetaNumero = `TEMP-${Date.now().toString().slice(-6)}`;

    const metadataReserva = {
      huesped_nombre: input.huesped_nombre.trim(),
      huesped_telefono: input.huesped_telefono?.trim() || undefined,
      huesped_email: input.huesped_email?.trim() || undefined,
      huesped_origen: input.huesped_origen?.trim() || undefined,
      adultos: input.adultos || 1,
      ninos: input.ninos || 0,
      tarifa_noche: input.tarifa_noche,
      noches,
      total_estadia: totalEstadia,
      tarifa_limpieza: input.tarifa_limpieza || 0,
      deposito_garantia: input.deposito_garantia || 0,
      estado_reserva: "confirmada",
      estado_limpieza: "limpio",
      canal_reserva: input.canal_reserva,
      codigo_cerradura: input.codigo_cerradura?.trim() || undefined,
      observaciones: input.observaciones?.trim() || undefined,
    };

    const { error: insertErr } = await supabase.from("contratos").insert([
      {
        tenant_id: tenantId,
        carpeta_numero: carpetaNumero,
        propiedad_id: input.propiedad_id,
        estado: "vigente",
        fecha_inicio: input.fecha_checkin,
        fecha_fin: input.fecha_checkout,
        dia_vencimiento_pago: inDate.getDate() || 1,
        moneda_base: input.moneda,
        tipo_ajuste: "FIJO",
        frecuencia_ajuste_meses: 1,
        valor_alquiler_inicial: totalEstadia,
        valor_alquiler_actual: totalEstadia,
        notas: JSON.stringify(metadataReserva),
      },
    ]);

    if (insertErr) {
      console.error("Error al insertar reserva:", insertErr);
      return { success: false, error: insertErr.message };
    }

    revalidatePath("/temporarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el estado de la reserva (confirmada, en_estadia, check_out_realizado, cancelada)
 */
export async function actualizarEstadoReservaAction(
  reservaId: string,
  nuevoEstado: "confirmada" | "en_estadia" | "check_out_realizado" | "cancelada"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const supabase = createAdminClient();

    const { data: contrato, error: fetchErr } = await supabase
      .from("contratos")
      .select("notas, estado")
      .eq("id", reservaId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchErr || !contrato) return { success: false, error: "Reserva no encontrada" };

    let meta: any = {};
    try {
      meta = JSON.parse(contrato.notas || "{}");
    } catch {
      meta = {};
    }

    meta.estado_reserva = nuevoEstado;
    if (nuevoEstado === "check_out_realizado") {
      meta.estado_limpieza = "sucio_check_out";
    }

    const { error: updateErr } = await supabase
      .from("contratos")
      .update({
        notas: JSON.stringify(meta),
        estado: nuevoEstado === "cancelada" ? "rescindido" : "vigente",
        actualizado_al: new Date().toISOString(),
      })
      .eq("id", reservaId)
      .eq("tenant_id", tenantId);

    if (updateErr) return { success: false, error: updateErr.message };

    revalidatePath("/temporarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el estado de limpieza / housekeeping de la unidad
 */
export async function actualizarLimpiezaReservaAction(
  reservaId: string,
  nuevoEstadoLimpieza: "limpio" | "en_limpieza" | "sucio_check_out" | "inspeccionado"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const supabase = createAdminClient();

    const { data: contrato, error: fetchErr } = await supabase
      .from("contratos")
      .select("notas")
      .eq("id", reservaId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchErr || !contrato) return { success: false, error: "Reserva no encontrada" };

    let meta: any = {};
    try {
      meta = JSON.parse(contrato.notas || "{}");
    } catch {
      meta = {};
    }

    meta.estado_limpieza = nuevoEstadoLimpieza;

    const { error: updateErr } = await supabase
      .from("contratos")
      .update({
        notas: JSON.stringify(meta),
        actualizado_al: new Date().toISOString(),
      })
      .eq("id", reservaId)
      .eq("tenant_id", tenantId);

    if (updateErr) return { success: false, error: updateErr.message };

    revalidatePath("/temporarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
