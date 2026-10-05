import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthenticatedTenantContext {
  user: {
    id: string;
    email?: string;
  };
  tenantId: string;
  rol: string;
}

/**
 * Obtiene el usuario autenticado y su tenant_id activo.
 * Lanza un error si no hay sesión activa o si no tiene tenant asignado.
 */
export async function requireAuthenticatedTenant(): Promise<AuthenticatedTenantContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Acceso no autorizado: Debe iniciar sesión.");
  }

  // Buscar el tenant del usuario mediante service role para evitar RLS cíclicos en tenant_usuarios
  const admin = createAdminClient();
  const { data: tu, error: tuError } = await admin
    .from("tenant_usuarios")
    .select("tenant_id, rol")
    .eq("usuario_id", user.id)
    .eq("activo", true)
    .single();

  if (tuError || !tu?.tenant_id) {
    throw new Error("Acceso restringido: No tiene una inmobiliaria activa asignada.");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    tenantId: tu.tenant_id,
    rol: tu.rol,
  };
}

/**
 * Obtiene el usuario y tenant si están disponibles, sin lanzar error si es anónimo.
 */
export async function getOptionalAuthenticatedTenant(): Promise<AuthenticatedTenantContext | null> {
  try {
    return await requireAuthenticatedTenant();
  } catch {
    return null;
  }
}
