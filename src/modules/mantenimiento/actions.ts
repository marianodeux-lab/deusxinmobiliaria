"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface TicketMantenimientoItem {
  id: string;
  propiedad_id: string;
  direccion_inmueble: string;
  contrato_id?: string;
  carpeta_numero?: string;
  proveedor_id?: string;
  proveedor_nombre?: string;
  proveedor_telefono?: string;
  titulo: string;
  descripcion: string;
  estado: "abierto" | "presupuestado" | "en_curso" | "completado" | "cancelado";
  prioridad: "baja" | "media" | "alta" | "urgente";
  costo_total: number;
  imputacion_gasto: "propietario" | "inquilino" | "inmobiliaria" | "compartido";
  deducido_en_liquidacion_id?: string;
  sumado_en_cobranza_id?: string;
  creado_al: string;
  actualizado_al: string;
  inquilino_nombre?: string;
  inquilino_telefono?: string;
  propietario_nombre?: string;
  propietario_telefono?: string;
}

export interface MantenimientoKpis {
  totalTickets: number;
  abiertos: number;
  enCurso: number;
  urgentes: number;
  costoTotalMes: number;
  deduciblesPropietario: number;
}

export interface CrearTicketInput {
  propiedad_id: string;
  contrato_id?: string;
  proveedor_id?: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "urgente";
  costo_total: number;
  imputacion_gasto: "propietario" | "inquilino" | "inmobiliaria" | "compartido";
}

/**
 * Obtiene todos los tickets de mantenimiento con información cruzada de propiedades, contratos y proveedores
 */
