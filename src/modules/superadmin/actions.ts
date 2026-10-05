"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/actions";

export interface TenantAdminItem {
  id: string;
  nombre_fantasia: string;
  razon_social?: string;
  cuit: string;
  email?: string;
  telefono?: string;
  slug?: string;
  custom_domain?: string;
  plan_saas: "starter" | "pro" | "enterprise";
  estado_licencia: "activa" | "prueba" | "vencida" | "suspendida";
  precio_mensual: number;
  propiedades_count: number;
  contratos_count: number;
  usuarios_count: number;
  creado_al: string;
}

export interface SuperAdminMetrics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  totalPropiedades: number;
  totalContratos: number;
  tenants: TenantAdminItem[];
}

export async function getSuperAdminDataAction(): Promise<SuperAdminMetrics> {
  await requireSuperAdmin();
  try {
    const admin = createAdminClient();

    // 1. Obtener todos los tenants
    const { data: tenants, error: tErr } = await admin
      .from("tenants")
      .select("*")
      .order("creado_al", { ascending: false });

    if (tErr || !tenants) {
      console.error("Error al obtener tenants:", tErr);
      return getEmptyMetrics();
    }

    // 2. Obtener conteo de propiedades agrupado por tenant
    const { data: props } = await admin.from("propiedades").select("id, tenant_id");
    const { data: contratos } = await admin.from("contratos").select("id, tenant_id");
    const { data: usuarios } = await admin.from("tenant_usuarios").select("id, tenant_id");

    const propsCountMap = new Map<string, number>();
    props?.forEach((p) => {
      propsCountMap.set(p.tenant_id, (propsCountMap.get(p.tenant_id) || 0) + 1);
    });

    const contratosCountMap = new Map<string, number>();
    contratos?.forEach((c) => {
      contratosCountMap.set(c.tenant_id, (contratosCountMap.get(c.tenant_id) || 0) + 1);
    });

    const usuariosCountMap = new Map<string, number>();
    usuarios?.forEach((u) => {
      usuariosCountMap.set(u.tenant_id, (usuariosCountMap.get(u.tenant_id) || 0) + 1);
    });

    // 3. Mapear cada tenant con sus métricas
    const tenantItems: TenantAdminItem[] = tenants.map((t) => {
      const plan = (t.plan_saas || t.configuracion?.plan || "pro") as "starter" | "pro" | "enterprise";
      const estado = (t.estado_licencia || t.configuracion?.estado_licencia || "activa") as
        | "activa"
        | "prueba"
        | "vencida"
        | "suspendida";

      const precio =
        t.precio_suscripcion_mensual ||
        (plan === "enterprise" ? 120000 : plan === "pro" ? 75000 : 45000);

      return {
        id: t.id,
        nombre_fantasia: t.nombre_fantasia || "Inmobiliaria sin nombre",
        razon_social: t.razon_social || t.nombre_fantasia,
        cuit: t.cuit || "S/D",
        email: t.email || "contacto@inmobiliaria.com",
        telefono: t.telefono || "S/D",
        slug: t.slug || t.configuracion?.slug || "inmo",
        custom_domain: t.custom_domain || null,
        plan_saas: plan,
        estado_licencia: estado,
        precio_mensual: precio,
        propiedades_count: propsCountMap.get(t.id) || 0,
        contratos_count: contratosCountMap.get(t.id) || 0,
        usuarios_count: usuariosCountMap.get(t.id) || 1,
        creado_al: t.creado_al || new Date().toISOString(),
      };
    });

    // 4. Calcular métricas SaaS globales
    const activeTenants = tenantItems.filter((t) => t.estado_licencia === "activa").length;
    const trialTenants = tenantItems.filter((t) => t.estado_licencia === "prueba").length;
    const suspendedTenants = tenantItems.filter((t) => t.estado_licencia === "suspendida").length;

    const mrr = tenantItems
      .filter((t) => t.estado_licencia === "activa" || t.estado_licencia === "prueba")
      .reduce((sum, t) => sum + t.precio_mensual, 0);

    return {
      totalTenants: tenantItems.length,
      activeTenants,
      trialTenants,
      suspendedTenants,
      mrr,
      arr: mrr * 12,
      totalPropiedades: props?.length || 0,
      totalContratos: contratos?.length || 0,
      tenants: tenantItems,
    };
  } catch (err) {
    console.error("Excepción en getSuperAdminDataAction:", err);
    return getEmptyMetrics();
  }
}

export async function toggleTenantEstadoAction(tenantId: string, nuevoEstado: string) {
  await requireSuperAdmin();
  try {
    const admin = createAdminClient();

    // Actualizamos tanto la columna nativa como el fallback en configuracion JSONB
    await admin
      .from("tenants")
      .update({
        estado_licencia: nuevoEstado,
      })
      .eq("id", tenantId);

    revalidatePath("/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateTenantPlanAction(tenantId: string, nuevoPlan: string) {
  await requireSuperAdmin();
  try {
    const admin = createAdminClient();
    const precio = nuevoPlan === "enterprise" ? 120000 : nuevoPlan === "pro" ? 75000 : 45000;

    await admin
      .from("tenants")
      .update({
        plan_saas: nuevoPlan,
        precio_suscripcion_mensual: precio,
      })
      .eq("id", tenantId);

    revalidatePath("/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

function getEmptyMetrics(): SuperAdminMetrics {
  return {
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    suspendedTenants: 0,
    mrr: 0,
    arr: 0,
    totalPropiedades: 0,
    totalContratos: 0,
    tenants: [],
  };
}
