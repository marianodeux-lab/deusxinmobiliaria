"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface ResponsableComprobante {
  id: number;
  nombre: string;
  cuit: string;
  punto_venta: number;
  condicion_iva: "Monotributo" | "Responsable Inscripto" | "Exento";
  razon_social: string;
  cbu: string;
  iibb: string;
  fecha_inicio_actividades: string;
  domicilio_comercial: string;
  localidad: string;
  telefono: string;
  nombre_responsable: string;
  matricula_profesional?: string;
  logo_url?: string;
  firma_url?: string;
  afip_crt_cargado: boolean;
  afip_key_cargado: boolean;
}

export interface LinkServicio {
  id: string;
  nombre_servicio: string; // "Luz", "Agua", "Gas", "Municipalidad", etc.
  proveedor: string; // "CEYS", "ABSA", "Camuzzi", etc.
  url: string;
  formato_sugerido?: string;
}

export interface MemosConfig {
  memo_inquilinos: string;
  inquilinos_recordar: boolean;
  inquilinos_imprimir_recibo: boolean;
  memo_propietarios: string;
  propietarios_recordar: boolean;
  propietarios_imprimir_recibo: boolean;
  alerta_incremento: boolean;
}

export interface TenantConfiguracionCompleta {
  tenant_id: string;
  nombre_fantasia: string;
  razon_social?: string;
  cuit: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  responsables: ResponsableComprobante[];
  links_servicios: LinkServicio[];
  memos: MemosConfig;
  parametros_operativos: {
    moneda_defecto: "ARS" | "USD";
    dias_gracia_mora: number;
    tasa_mora_diaria: number;
    porcentaje_honorarios_defecto: number;
  };
}

const DEFAULT_CONFIG: TenantConfiguracionCompleta = {
  tenant_id: "",
  nombre_fantasia: "Deus Inmobiliaria",
  cuit: "20-33445566-9",
  responsables: [
    {
      id: 1,
      nombre: "Responsable Principal",
      cuit: "20-33445566-9",
      punto_venta: 1,
      condicion_iva: "Monotributo",
      razon_social: "Deus Juan Martin",
      cbu: "0140301303650001234567",
      iibb: "20-33445566-9",
      fecha_inicio_actividades: "2020-03-01",
      domicilio_comercial: "Arturo Frondizi 1181",
      localidad: "9 de Julio",
      telefono: "02317-415612",
      nombre_responsable: "Juan Martín Deus",
      matricula_profesional: "T° IV F° 124 Col. Martilleros Mercedes",
      afip_crt_cargado: false,
      afip_key_cargado: false,
    },
  ],
  links_servicios: [
    {
      id: "srv-1",
      nombre_servicio: "LUZ",
      proveedor: "CEYS / Edenor",
      url: "https://www.ceys.com.ar/",
      formato_sugerido: "https://www.edenor.com",
    },
    {
      id: "srv-2",
      nombre_servicio: "AGUA",
      proveedor: "Aguas Bonaerenses (ABSA)",
      url: "https://www.aguasbonaerenses.com.ar/",
      formato_sugerido: "https://www.aysa.com.ar",
    },
    {
      id: "srv-3",
      nombre_servicio: "GAS",
      proveedor: "Naturgy / Camuzzi",
      url: "https://www.naturgy.com",
      formato_sugerido: "https://www.camuzzigas.com",
    },
    {
      id: "srv-4",
      nombre_servicio: "MUNICIPALIDAD",
      proveedor: "Municipalidad de 9 de Julio",
      url: "https://www.9dejulio.gov.ar/",
      formato_sugerido: "https://www.arba.gov.ar",
    },
    {
      id: "srv-5",
      nombre_servicio: "API / RENTAS",
      proveedor: "ARBA / Rentas Provincial",
      url: "https://www.arba.gov.ar",
      formato_sugerido: "https://www.santafe.gov.ar",
    },
  ],
  memos: {
    memo_inquilinos: "Estimado Inquilino: recuerde abonar antes del 10 para evitar recargos por mora.",
    inquilinos_recordar: true,
    inquilinos_imprimir_recibo: true,
    memo_propietarios: "Estimado Propietario: su liquidación ya fue transferida a su cuenta bancaria declarada.",
    propietarios_recordar: true,
    propietarios_imprimir_recibo: false,
    alerta_incremento: true,
  },
  parametros_operativos: {
    moneda_defecto: "ARS",
    dias_gracia_mora: 10,
    tasa_mora_diaria: 0.1,
    porcentaje_honorarios_defecto: 8.0,
  },
};

export async function getConfiguracionAction(): Promise<TenantConfiguracionCompleta> {
  try {
    const admin = createAdminClient();

    // Obtener el tenant activo más reciente (el registrado por el usuario)
    const { data: tenant } = await admin
      .from("tenants")
      .select("*")
      .order("creado_al", { ascending: false })
      .limit(1)
      .single();

    if (!tenant) return DEFAULT_CONFIG;

    const conf = tenant.configuracion || {};

    return {
      tenant_id: tenant.id,
      nombre_fantasia: tenant.nombre_fantasia || DEFAULT_CONFIG.nombre_fantasia,
      razon_social: tenant.razon_social || tenant.nombre_fantasia,
      cuit: tenant.cuit || DEFAULT_CONFIG.cuit,
      email: tenant.email,
      telefono: tenant.telefono,
      direccion: tenant.direccion,
      responsables: conf.responsables || DEFAULT_CONFIG.responsables,
      links_servicios: conf.links_servicios || DEFAULT_CONFIG.links_servicios,
      memos: conf.memos || DEFAULT_CONFIG.memos,
      parametros_operativos: conf.parametros_operativos || DEFAULT_CONFIG.parametros_operativos,
    };
  } catch (err) {
    console.error("Error al obtener configuración:", err);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfiguracionAction(
  tenantId: string,
  newConfig: Partial<TenantConfiguracionCompleta>
) {
  try {
    const admin = createAdminClient();

    const { data: current } = await admin
      .from("tenants")
      .select("configuracion")
      .eq("id", tenantId)
      .single();

    const merged = {
      ...(current?.configuracion || {}),
      responsables: newConfig.responsables,
      links_servicios: newConfig.links_servicios,
      memos: newConfig.memos,
      parametros_operativos: newConfig.parametros_operativos,
    };

    const { error } = await admin
      .from("tenants")
      .update({
        nombre_fantasia: newConfig.nombre_fantasia,
        razon_social: newConfig.razon_social,
        telefono: newConfig.telefono,
        direccion: newConfig.direccion,
        configuracion: merged,
      })
      .eq("id", tenantId);

    if (error) throw error;

    revalidatePath("/configuracion");
    revalidatePath("/contratos");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Error al guardar configuración:", err);
    return { success: false, error: err.message };
  }
}