export async function getTicketsMantenimientoAction(): Promise<{
  success: boolean;
  items: TicketMantenimientoItem[];
  propiedadesList: Array<{ id: string; direccion: string }>;
  proveedoresList: Array<{ id: string; nombre: string; telefono?: string }>;
  contratosList: Array<{ id: string; carpeta_numero: string; propiedad_id: string }>;
  kpis: MantenimientoKpis;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // 1. Obtener todos los tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets_mantenimiento")
      .select(`
        id,
        tenant_id,
        propiedad_id,
        contrato_id,
        proveedor_id,
        titulo,
        descripcion,
        estado,
        prioridad,
        costo_total,
        imputacion_gasto,
        deducido_en_liquidacion_id,
        sumado_en_cobranza_id,
        creado_al,
        actualizado_al,
        propiedades:propiedad_id (id, direccion_calle, direccion_numero, localidad),
        contratos:contrato_id (id, carpeta_numero),
        proveedor:proveedor_id (id, nombre_completo, telefono)
      `)
      .order("creado_al", { ascending: false });

    if (ticketsError) {
      console.error("Error al obtener tickets:", ticketsError);
      return {
        success: false,
        items: [],
        propiedadesList: [],
        proveedoresList: [],
        contratosList: [],
        kpis: {
          totalTickets: 0,
          abiertos: 0,
          enCurso: 0,
          urgentes: 0,
          costoTotalMes: 0,
          deduciblesPropietario: 0,
        },
        error: ticketsError.message,
      };
    }

    // 2. Auxiliares para selectores en modal de creación
    const { data: propsData } = await supabase
      .from("propiedades")
      .select("id, direccion_calle, direccion_numero, localidad")
      .order("direccion_calle");

    const propiedadesList = (propsData || []).map((p) => ({
      id: p.id,
      direccion: `${p.direccion_calle} ${p.direccion_numero || ""} (${p.localidad || "9 de Julio"})`.trim(),
    }));

    const { data: personasData } = await supabase
      .from("personas")
      .select("id, nombre_completo, telefono")
      .order("nombre_completo");

    const proveedoresList = (personasData || []).map((p) => ({
      id: p.id,
      nombre: p.nombre_completo,
      telefono: p.telefono || undefined,
    }));

    const { data: contratosData } = await supabase
      .from("contratos")
      .select("id, carpeta_numero, propiedad_id")
      .order("carpeta_numero");

    const contratosList = (contratosData || []).map((c) => ({
      id: c.id,
      carpeta_numero: c.carpeta_numero,
      propiedad_id: c.propiedad_id,
    }));

    // 3. Obtener participantes de contratos vinculados para contactar inquilino o dueño
    const contratoIds = Array.from(
      new Set((ticketsData || []).map((t) => t.contrato_id).filter(Boolean))
    ) as string[];

    const participantesMap = new Map<string, { inquilino?: { nombre: string; tel?: string }; propietario?: { nombre: string; tel?: string } }>();

    if (contratoIds.length > 0) {
      const { data: partData } = await supabase
        .from("contrato_participantes")
        .select(`
          contrato_id,
          rol,
          personas:persona_id (id, nombre_completo, telefono)
        `)
        .in("contrato_id", contratoIds);

      (partData || []).forEach((part: any) => {
        if (!participantesMap.has(part.contrato_id)) {
          participantesMap.set(part.contrato_id, {});
        }
        const entry = participantesMap.get(part.contrato_id)!;
        const persona = part.personas;
        if (persona) {
          if (part.rol === "inquilino_principal" || part.rol === "inquilino") {
            entry.inquilino = { nombre: persona.nombre_completo, tel: persona.telefono };
          } else if (part.rol === "propietario") {
            entry.propietario = { nombre: persona.nombre_completo, tel: persona.telefono };
          }
        }
      });
    }

    // 4. Mapear items
    const items: TicketMantenimientoItem[] = (ticketsData || []).map((t: any) => {
      const p = t.propiedades;
      const c = t.contratos;
      const prov = t.proveedor;
      const contactInfo = t.contrato_id ? participantesMap.get(t.contrato_id) : undefined;

      const direccion = p ? `${p.direccion_calle} ${p.direccion_numero || ""}`.trim() : "Inmueble no especificado";

      return {
        id: t.id,
        propiedad_id: t.propiedad_id,
        direccion_inmueble: direccion,
        contrato_id: t.contrato_id || undefined,
        carpeta_numero: c?.carpeta_numero || undefined,
        proveedor_id: t.proveedor_id || undefined,
        proveedor_nombre: prov?.nombre_completo || "Sin asignar",
        proveedor_telefono: prov?.telefono || undefined,
        titulo: t.titulo,
        descripcion: t.descripcion,
        estado: t.estado,
        prioridad: t.prioridad,
        costo_total: Number(t.costo_total) || 0,
        imputacion_gasto: t.imputacion_gasto,
        deducido_en_liquidacion_id: t.deducido_en_liquidacion_id || undefined,
        sumado_en_cobranza_id: t.sumado_en_cobranza_id || undefined,
        creado_al: t.creado_al,
        actualizado_al: t.actualizado_al,
        inquilino_nombre: contactInfo?.inquilino?.nombre,
        inquilino_telefono: contactInfo?.inquilino?.tel,
        propietario_nombre: contactInfo?.propietario?.nombre,
        propietario_telefono: contactInfo?.propietario?.tel,
      };
    });

    // 5. Calcular KPIs
    const kpis: MantenimientoKpis = {
      totalTickets: items.length,
      abiertos: items.filter((i) => i.estado === "abierto" || i.estado === "presupuestado").length,
      enCurso: items.filter((i) => i.estado === "en_curso").length,
      urgentes: items.filter((i) => i.prioridad === "urgente" && i.estado !== "completado" && i.estado !== "cancelado").length,
      costoTotalMes: items.reduce((acc, curr) => acc + (curr.estado !== "cancelado" ? curr.costo_total : 0), 0),
      deduciblesPropietario: items.filter((i) => i.imputacion_gasto === "propietario" && i.estado !== "cancelado").reduce((acc, curr) => acc + curr.costo_total, 0),
    };

    return {
      success: true,
      items,
      propiedadesList,
      proveedoresList,
      contratosList,
      kpis,
    };
  } catch (error: any) {
    console.error("Error en getTicketsMantenimientoAction:", error);
    return {
      success: false,
      items: [],
      propiedadesList: [],
      proveedoresList: [],
      contratosList: [],
      kpis: {
        totalTickets: 0,
        abiertos: 0,
        enCurso: 0,
        urgentes: 0,
        costoTotalMes: 0,
        deduciblesPropietario: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Cambia el estado de un ticket de mantenimiento
 */
export async function cambiarEstadoTicketAction(
  ticketId: string,
  nuevoEstado: "abierto" | "presupuestado" | "en_curso" | "completado" | "cancelado"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("tickets_mantenimiento")
      .update({
        estado: nuevoEstado,
        actualizado_al: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) {
      console.error("Error al actualizar estado del ticket:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/mantenimiento");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Crea un nuevo ticket de mantenimiento
 */
export async function crearTicketAction(
  input: CrearTicketInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Obtener tenant_id desde la propiedad
    const { data: propData, error: propErr } = await supabase
      .from("propiedades")
      .select("tenant_id")
      .eq("id", input.propiedad_id)
      .single();

    if (propErr || !propData) {
      return { success: false, error: "Propiedad no encontrada para asociar tenant" };
    }

    const { error } = await supabase.from("tickets_mantenimiento").insert([
      {
        tenant_id: propData.tenant_id,
        propiedad_id: input.propiedad_id,
        contrato_id: input.contrato_id || null,
        proveedor_id: input.proveedor_id || null,
        titulo: input.titulo.trim(),
        descripcion: input.descripcion.trim(),
        estado: "abierto",
        prioridad: input.prioridad,
        costo_total: input.costo_total || 0,
        imputacion_gasto: input.imputacion_gasto,
      },
    ]);

    if (error) {
      console.error("Error al crear ticket:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/mantenimiento");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza los datos de un ticket (costo, proveedor, imputación, etc.)
 */
export async function actualizarTicketAction(
  ticketId: string,
  data: Partial<CrearTicketInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const updatePayload: any = {
      actualizado_al: new Date().toISOString(),
    };

    if (data.titulo !== undefined) updatePayload.titulo = data.titulo.trim();
    if (data.descripcion !== undefined) updatePayload.descripcion = data.descripcion.trim();
    if (data.prioridad !== undefined) updatePayload.prioridad = data.prioridad;
    if (data.costo_total !== undefined) updatePayload.costo_total = data.costo_total;
    if (data.imputacion_gasto !== undefined) updatePayload.imputacion_gasto = data.imputacion_gasto;
    if (data.proveedor_id !== undefined) updatePayload.proveedor_id = data.proveedor_id || null;

    const { error } = await supabase
      .from("tickets_mantenimiento")
      .update(updatePayload)
      .eq("id", ticketId);

    if (error) {
      console.error("Error al actualizar ticket:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/mantenimiento");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
