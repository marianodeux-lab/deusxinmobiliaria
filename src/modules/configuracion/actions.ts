"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedTenant, getOptionalAuthenticatedTenant } from "@/lib/supabase/auth-tenant";
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
  nombre_fantasia: "",
  cuit: "",
  responsables: [
    {
      id: 1,
      nombre: "Responsable Principal",
      cuit: "",
      punto_venta: 1,
      condicion_iva: "Monotributo",
      razon_social: "",
      cbu: "",
      iibb: "",
      fecha_inicio_actividades: "2026-01-01",
      domicilio_comercial: "",
      localidad: "",
      telefono: "",
      nombre_responsable: "",
      matricula_profesional: "",
      afip_crt_cargado: false,
      afip_key_cargado: false,
    },
  ],
  links_servicios: [
    {
      id: "srv-1",
      nombre_servicio: "ENERGÍA ELÉCTRICA",
      proveedor: "Distribuidora Eléctrica",
      url: "https://www.edenor.com",
      formato_sugerido: "https://www.edenor.com",
    },
    {
      id: "srv-2",
      nombre_servicio: "AGUA CORRIENTE",
      proveedor: "Aguas Sanitarias",
      url: "https://www.aysa.com.ar",
      formato_sugerido: "https://www.aysa.com.ar",
    },
    {
      id: "srv-3",
      nombre_servicio: "GAS NATURAL",
      proveedor: "Distribuidora de Gas",
      url: "https://www.naturgy.com",
      formato_sugerido: "https://www.camuzzigas.com",
    },
    {
      id: "srv-4",
      nombre_servicio: "TASAS MUNICIPALES",
      proveedor: "Municipio Local",
      url: "https://www.arba.gov.ar",
      formato_sugerido: "https://www.arba.gov.ar",
    },
    {
      id: "srv-5",
      nombre_servicio: "RENTAS PROVINCIALES",
      proveedor: "Agencia de Recaudación",
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
    const auth = await getOptionalAuthenticatedTenant();
    if (!auth?.tenantId) return DEFAULT_CONFIG;

    const admin = createAdminClient();
    const { data: tenant } = await admin
      .from("tenants")
      .select("*")
      .eq("id", auth.tenantId)
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
    const auth = await requireAuthenticatedTenant();
    if (auth.tenantId !== tenantId) {
      throw new Error("No autorizado para modificar esta configuración.");
    }

    const admin = createAdminClient();

    const { data: current } = await admin
      .from("tenants")
      .select("configuracion")
      .eq("id", auth.tenantId)
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

/**
 * Server Action: Cambiar contraseña de la cuenta del usuario autenticado
 */
export async function cambiarPasswordAction(passwordActual: string, passwordNueva: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr || !user || !user.email) {
      return { success: false, error: "Sesión no válida o expirada. Por favor vuelva a iniciar sesión." };
    }

    if (!passwordNueva || passwordNueva.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    // 1. Validar la contraseña actual autenticando temporalmente
    if (passwordActual) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordActual,
      });

      if (signInErr) {
        return { success: false, error: "La contraseña actual ingresada es incorrecta." };
      }
    }

    // 2. Actualizar a la nueva contraseña
    const { error: updateErr } = await supabase.auth.updateUser({
      password: passwordNueva,
    });

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error al cambiar contraseña:", err);
    return { success: false, error: err.message || "Error al actualizar la contraseña." };
  }
}

export interface UsuarioLicenciaItem {
  id: string;
  email: string;
  rol: string;
  activo: boolean;
  creado_al: string;
  esActual: boolean;
}

/**
 * Server Action: Obtiene los operadores y responsables registrados bajo la licencia actual
 */
export async function getTenantUsuariosInfoAction(): Promise<{
  success: boolean;
  planSaas: string;
  limiteUsuarios: number;
  usuarios: UsuarioLicenciaItem[];
  error?: string;
}> {
  try {
    const { tenantId, user } = await requireAuthenticatedTenant();
    const admin = createAdminClient();

    const { data: tenant } = await admin
      .from("tenants")
      .select("plan_saas, limite_usuarios, estado_licencia")
      .eq("id", tenantId)
      .single();

    const { data: tuList } = await admin
      .from("tenant_usuarios")
      .select("usuario_id, rol, activo, creado_al")
      .eq("tenant_id", tenantId);

    const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
    const userEmailMap = new Map((authUsers || []).map((u) => [u.id, u.email || ""]));

    const usuarios: UsuarioLicenciaItem[] = (tuList || []).map((tu) => ({
      id: tu.usuario_id,
      email: userEmailMap.get(tu.usuario_id) || "Usuario registrado",
      rol: tu.rol,
      activo: tu.activo ?? true,
      creado_al: tu.creado_al || "",
      esActual: tu.usuario_id === user.id,
    }));

    return {
      success: true,
      planSaas: tenant?.plan_saas || "pro",
      limiteUsuarios: tenant?.limite_usuarios || 5,
      usuarios,
    };
  } catch (err: any) {
    console.error("Error al obtener usuarios de la licencia:", err);
    return {
      success: false,
      planSaas: "pro",
      limiteUsuarios: 5,
      usuarios: [],
      error: err.message,
    };
  }
}

/**
 * Server Action: Invita o crea un nuevo operador respetando el límite de 5 licencias
 */
export async function invitarOperadorAction(
  email: string,
  passwordTemporal: string,
  rol: "operador" | "admin" = "operador"
) {
  try {
    const { tenantId, rol: userRol } = await requireAuthenticatedTenant();
    if (userRol !== "owner" && userRol !== "admin") {
      return { success: false, error: "Solo los administradores o titulares pueden agregar responsables." };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Ingrese un correo electrónico válido." };
    }

    if (!passwordTemporal || passwordTemporal.length < 6) {
      return { success: false, error: "La contraseña temporal debe tener al menos 6 caracteres." };
    }

    const admin = createAdminClient();

    // 1. Verificar cupo de la licencia
    const { data: tenant } = await admin
      .from("tenants")
      .select("limite_usuarios")
      .eq("id", tenantId)
      .single();

    const maxUsuarios = tenant?.limite_usuarios || 5;

    const { count } = await admin
      .from("tenant_usuarios")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("activo", true);

    if ((count || 0) >= maxUsuarios) {
      return {
        success: false,
        error: `Has alcanzado el límite máximo de ${maxUsuarios} operadores para tu licencia. Contactá a soporte para ampliar tu plan.`,
      };
    }

    // 2. Verificar si el usuario ya existe en auth
    const { data: { users: existingUsers } } = await admin.auth.admin.listUsers();
    let targetUserId = existingUsers?.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;

    if (!targetUserId) {
      const { data: newUser, error: authError } = await admin.auth.admin.createUser({
        email,
        password: passwordTemporal,
        email_confirm: true,
      });

      if (authError || !newUser?.user) {
        return { success: false, error: authError?.message || "Error al registrar el usuario en autenticación." };
      }
      targetUserId = newUser.user.id;
    }

    // 3. Vincular usuario a la inmobiliaria (tenant_usuarios)
    const { error: tuError } = await admin.from("tenant_usuarios").upsert({
      tenant_id: tenantId,
      usuario_id: targetUserId,
      rol,
      activo: true,
    }, { onConflict: "tenant_id,usuario_id" });

    if (tuError) {
      return { success: false, error: tuError.message };
    }

    revalidatePath("/configuracion");
    return { success: true };
  } catch (err: any) {
    console.error("Error al invitar operador:", err);
    return { success: false, error: err.message };
  }
}

