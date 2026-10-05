"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface ContratoInput {
  propiedad_id: string;
  inquilino_id: string;
  garante_id?: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_meses: number;
  monto_alquiler_inicial: number;
  moneda: "ARS" | "USD";
  dia_vencimiento_mensual: number;
  tipo_ajuste: "ICL" | "IPC" | "UVA" | "FIJO" | "OTRO";
  frecuencia_ajuste_meses: number;
  notas?: string;
}

export async function crearContratoAction(input: ContratoInput) {
  try {
    const supabase = await createClient();

    // Obtener tenant_id de la propiedad
    const { data: propiedad, error: propError } = await supabase
      .from("propiedades")
      .select("tenant_id")
      .eq("id", input.propiedad_id)
      .single();

    if (propError || !propiedad) {
      return { success: false, error: "Propiedad no encontrada" };
    }

    const tenantId = propiedad.tenant_id;

    // 1. Insertar Contrato
    const { data: contrato, error: contError } = await supabase
      .from("contratos")
      .insert({
        tenant_id: tenantId,
        propiedad_id: input.propiedad_id,
        estado: "vigente",
        carpeta_numero: `C-${Date.now().toString().slice(-4)}`,
        fecha_inicio: input.fecha_inicio,
        fecha_fin: input.fecha_fin,
        dia_vencimiento_pago: input.dia_vencimiento_mensual,
        moneda_base: input.moneda,
        tipo_ajuste: input.tipo_ajuste,
        frecuencia_ajuste_meses: input.frecuencia_ajuste_meses,
        valor_alquiler_inicial: input.monto_alquiler_inicial,
        valor_alquiler_actual: input.monto_alquiler_inicial,
        notas: input.notas || null,
      })
      .select("id")
      .single();

    if (contError || !contrato) {
      return { success: false, error: contError?.message || "Error al crear contrato" };
    }

    // 2. Asociar inquilino en contrato_participantes
    await supabase.from("contrato_participantes").insert({
      contrato_id: contrato.id,
      persona_id: input.inquilino_id,
      rol: "inquilino",
      porcentaje_participacion: 100,
    });

    // 3. Asociar garante si fue especificado
    if (input.garante_id) {
      await supabase.from("contrato_participantes").insert({
        contrato_id: contrato.id,
        persona_id: input.garante_id,
        rol: "garante",
        porcentaje_participacion: 0,
      });
    }

    revalidatePath("/contratos");
    revalidatePath("/");

    return { success: true, contratoId: contrato.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Obtener todos los contratos del tenant activo para el Hub Operativo
 */
export async function getContratosHubAction(): Promise<any[]> {
  try {
    const supabase = await createClient();
    let queryClient: any = supabase;

    // 1. Obtener tenant_id activo
    const { data: { user } } = await supabase.auth.getUser();
    let tenantId: string | null = null;

    if (user) {
      const { data: tu } = await supabase
        .from("tenant_usuarios")
        .select("tenant_id")
        .eq("usuario_id", user.id)
        .eq("activo", true)
        .single();
      if (tu?.tenant_id) tenantId = tu.tenant_id;
    }

    if (!tenantId) {
      return [];
    }

    // 2. Consultar contratos del tenant con joins
    const { data: contratos, error } = await queryClient
      .from("contratos")
      .select(`
        id,
        carpeta_numero,
        fecha_inicio,
        fecha_fin,
        moneda_base,
        valor_alquiler_actual,
        tipo_ajuste,
        frecuencia_ajuste_meses,
        notas,
        propiedades (
          id,
          direccion_calle,
          direccion_numero,
          piso_dpto,
          unidad_funcional,
          localidad
        ),
        contrato_participantes (
          rol,
          porcentaje_participacion,
          personas (
            id,
            nombre_completo,
            documento_tipo,
            documento_numero,
            telefono,
            cbu_alias
          )
        ),
        periodos_contrato (
          id,
          periodo_mes,
          periodo_anio,
          monto_alquiler,
          fecha_vencimiento,
          estado_cobranza,
          estado_liquidacion
        )
      `)
      .eq("tenant_id", tenantId)
      .order("creado_al", { ascending: false });

    if (error || !contratos) {
      console.error("Error al obtener contratos:", error);
      return [];
    }

    // 3. Mapear al modelo que espera ContratosHub
    return contratos.map((c: any) => {
      const prop = c.propiedades || {};
      const inquilinoPart = c.contrato_participantes?.find((p: any) => p.rol === "inquilino");
      const duenoPart = c.contrato_participantes?.find((p: any) => p.rol === "propietario");

      // Períodos de alquiler
      const periodos = c.periodos_contrato || [];
      const ultimoPeriodo = periodos.length > 0 ? periodos[periodos.length - 1] : null;

      const estadoPago = ultimoPeriodo
        ? (ultimoPeriodo.estado_cobranza === "cobrado" ? "al_dia" : "pendiente")
        : "al_dia";

      const estadoLiq = ultimoPeriodo
        ? (ultimoPeriodo.estado_liquidacion === "liquidado" ? "liquidado" : "pendiente")
        : "liquidado";

      return {
        id: c.id,
        carpeta_numero: c.carpeta_numero || "S/N",
        direccion: {
          calle: prop.direccion_calle || "Dirección",
          numero: prop.direccion_numero || "",
          piso_dpto: prop.piso_dpto || "",
          uf: prop.unidad_funcional || "",
          localidad: prop.localidad || "9 de Julio",
        },
        fecha_inicio: c.fecha_inicio,
        fecha_fin: c.fecha_fin,
        moneda: c.moneda_base || "ARS",
        monto_alquiler_actual: Number(c.valor_alquiler_actual) || 0,
        tipo_ajuste: c.tipo_ajuste || "ICL",
        frecuencia_ajuste_meses: c.frecuencia_ajuste_meses || 3,
        inquilino: {
          nombre: inquilinoPart?.personas?.nombre_completo || "Inquilino Asignado",
          documento: inquilinoPart?.personas?.documento_numero ? `DNI ${inquilinoPart.personas.documento_numero}` : "DNI S/D",
          telefono: inquilinoPart?.personas?.telefono || "",
          estado_pago_mes: estadoPago,
        },
        propietario: {
          nombre: duenoPart?.personas?.nombre_completo || "Propietario Asignado",
          documento: duenoPart?.personas?.documento_numero ? `CUIT ${duenoPart.personas.documento_numero}` : "CUIT S/D",
          cbu_alias: duenoPart?.personas?.cbu_alias || "",
          porcentaje: duenoPart?.porcentaje_participacion ?? 100,
          estado_liquidacion_mes: estadoLiq,
        },
      };
    });
  } catch (err) {
    console.error("Excepción en getContratosHubAction:", err);
    return [];
  }
}
