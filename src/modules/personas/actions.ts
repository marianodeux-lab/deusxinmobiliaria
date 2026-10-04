"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface PersonaCRMItem {
  id: string;
  tipo_persona: "fisica" | "juridica";
  nombre_completo: string;
  documento_tipo: "DNI" | "CUIT" | "CUIL" | "PASAPORTE";
  documento_numero: string;
  email?: string;
  telefono?: string;
  telefono_secundario?: string;
  direccion?: string;
  cbu_alias?: string;
  banco_nombre?: string;
  notas?: string;
  roles: ("propietario" | "inquilino" | "garante" | "proveedor")[];
  contratos_vinculados: Array<{
    contrato_id: string;
    carpeta_numero: string;
    rol: string;
    direccion_inmueble: string;
    estado_contrato: string;
  }>;
  creado_al: string;
}

export interface PersonasKpis {
  totalPersonas: number;
  totalPropietarios: number;
  totalInquilinos: number;
  totalGarantes: number;
  totalProveedores: number;
}

export interface CrearPersonaInput {
  tipo_persona: "fisica" | "juridica";
  nombre_completo: string;
  documento_tipo: "DNI" | "CUIT" | "CUIL" | "PASAPORTE";
  documento_numero: string;
  email?: string;
  telefono?: string;
  telefono_secundario?: string;
  direccion?: string;
  cbu_alias?: string;
  banco_nombre?: string;
  notas?: string;
}

/**
 * Obtiene el listado completo de personas con sus roles y contratos asociados
 */
export async function getPersonasCRMAction(): Promise<{
  success: boolean;
  items: PersonaCRMItem[];
  kpis: PersonasKpis;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    // 1. Obtener todas las personas
    const { data: personas, error: pErr } = await admin
      .from("personas")
      .select("*")
      .order("nombre_completo", { ascending: true });

    if (pErr) {
      console.error("Error al consultar personas:", pErr);
      return {
        success: false,
        items: [],
        kpis: {
          totalPersonas: 0,
          totalPropietarios: 0,
          totalInquilinos: 0,
          totalGarantes: 0,
          totalProveedores: 0,
        },
        error: pErr.message,
      };
    }

    // 2. Obtener participaciones en contratos
    const { data: participaciones } = await admin
      .from("contrato_participantes")
      .select(`
        persona_id,
        rol,
        contratos (
          id,
          carpeta_numero,
          estado,
          propiedades (
            direccion_calle,
            direccion_numero,
            localidad
          )
        )
      `);

    // 3. Obtener técnicos en tickets de mantenimiento
    const { data: tickets } = await admin
      .from("tickets_mantenimiento")
      .select("proveedor_id")
      .not("proveedor_id", "is", null);

    const proveedoresSet = new Set((tickets || []).map((t: any) => t.proveedor_id));

    // Mapear contratos por persona
    const contratosPorPersona = new Map<string, Array<{
      contrato_id: string;
      carpeta_numero: string;
      rol: string;
      direccion_inmueble: string;
      estado_contrato: string;
    }>>();

    const rolesPorPersona = new Map<string, Set<"propietario" | "inquilino" | "garante" | "proveedor">>();

    for (const part of participaciones || []) {
      const pId = part.persona_id;
      if (!contratosPorPersona.has(pId)) {
        contratosPorPersona.set(pId, []);
      }
      if (!rolesPorPersona.has(pId)) {
        rolesPorPersona.set(pId, new Set());
      }

      const c = Array.isArray(part.contratos) ? part.contratos[0] : part.contratos;
      if (c) {
        const prop = Array.isArray(c.propiedades) ? c.propiedades[0] : c.propiedades;
        contratosPorPersona.get(pId)!.push({
          contrato_id: c.id,
          carpeta_numero: c.carpeta_numero || "S/N",
          rol: part.rol,
          direccion_inmueble: prop ? `${prop.direccion_calle} ${prop.direccion_numero || ""}`.trim() : "Inmueble",
          estado_contrato: c.estado,
        });
      }

      rolesPorPersona.get(pId)!.add(part.rol as any);
    }

    let totalPropietarios = 0;
    let totalInquilinos = 0;
    let totalGarantes = 0;
    let totalProveedores = 0;

    const items: PersonaCRMItem[] = (personas || []).map((p: any) => {
      const rolesSet = rolesPorPersona.get(p.id) || new Set();

      if (proveedoresSet.has(p.id)) {
        rolesSet.add("proveedor");
      }

      // Si no tiene rol asignado en contratos ni tickets, verificar notas o defecto inquilino
      if (rolesSet.size === 0) {
        if (p.notas?.toLowerCase().includes("proveedor") || p.notas?.toLowerCase().includes("tecnico")) {
          rolesSet.add("proveedor");
        } else {
          rolesSet.add("inquilino");
        }
      }

      const rolesArray = Array.from(rolesSet);

      if (rolesArray.includes("propietario")) totalPropietarios++;
      if (rolesArray.includes("inquilino")) totalInquilinos++;
      if (rolesArray.includes("garante")) totalGarantes++;
      if (rolesArray.includes("proveedor")) totalProveedores++;

      return {
        id: p.id,
        tipo_persona: p.tipo_persona || "fisica",
        nombre_completo: p.nombre_completo,
        documento_tipo: p.documento_tipo || "DNI",
        documento_numero: p.documento_numero,
        email: p.email || undefined,
        telefono: p.telefono || undefined,
        telefono_secundario: p.telefono_secundario || undefined,
        direccion: p.direccion || undefined,
        cbu_alias: p.cbu_alias || undefined,
        banco_nombre: p.banco_nombre || undefined,
        notas: p.notas || undefined,
        roles: rolesArray,
        contratos_vinculados: contratosPorPersona.get(p.id) || [],
        creado_al: p.creado_al,
      };
    });

    return {
      success: true,
      items,
      kpis: {
        totalPersonas: items.length,
        totalPropietarios,
        totalInquilinos,
        totalGarantes,
        totalProveedores,
      },
    };
  } catch (err: any) {
    console.error("Excepción en getPersonasCRMAction:", err);
    return {
      success: false,
      items: [],
      kpis: {
        totalPersonas: 0,
        totalPropietarios: 0,
        totalInquilinos: 0,
        totalGarantes: 0,
        totalProveedores: 0,
      },
      error: err.message,
    };
  }
}

