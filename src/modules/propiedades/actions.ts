"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export interface PropiedadItem {
  id: string;
  codigo_interno?: string;
  direccion_calle: string;
  direccion_numero: string;
  piso_dpto?: string;
  unidad_funcional?: string;
  localidad: string;
  provincia: string;
  codigo_postal?: string;
  tipo_inmueble: string;
  destino: string;
  ambientes: number;
  dormitorios: number;
  banios: number;
  cocheras: number;
  superficie_total?: number;
  expensas_estimadas?: number;
  nomenclatura_catastral?: string;
  partida_inmobiliaria?: string;
  notas?: string;

  // Web & Vidriera
  publicar_en_vidriera: boolean;
  operacion_web: "alquiler" | "venta" | "temporal";
  moneda_web: "ARS" | "USD";
  precio_web?: number;
  mostrar_precio_web: boolean;
  destacada_web: boolean;
  titulo_web?: string;
  descripcion_web?: string;
  fotos_web?: string[];

  // Contrato activo
  contrato_activo?: {
    id: string;
    carpeta_numero: string;
    estado: string;
    valor_alquiler_actual: number;
    moneda_base: "ARS" | "USD";
    fecha_fin: string;
    inquilino_nombre?: string;
    inquilino_telefono?: string;
    propietario_nombre?: string;
    propietario_telefono?: string;
    propietario_cbu?: string;
  };

  // Propietarios
  propietarios: Array<{
    nombre: string;
    documento?: string;
    telefono?: string;
    cbu_alias?: string;
  }>;
}

