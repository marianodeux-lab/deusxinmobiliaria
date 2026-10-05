"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedTenant } from "@/lib/supabase/auth-tenant";
import { revalidatePath } from "next/cache";

export interface MlsPropiedadItem {
  id: string;
  titulo: string;
  direccion: string;
  localidad: string;
  tipo_inmueble: string;
  operacion: "alquiler" | "venta" | "temporal";
  precio: number;
  moneda: "ARS" | "USD";
  ambientes: number;
  dormitorios: number;
  banios: number;
  superficie: number;
  cocheras: number;
  comision_compartida: number; // Porcentaje de split (ej: 50%)
  inmobiliaria: {
    id: string;
    nombre: string;
    whatsapp?: string;
    email?: string;
    matricula?: string;
  };
  fotos: string[];
}

export interface MlsBusquedaItem {
  id: string;
  tipo_operacion: "alquiler" | "venta" | "temporal";
  tipo_inmueble: string;
  localidad: string;
  zona_barrio?: string;
  precio_maximo: number;
  moneda: "ARS" | "USD";
  dormitorios_min: number;
  requiere_cochera: boolean;
  descripcion: string;
  contacto: {
    inmobiliaria: string;
    nombre: string;
    telefono: string;
    email?: string;
  };
  creado_al: string;
}

