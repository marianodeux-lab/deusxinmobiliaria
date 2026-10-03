"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PropiedadInput {
  tipo_inmueble: string;
  destino: string;
  direccion_calle: string;
  direccion_numero: string;
  piso_dpto?: string;
  unidad_funcional?: string;
  localidad: string;
  provincia: string;
  codigo_postal?: string;
  barrio?: string;
  partida_inmobiliaria?: string;
  nomenclatura_catastral?: string;
  ambientes: number;
  dormitorios: number;
  banios: number;
  cocheras: number;
  superficie_total?: string;
  superficie_cubierta?: string;
  expensas_estimadas?: string;
  notas?: string;

  // Publicación Web
  publicar_en_vidriera?: boolean;
  operacion_web?: "alquiler" | "venta" | "temporal";
  moneda_web?: "ARS" | "USD";
  precio_web?: string;
  mostrar_precio_web?: boolean;
  destacada_web?: boolean;
  titulo_web?: string;
  descripcion_web?: string;
  imagen_web?: string;

  // Propietarios / Titulares con splits y honorarios
  propietarios: Array<{
    id: string;
    nombre: string;
    cuit: string;
    cbu_alias: string;
    porcentaje: number;
    honorario_porcentual: number;
  }>;
}

/**
 * Obtiene el tenant activo para el contexto de la sesión o tenant demo por defecto
 */
async function getActiveTenantId(supabase: any): Promise<string> {
  // 1. Intentar obtener el tenant del usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: tenantUsuario } = await supabase
      .from("tenant_usuarios")
      .select("tenant_id")
      .eq("usuario_id", user.id)
      .eq("activo", true)
      .single();

    if (tenantUsuario?.tenant_id) {
      return tenantUsuario.tenant_id;
    }
  }

  // 2. Si es entorno local o demo, buscar o crear el tenant default 'DeusX Inmobiliarias'
  const { data: existingTenant } = await supabase
    .from("tenants")
    .select("id")
    .limit(1)
    .single();

  if (existingTenant?.id) {
    return existingTenant.id;
  }

  // Si no existe ninguno, crear el primer tenant maestro
  const { data: newTenant, error } = await supabase
    .from("tenants")
    .insert({
      nombre_fantasia: "DeusX Inmobiliarias",
      cuit: "30-71829401-9",
      slug: "deus-propiedades",
      whatsapp_consultas: "+54 9 223 512-3456",
      color_marca: "#004d40",
    })
    .select("id")
    .single();

  if (error || !newTenant) {
    throw new Error("No se pudo inicializar el tenant principal: " + error?.message);
  }

  return newTenant.id;
}

/**
 * Server Action: Crear una nueva propiedad en Supabase
 */
export async function crearPropiedadAction(input: PropiedadInput) {
  try {
    const supabase = await createClient();
    const tenantId = await getActiveTenantId(supabase);

    // 1. Insertar la propiedad
    const { data: propiedad, error: propError } = await supabase
      .from("propiedades")
      .insert({
        tenant_id: tenantId,
        tipo_inmueble: input.tipo_inmueble,
        destino: input.destino,
        direccion_calle: input.direccion_calle,
        direccion_numero: input.direccion_numero,
        piso_dpto: input.piso_dpto || null,
        unidad_funcional: input.unidad_funcional || null,
        localidad: input.localidad,
        provincia: input.provincia,
        codigo_postal: input.codigo_postal || null,
        barrio: input.barrio || null,
        partida_inmobiliaria: input.partida_inmobiliaria || null,
        nomenclatura_catastral: input.nomenclatura_catastral || null,
        ambientes: Number(input.ambientes) || 1,
        dormitorios: Number(input.dormitorios) || 0,
        banios: Number(input.banios) || 1,
        cocheras: Number(input.cocheras) || 0,
        superficie_total: input.superficie_total ? Number(input.superficie_total) : null,
        superficie_cubierta: input.superficie_cubierta ? Number(input.superficie_cubierta) : null,
        expensas_estimadas: input.expensas_estimadas ? Number(input.expensas_estimadas) : null,
        notas: input.notas || null,

        // Campos de Vidriera Online
        publicar_en_vidriera: input.publicar_en_vidriera ?? true,
        operacion_web: input.operacion_web || "alquiler",
        moneda_web: input.moneda_web || "ARS",
        precio_web: input.precio_web ? Number(input.precio_web) : null,
        mostrar_precio_web: input.mostrar_precio_web ?? true,
        destacada_web: input.destacada_web ?? false,
        titulo_web: input.titulo_web || null,
        descripcion_web: input.descripcion_web || null,
        fotos_web: input.imagen_web ? [input.imagen_web] : [],
      })
      .select("id")
      .single();

    if (propError || !propiedad) {
      console.error("Error al crear propiedad en Supabase:", propError);
      return { success: false, error: propError?.message || "Error al insertar propiedad" };
    }

    // 2. Asociar los propietarios (CRM personas & cotitularidad)
    for (const prop of input.propietarios) {
      // Verificar si la persona existe en personas o insertarla
      let personaId = prop.id;
      if (prop.id.startsWith("p-")) {
        // ID mock, buscar o insertar en tabla personas
        const { data: personaDb } = await supabase
          .from("personas")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("documento_numero", prop.cuit.replace(/[^0-9]/g, ""))
          .single();

        if (personaDb?.id) {
          personaId = personaDb.id;
        } else {
          const { data: nuevaPersona } = await supabase
            .from("personas")
            .insert({
              tenant_id: tenantId,
              nombre_completo: prop.nombre,
              tipo_persona: "fisica",
              documento_tipo: "CUIT",
              documento_numero: prop.cuit.replace(/[^0-9]/g, "") || "00000000000",
              cbu_alias: prop.cbu_alias || null,
            })
            .select("id")
            .single();

          if (nuevaPersona?.id) {
            personaId = nuevaPersona.id;
          }
        }
      }
    }

    revalidatePath("/propiedades");
    revalidatePath(`/portal/[tenant_slug]`);
    revalidatePath("/");

    return { success: true, propiedadId: propiedad.id };
  } catch (err: any) {
    console.error("Excepción en crearPropiedadAction:", err);
    return { success: false, error: err.message || "Error interno del servidor" };
  }
}

/**
 * Server Action: Obtener propiedades del tenant actual
 */
export async function getPropiedadesAction() {
  try {
    const supabase = await createClient();
    const tenantId = await getActiveTenantId(supabase);

    const { data, error } = await supabase
      .from("propiedades")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("creado_al", { ascending: false });

    if (error) {
      console.error("Error al obtener propiedades:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Excepción en getPropiedadesAction:", err);
    return [];
  }
}