/**
 * Crea una nueva persona en el CRM
 */
export async function crearPersonaAction(input: CrearPersonaInput) {
  try {
    const admin = createAdminClient();

    // Obtener tenantId
    const { data: tenant } = await admin.from("tenants").select("id").limit(1).single();
    if (!tenant) throw new Error("Tenant no encontrado");

    const { data, error } = await admin
      .from("personas")
      .insert({
        tenant_id: tenant.id,
        tipo_persona: input.tipo_persona,
        nombre_completo: input.nombre_completo.toUpperCase().trim(),
        documento_tipo: input.documento_tipo,
        documento_numero: input.documento_numero.replace(/[^0-9]/g, ""),
        email: input.email?.trim().toLowerCase() || null,
        telefono: input.telefono?.trim() || null,
        telefono_secundario: input.telefono_secundario?.trim() || null,
        direccion: input.direccion?.trim() || null,
        cbu_alias: input.cbu_alias?.trim() || null,
        banco_nombre: input.banco_nombre?.trim() || null,
        notas: input.notas?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/personas");
    revalidatePath("/contratos");
    revalidatePath("/liquidaciones");

    return { success: true, persona: data };
  } catch (err: any) {
    console.error("Error al crear persona:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Actualiza los datos de contacto y legajo de una persona
 */
export async function actualizarPersonaAction(id: string, input: Partial<CrearPersonaInput>) {
  try {
    const admin = createAdminClient();

    const updatePayload: any = {};
    if (input.nombre_completo) updatePayload.nombre_completo = input.nombre_completo.toUpperCase().trim();
    if (input.documento_tipo) updatePayload.documento_tipo = input.documento_tipo;
    if (input.documento_numero) updatePayload.documento_numero = input.documento_numero.replace(/[^0-9]/g, "");
    if (input.email !== undefined) updatePayload.email = input.email?.trim().toLowerCase() || null;
    if (input.telefono !== undefined) updatePayload.telefono = input.telefono?.trim() || null;
    if (input.telefono_secundario !== undefined) updatePayload.telefono_secundario = input.telefono_secundario?.trim() || null;
    if (input.direccion !== undefined) updatePayload.direccion = input.direccion?.trim() || null;
    if (input.cbu_alias !== undefined) updatePayload.cbu_alias = input.cbu_alias?.trim() || null;
    if (input.banco_nombre !== undefined) updatePayload.banco_nombre = input.banco_nombre?.trim() || null;
    if (input.notas !== undefined) updatePayload.notas = input.notas?.trim() || null;

    const { error } = await admin
      .from("personas")
      .update(updatePayload)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/personas");
    revalidatePath("/contratos");
    revalidatePath("/liquidaciones");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
