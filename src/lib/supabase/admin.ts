import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con Service Role para operaciones administrativas en el servidor.
 * NUNCA evaluar en build-time ni exponer al cliente.
 * Toda consulta que utilice este cliente DEBE filtrar explícitamente por tenant_id,
 * ya que el service role bypasea las políticas RLS.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Credenciales administrativas de Supabase no configuradas (NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