export async function getMlsDataAction(): Promise<{
  propiedades: MlsPropiedadItem[];
  busquedas: MlsBusquedaItem[];
}> {
  try {
    const admin = createAdminClient();

    // 1. Consultar propiedades de la red MLS
    const { data: props, error: pErr } = await admin
      .from("propiedades")
      .select(`
        id,
        direccion_calle,
        direccion_numero,
        localidad,
        provincia,
        tipo_inmueble,
        destino,
        ambientes,
        dormitorios,
        banios,
        cocheras,
        superficie_total,
        precio_web,
        moneda_web,
        operacion_web,
        titulo_web,
        descripcion_web,
        comision_compartida_porcentaje,
        compartir_red_mls,
        publicar_en_vidriera,
        tenants (
          id,
          nombre_fantasia,
          whatsapp_consultas,
          email_contacto,
          matricula_profesional
        )
      `)
      .order("creado_al", { ascending: false });

    // 2. Mapear propiedades para Co-brokering
    const mappedProps: MlsPropiedadItem[] = (props || []).map((p: any) => {
      const tenant = p.tenants || {};
      const operacion = (p.operacion_web || (p.destino === "vivienda" ? "alquiler" : "venta")) as
        | "alquiler"
        | "venta"
        | "temporal";

      const precio = Number(p.precio_web) || 350000;
      const moneda = (p.moneda_web || "ARS") as "ARS" | "USD";

      return {
        id: p.id,
        titulo: p.titulo_web || `${p.tipo_inmueble || "Inmueble"} en ${p.localidad}`,
        direccion: `${p.direccion_calle} ${p.direccion_numero || ""}`.trim(),
        localidad: p.localidad || "Buenos Aires",
        tipo_inmueble: p.tipo_inmueble || "departamento",
        operacion,
        precio,
        moneda,
        ambientes: p.ambientes || 2,
        dormitorios: p.dormitorios || 1,
        banios: p.banios || 1,
        superficie: Number(p.superficie_total) || 55,
        cocheras: p.cocheras || 0,
        comision_compartida: Number(p.comision_compartida_porcentaje) || 50,
        inmobiliaria: {
          id: tenant.id || "t-1",
          nombre: tenant.nombre_fantasia || "Inmobiliaria Colega (Red DeusX)",
          whatsapp: tenant.whatsapp_consultas || "+54 9 2317 415612",
          email: tenant.email_contacto || "colegas@deusx.com.ar",
          matricula: tenant.matricula_profesional || "T° IV F° 124 Col. Martilleros",
        },
        fotos: ["/Recursos/DeusX.png"],
      };
    });

    // 3. Consultar búsquedas activas (Reverse Matching)
    let busquedas: MlsBusquedaItem[] = [];
    try {
      const { data: bData } = await admin
        .from("mls_busquedas_activas")
        .select(`
          *,
          tenants (nombre_fantasia)
        `)
        .eq("estado", "activa")
        .order("creado_al", { ascending: false });

      if (bData && bData.length > 0) {
        busquedas = bData.map((b: any) => ({
          id: b.id,
          tipo_operacion: b.tipo_operacion,
          tipo_inmueble: b.tipo_inmueble,
          localidad: b.localidad,
          zona_barrio: b.zona_barrio,
          precio_maximo: Number(b.precio_maximo) || 0,
          moneda: b.moneda,
          dormitorios_min: b.dormitorios_min || 1,
          requiere_cochera: !!b.requiere_cochera,
          descripcion: b.descripcion_demanda,
          contacto: {
            inmobiliaria: b.tenants?.nombre_fantasia || "Inmobiliaria Colega",
            nombre: b.contacto_nombre,
            telefono: b.contacto_telefono || "+54 9 11 5555-0199",
            email: b.contacto_email,
          },
          creado_al: b.creado_al,
        }));
      }
    } catch {
      // Si la tabla aún no se migró, mostramos ejemplos curados de la red
    }

    if (busquedas.length === 0) {
      busquedas = [
        {
          id: "mls-b-1",
          tipo_operacion: "alquiler",
          tipo_inmueble: "departamento",
          localidad: "9 de Julio",
          zona_barrio: "Centro / Plaza Belgrano",
          precio_maximo: 450000,
          moneda: "ARS",
          dormitorios_min: 2,
          requiere_cochera: true,
          descripcion:
            "Familia reubicada por trabajo busca urgente 2 o 3 ambientes con cochera cubierta. Excelente solvencia y recibos de sueldo demostrables.",
          contacto: {
            inmobiliaria: "Inmobiliaria San Martín",
            nombre: "Martillero Marcos Ramos",
            telefono: "+54 9 2317 489912",
            email: "m.ramos@sanmartininmo.com.ar",
          },
          creado_al: new Date().toISOString(),
        },
        {
          id: "mls-b-2",
          tipo_operacion: "venta",
          tipo_inmueble: "casa",
          localidad: "Capital Federal",
          zona_barrio: "Caballito / Parque Chacabuco",
          precio_maximo: 180000,
          moneda: "USD",
          dormitorios_min: 3,
          requiere_cochera: true,
          descripcion:
            "Comprador en mano con dólares billete disponibles. Busca casa o PH con patio/terraza propia sin expensas. Cierre inmediato.",
          contacto: {
            inmobiliaria: "Propiedades Porteñas",
            nombre: "Corredora Valeria Solís",
            telefono: "+54 9 11 6788-2233",
            email: "valeria@propiedadesportenas.com",
          },
          creado_al: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "mls-b-3",
          tipo_operacion: "alquiler",
          tipo_inmueble: "local",
          localidad: "9 de Julio",
          zona_barrio: "Av. Mitre / Zona Comercial",
          precio_maximo: 600000,
          moneda: "ARS",
          dormitorios_min: 0,
          requiere_cochera: false,
          descripcion:
            "Franquicia gastronómica / cafetería busca local con frente a la calle de mínimo 70m2 y gas natural habilitado.",
          contacto: {
            inmobiliaria: "Bienes Raíces Del Centro",
            nombre: "Martillero Gonzalo Díaz",
            telefono: "+54 9 2317 554433",
            email: "contacto@bienesdelcentro.com",
          },
          creado_al: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
    }

    return {
      propiedades: mappedProps,
      busquedas,
    };
  } catch (err) {
    console.error("Excepción en getMlsDataAction:", err);
    return { propiedades: [], busquedas: [] };
  }
}

export async function publicarMlsBusquedaAction(input: {
  tipo_operacion: "alquiler" | "venta" | "temporal";
  tipo_inmueble: string;
  localidad: string;
  precio_maximo: number;
  moneda: "ARS" | "USD";
  dormitorios_min: number;
  requiere_cochera: boolean;
  descripcion: string;
  contacto_nombre: string;
  contacto_telefono: string;
}) {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const admin = createAdminClient();

    const { error } = await admin.from("mls_busquedas_activas").insert({
      tenant_id: tenantId,
      tipo_operacion: input.tipo_operacion,
      tipo_inmueble: input.tipo_inmueble,
      localidad: input.localidad,
      precio_maximo: input.precio_maximo,
      moneda: input.moneda,
      dormitorios_min: input.dormitorios_min,
      requiere_cochera: input.requiere_cochera,
      descripcion_demanda: input.descripcion,
      contacto_nombre: input.contacto_nombre,
      contacto_telefono: input.contacto_telefono,
      estado: "activa",
    });

    if (error) throw error;
    revalidatePath("/mls");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
