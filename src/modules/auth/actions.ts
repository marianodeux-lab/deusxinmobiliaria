"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Iniciar Sesión con email y contraseña
 */
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Por favor, completá tu email y contraseña." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error en signInWithPassword:", error.message);
      return { success: false, error: "Credenciales inválidas o cuenta no confirmada." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al procesar el inicio de sesión." };
  }
}

/**
 * Server Action: Registro de nueva inmobiliaria (Tenant + Usuario Owner)
 */
export async function registroAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombreCompleto = formData.get("nombreCompleto") as string;
  const nombreInmobiliaria = formData.get("nombreInmobiliaria") as string;
  const cuit = formData.get("cuit") as string;
  const telefono = formData.get("telefono") as string;

  if (!email || !password || !nombreInmobiliaria || !cuit) {
    return { success: false, error: "Todos los campos obligatorios deben estar completos." };
  }

  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombreCompleto,
          nombre_inmobiliaria: nombreInmobiliaria,
        },
      },
    });

    if (authError || !authData.user) {
      console.error("Error en signUp:", authError);
      return { success: false, error: authError?.message || "No se pudo registrar el usuario." };
    }

    const userId = authData.user.id;
    const slug = nombreInmobiliaria
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 2. Crear Tenant en tabla `tenants` (usando admin client para asegurar bypass RLS inicial)
    const { data: tenant, error: tenantError } = await adminSupabase
      .from("tenants")
      .insert({
        nombre_fantasia: nombreInmobiliaria,
        cuit: cuit.replace(/[^0-9-]/g, "") || "30-00000000-0",
        email: email,
        telefono: telefono || null,
        configuracion: {
          slug: slug,
          whatsapp: telefono || null,
          color_marca: "#004d40",
        },
      })
      .select("id")
      .single();

    if (tenantError || !tenant) {
      console.error("Error al crear tenant:", tenantError);
      return { success: false, error: "Usuario creado, pero hubo un error al crear la inmobiliaria: " + tenantError?.message };
    }

    // 3. Vincular usuario con tenant en `tenant_usuarios` con rol 'owner'
    const { error: vinculoError } = await adminSupabase
      .from("tenant_usuarios")
      .insert({
        tenant_id: tenant.id,
        usuario_id: userId,
        rol: "owner",
        activo: true,
      });

    if (vinculoError) {
      console.error("Error al vincular usuario con tenant:", vinculoError);
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("Excepción en registroAction:", err);
    return { success: false, error: err.message || "Error al procesar el registro." };
  }
}

/**
 * Server Action: Cerrar sesión
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Server Action: Verificar si el usuario autenticado es el SuperAdmin (marianodeux@gmail.com)
 * El resto de los usuarios tienen denegado el acceso y visibilidad al panel.
 */
export async function isSuperAdminUserAction(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return false;
    return user.email.toLowerCase().trim() === "marianodeux@gmail.com";
  } catch {
    return false;
  }
}

