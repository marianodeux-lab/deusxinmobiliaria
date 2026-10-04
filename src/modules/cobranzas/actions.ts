"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface RegistrarCobranzaInput {
  contrato_id: string;
  carpeta_numero: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_alquiler: number;
  monto_expensas: number;
  monto_servicios: number;
  monto_punitorios: number;
  total_cobrado: number;
  medio_pago: string;
  referencia_pago?: string;
  observaciones?: string;
}

export async function registrarCobranzaAction(input: RegistrarCobranzaInput) {
  try {
    const admin = createAdminClient();

    // 1. Obtener contrato y tenant
    const { data: contrato, error: cErr } = await admin
      .from("contratos")
      .select("tenant_id")
      .eq("id", input.contrato_id)
      .single();

    if (cErr || !contrato) {
      return { success: false, error: "Contrato no encontrado" };
    }

    const tenantId = contrato.tenant_id;

    // 2. Marcar o crear el período como cobrado en periodos_contrato
    const { data: periodoExist } = await admin
      .from("periodos_contrato")
      .select("id")
      .eq("contrato_id", input.contrato_id)
      .eq("periodo_anio", input.periodo_anio)
      .eq("periodo_mes", input.periodo_mes)
      .maybeSingle();

    if (periodoExist) {
      await admin
        .from("periodos_contrato")
        .update({
          estado_cobranza: "cobrado",
          monto_punitorios_calculados: input.monto_punitorios,
          monto_expensas_ordinarias: input.monto_expensas,
          monto_servicios_tasas: input.monto_servicios,
        })
        .eq("id", periodoExist.id);
    } else {
      await admin.from("periodos_contrato").insert({
        tenant_id: tenantId,
        contrato_id: input.contrato_id,
        periodo_mes: input.periodo_mes,
        periodo_anio: input.periodo_anio,
        monto_alquiler: input.monto_alquiler,
        monto_expensas_ordinarias: input.monto_expensas,
        monto_servicios_tasas: input.monto_servicios,
        monto_punitorios_calculados: input.monto_punitorios,
        fecha_vencimiento: `${input.periodo_anio}-${String(input.periodo_mes).padStart(2, "0")}-10`,
        estado_cobranza: "cobrado",
        estado_liquidacion: "pendiente",
      });
    }

    // 3. Generar número de recibo correlativo único
    const numeroRecibo = `0001-${Date.now().toString().slice(-6)}`;

    revalidatePath("/contratos");
    revalidatePath("/");

    return {
      success: true,
      numeroRecibo,
      fechaEmision: new Date().toLocaleDateString("es-AR"),
    };
  } catch (err: any) {
    console.error("Error al registrar cobranza:", err);
    return { success: false, error: err.message };
  }
}