export interface PropiedadesKpis {
  totalPropiedades: number;
  totalAlquiladas: number;
  totalDisponibles: number;
  totalPublicadasVidriera: number;
  tasaOcupacion: number;
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

/**
 * Server Action: Obtiene las propiedades con sus contratos vigentes, propietarios y métricas de ocupación
 */
export async function getPropiedadesHubAction(): Promise<{
  success: boolean;
  items: PropiedadItem[];
  kpis: PropiedadesKpis;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    const { data: propiedades, error } = await admin
      .from("propiedades")
      .select(`
        id,
        codigo_interno,
        direccion_calle,
        direccion_numero,
        piso_dpto,
        unidad_funcional,
        codigo_postal,
        localidad,
        provincia,
        tipo_inmueble,
        destino,
        ambientes,
        dormitorios,
        banios,
        cocheras,
        superficie_total,
        expensas_estimadas,
        nomenclatura_catastral,
        partida_inmobiliaria,
        notas,
        publicar_en_vidriera,
        operacion_web,
        moneda_web,
        precio_web,
        mostrar_precio_web,
        destacada_web,
        titulo_web,
        descripcion_web,
        fotos_web,
        contratos (
          id,
          carpeta_numero,
          estado,
          valor_alquiler_actual,
          moneda_base,
          fecha_fin,
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
      .order("creado_al", { ascending: false });

    if (error) {
      console.error("Error al obtener propiedades hub:", error);
      return {
        success: false,
        items: [],
        kpis: {
          totalPropiedades: 0,
          totalAlquiladas: 0,
          totalDisponibles: 0,
          totalPublicadasVidriera: 0,
          tasaOcupacion: 0,
        },
        error: error.message,
      };
    }

    const items: PropiedadItem[] = [];
    let totalAlquiladas = 0;
    let totalPublicadasVidriera = 0;

    for (const p of propiedades || []) {
      const contratosList = Array.isArray(p.contratos) ? p.contratos : p.contratos ? [p.contratos] : [];
      // Buscar contrato vigente
      const contratoActivo = contratosList.find((c: any) => c.estado === "vigente") || contratosList[0];

      let contratoActivoParsed = undefined;
      const propietariosList: Array<{ nombre: string; documento?: string; telefono?: string; cbu_alias?: string }> = [];

      if (contratoActivo) {
        const partes = contratoActivo.contrato_participantes || [];
        const inq = partes.find((cp: any) => cp.rol === "inquilino");
        const inqPersona = inq ? (Array.isArray(inq.personas) ? inq.personas[0] : inq.personas) : null;

        const propPartes = partes.filter((cp: any) => cp.rol === "propietario");
        for (const pp of propPartes) {
          const pers = Array.isArray(pp.personas) ? pp.personas[0] : pp.personas;
          if (pers) {
            propietariosList.push({
              nombre: pers.nombre_completo,
              documento: pers.documento_numero,
              telefono: pers.telefono,
              cbu_alias: pers.cbu_alias,
            });
          }
        }

        const primerProp = propietariosList[0];

        contratoActivoParsed = {
          id: contratoActivo.id,
          carpeta_numero: contratoActivo.carpeta_numero || "S/N",
          estado: contratoActivo.estado,
          valor_alquiler_actual: Number(contratoActivo.valor_alquiler_actual) || 0,
          moneda_base: (contratoActivo.moneda_base || "ARS") as "ARS" | "USD",
          fecha_fin: contratoActivo.fecha_fin,
          inquilino_nombre: inqPersona?.nombre_completo,
          inquilino_telefono: inqPersona?.telefono,
          propietario_nombre: primerProp?.nombre,
          propietario_telefono: primerProp?.telefono,
          propietario_cbu: primerProp?.cbu_alias,
        };

        if (contratoActivo.estado === "vigente") {
          totalAlquiladas++;
        }
      }

      if (p.publicar_en_vidriera) {
        totalPublicadasVidriera++;
      }

      items.push({
        id: p.id,
        codigo_interno: p.codigo_interno || undefined,
        direccion_calle: p.direccion_calle,
        direccion_numero: p.direccion_numero,
        piso_dpto: p.piso_dpto || undefined,
        unidad_funcional: p.unidad_funcional || undefined,
        localidad: p.localidad,
        provincia: p.provincia,
        tipo_inmueble: p.tipo_inmueble,
        destino: p.destino,
        ambientes: Number(p.ambientes) || 1,
        dormitorios: Number(p.dormitorios) || 0,
        banios: Number(p.banios) || 1,
        cocheras: Number(p.cocheras) || 0,
        superficie_total: p.superficie_total ? Number(p.superficie_total) : undefined,
        expensas_estimadas: p.expensas_estimadas ? Number(p.expensas_estimadas) : undefined,
        nomenclatura_catastral: p.nomenclatura_catastral || undefined,
        partida_inmobiliaria: p.partida_inmobiliaria || undefined,
        notas: p.notas || undefined,
        publicar_en_vidriera: !!p.publicar_en_vidriera,
        operacion_web: (p.operacion_web || "alquiler") as any,
        moneda_web: (p.moneda_web || "ARS") as any,
        precio_web: p.precio_web ? Number(p.precio_web) : undefined,
        mostrar_precio_web: p.mostrar_precio_web ?? true,
        destacada_web: !!p.destacada_web,
        titulo_web: p.titulo_web || undefined,
        descripcion_web: p.descripcion_web || undefined,
        fotos_web: Array.isArray(p.fotos_web) ? p.fotos_web : [],
        contrato_activo: contratoActivoParsed,
        propietarios: propietariosList,
      });
    }

    const totalPropiedades = items.length;
    const totalDisponibles = Math.max(0, totalPropiedades - totalAlquiladas);
    const tasaOcupacion = totalPropiedades > 0 ? Math.round((totalAlquiladas / totalPropiedades) * 100) : 0;

    return {
      success: true,
      items,
      kpis: {
        totalPropiedades,
        totalAlquiladas,
        totalDisponibles,
        totalPublicadasVidriera,
        tasaOcupacion,
      },
    };
  } catch (err: any) {
    console.error("Excepción en getPropiedadesHubAction:", err);
    return {
      success: false,
      items: [],
      kpis: {
        totalPropiedades: 0,
        totalAlquiladas: 0,
        totalDisponibles: 0,
        totalPublicadasVidriera: 0,
        tasaOcupacion: 0,
      },
      error: err.message,
    };
  }
}

/**
 * Server Action: Conmuta la visibilidad en la vidriera online pública
 */
export async function togglePublicarVidrieraAction(propiedad_id: string, publicar: boolean) {
  try {
    const admin = createAdminClient();
    await admin
      .from("propiedades")
      .update({ publicar_en_vidriera: publicar })
      .eq("id", propiedad_id);

    revalidatePath("/propiedades");
    revalidatePath("/configuracion/vidriera");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Conmuta si la propiedad es destacada en la vidriera web
 */
export async function toggleDestacadaWebAction(propiedad_id: string, destacada: boolean) {
  try {
    const admin = createAdminClient();
    await admin
      .from("propiedades")
      .update({ destacada_web: destacada })
      .eq("id", propiedad_id);

    revalidatePath("/propiedades");
    revalidatePath("/configuracion/vidriera");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
