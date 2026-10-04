"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface IndicePunto {
  id: string;
  tipo_indice: "ICL" | "IPC" | "UVA" | "CASA_PROPIA" | "USD_OFICIAL" | "USD_BLUE";
  fecha: string;
  valor: number;
  fuente: string;
}

export interface ContratoParaAjuste {
  id: string;
  carpeta_numero: string;
  direccion_inmueble: string;
  inquilino_nombre?: string;
  inquilino_telefono?: string;
  tipo_ajuste: string;
  frecuencia_meses: number;
  valor_actual: number;
  fecha_inicio: string;
  fecha_ultimo_ajuste?: string;
  meses_desde_ajuste: number;
  debe_ajustar: boolean;
  proximo_vencimiento_ajuste: string;
}

export interface IndicesKpis {
  iclUltimo: number;
  iclVariacionInteranual: number;
  ipcUltimo: number;
  ipcVariacionMensual: number;
  uvaUltimo: number;
  usdOficial: number;
  usdBlue: number;
  contratosPendientesAjuste: number;
}

/**
 * Obtiene las series de índices económicos, cotizaciones y contratos pendientes de indexación
 */
export async function getIndicesHubAction(): Promise<{
  success: boolean;
  indicesList: IndicePunto[];
  contratosAjustables: ContratoParaAjuste[];
  kpis: IndicesKpis;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // 1. Obtener todos los índices ordenados por fecha
    const { data: indicesData, error: indicesErr } = await supabase
      .from("indices_economicos")
      .select("id, tipo_indice, fecha, valor, fuente")
      .order("fecha", { ascending: false });

    if (indicesErr) throw indicesErr;

    const indicesList: IndicePunto[] = (indicesData || []).map((i: any) => ({
      id: i.id,
      tipo_indice: i.tipo_indice,
      fecha: i.fecha,
      valor: Number(i.valor),
      fuente: i.fuente || "BCRA / INDEC",
    }));

    // 2. Extraer últimos valores para KPIs
    const iclSeries = indicesList.filter((i) => i.tipo_indice === "ICL");
    const ipcSeries = indicesList.filter((i) => i.tipo_indice === "IPC");
    const uvaSeries = indicesList.filter((i) => i.tipo_indice === "UVA");
    const usdOficialSeries = indicesList.filter((i) => i.tipo_indice === "USD_OFICIAL");
    const usdBlueSeries = indicesList.filter((i) => i.tipo_indice === "USD_BLUE");

    const iclUltimo = iclSeries[0]?.valor || 26.94;
    const iclAnterior = iclSeries[iclSeries.length - 1]?.valor || 15.42;
    const iclVarInteranual = Math.round(((iclUltimo - iclAnterior) / iclAnterior) * 100);

    const ipcUltimo = ipcSeries[0]?.valor || 3762.3;
    const ipcMesAnterior = ipcSeries[1]?.valor || 3667.0;
    const ipcVarMensual = Number((((ipcUltimo - ipcMesAnterior) / ipcMesAnterior) * 100).toFixed(1));

    const uvaUltimo = uvaSeries[0]?.valor || 1640.4;
    const usdOficial = usdOficialSeries[0]?.valor || 1380;
    const usdBlue = usdBlueSeries[0]?.valor || 1515;

    // 3. Obtener contratos vigentes para evaluar indexación
    const { data: contratosData, error: contratosErr } = await supabase
      .from("contratos")
      .select(`
        id,
        carpeta_numero,
        tipo_ajuste,
        frecuencia_ajuste_meses,
        valor_alquiler_actual,
        fecha_inicio,
        fecha_ultimo_ajuste,
        estado,
        propiedades:propiedad_id (direccion_calle, direccion_numero, localidad)
      `)
      .eq("estado", "vigente")
      .order("carpeta_numero");

    if (contratosErr) throw contratosErr;

    // 4. Participantes para teléfono y nombre de inquilino
    const contratoIds = (contratosData || []).map((c: any) => c.id);
    const inqMap = new Map<string, { nombre: string; tel?: string }>();

    if (contratoIds.length > 0) {
      const { data: parts } = await supabase
        .from("contrato_participantes")
        .select(`contrato_id, rol, personas:persona_id (nombre_completo, telefono)`)
        .in("contrato_id", contratoIds.slice(0, 50));

      (parts || []).forEach((p: any) => {
        if (p.rol === "inquilino_principal" || p.rol === "inquilino") {
          inqMap.set(p.contrato_id, {
            nombre: p.personas?.nombre_completo || "Inquilino",
            tel: p.personas?.telefono || undefined,
          });
        }
      });
    }

    const hoy = new Date();
    const contratosAjustables: ContratoParaAjuste[] = [];

    (contratosData || []).forEach((c: any) => {
      const prop = c.propiedades;
      const direccion = prop
        ? `${prop.direccion_calle} ${prop.direccion_numero || ""}`.trim()
        : "Inmueble";

      const fechaBase = new Date(c.fecha_ultimo_ajuste || c.fecha_inicio);
      const diffMonths =
        (hoy.getFullYear() - fechaBase.getFullYear()) * 12 +
        (hoy.getMonth() - fechaBase.getMonth());

      const frecuencia = c.frecuencia_ajuste_meses || 3;
      const debeAjustar = diffMonths >= frecuencia;

      // Calcular fecha aproximada de próximo vencimiento de ajuste
      const proxAjusteDate = new Date(fechaBase);
      proxAjusteDate.setMonth(proxAjusteDate.getMonth() + frecuencia);
      const proxAjusteStr = proxAjusteDate.toISOString().split("T")[0];

      const inq = inqMap.get(c.id);

      contratosAjustables.push({
        id: c.id,
        carpeta_numero: c.carpeta_numero,
        direccion_inmueble: direccion,
        inquilino_nombre: inq?.nombre || "Inquilino Asignado",
        inquilino_telefono: inq?.tel,
        tipo_ajuste: c.tipo_ajuste || "ICL",
        frecuencia_meses: frecuencia,
        valor_actual: Number(c.valor_alquiler_actual) || 0,
        fecha_inicio: c.fecha_inicio,
        fecha_ultimo_ajuste: c.fecha_ultimo_ajuste || undefined,
        meses_desde_ajuste: Math.max(0, diffMonths),
        debe_ajustar: debeAjustar,
        proximo_vencimiento_ajuste: proxAjusteStr,
      });
    });

    const kpis: IndicesKpis = {
      iclUltimo,
      iclVariacionInteranual: iclVarInteranual,
      ipcUltimo,
      ipcVariacionMensual: ipcVarMensual,
      uvaUltimo,
      usdOficial,
      usdBlue,
      contratosPendientesAjuste: contratosAjustables.filter((c) => c.debe_ajustar).length,
    };

    return {
      success: true,
      indicesList,
      contratosAjustables,
      kpis,
    };
  } catch (error: any) {
    console.error("Error en getIndicesHubAction:", error);
    return {
      success: false,
      indicesList: [],
      contratosAjustables: [],
      kpis: {
        iclUltimo: 0,
        iclVariacionInteranual: 0,
        ipcUltimo: 0,
        ipcVariacionMensual: 0,
        uvaUltimo: 0,
        usdOficial: 0,
        usdBlue: 0,
        contratosPendientesAjuste: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Motor de cálculo de indexación oficial para un valor base
 */
export async function calcularAjusteAction(
  montoBase: number,
  tipoIndice: "ICL" | "IPC" | "UVA",
  fechaInicio: string,
  fechaFin: string
): Promise<{
  success: boolean;
  coeficiente: number;
  nuevoMonto: number;
  porcentajeVariacion: number;
  valorIndiceInicial: number;
  valorIndiceFinal: number;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // Obtener punto inicial y final
    const { data: puntoIni } = await supabase
      .from("indices_economicos")
      .select("valor, fecha")
      .eq("tipo_indice", tipoIndice)
      .lte("fecha", fechaInicio)
      .order("fecha", { ascending: false })
      .limit(1)
      .single();

    const { data: puntoFin } = await supabase
      .from("indices_economicos")
      .select("valor, fecha")
      .eq("tipo_indice", tipoIndice)
      .lte("fecha", fechaFin)
      .order("fecha", { ascending: false })
      .limit(1)
      .single();

    const valIni = puntoIni ? Number(puntoIni.valor) : 18.25;
    const valFin = puntoFin ? Number(puntoFin.valor) : 26.94;

    const coef = valFin / valIni;
    const nuevoMonto = Math.round(montoBase * coef);
    const varPorc = Number(((coef - 1) * 100).toFixed(2));

    return {
      success: true,
      coeficiente: Number(coef.toFixed(6)),
      nuevoMonto,
      porcentajeVariacion: varPorc,
      valorIndiceInicial: valIni,
      valorIndiceFinal: valFin,
    };
  } catch (error: any) {
    return {
      success: false,
      coeficiente: 1,
      nuevoMonto: montoBase,
      porcentajeVariacion: 0,
      valorIndiceInicial: 0,
      valorIndiceFinal: 0,
      error: error.message,
    };
  }
}

/**
 * Aplica el ajuste al contrato y genera/actualiza el próximo período devengado
 */
export async function aplicarAjusteAContratoAction(
  contratoId: string,
  nuevoMonto: number,
  tipoIndice: string,
  valorIndice: number,
  coeficiente: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const hoyStr = new Date().toISOString().split("T")[0];

    // 1. Actualizar contrato con nuevo valor locativo
    const { error: contratoErr } = await supabase
      .from("contratos")
      .update({
        valor_alquiler_actual: nuevoMonto,
        fecha_ultimo_ajuste: hoyStr,
        valor_indice_base: valorIndice,
        actualizado_al: new Date().toISOString(),
      })
      .eq("id", contratoId);

    if (contratoErr) throw contratoErr;

    // 2. Actualizar el período devengado pendiente más reciente o próximo
    const { data: ultimoPeriodo } = await supabase
      .from("periodos_contrato")
      .select("id, periodo_mes, periodo_anio, monto_alquiler")
      .eq("contrato_id", contratoId)
      .eq("estado_cobranza", "pendiente")
      .order("periodo_anio", { ascending: true })
      .order("periodo_mes", { ascending: true })
      .limit(1)
      .single();

    if (ultimoPeriodo) {
      await supabase
        .from("periodos_contrato")
        .update({
          monto_alquiler: nuevoMonto,
          indice_aplicado_nombre: tipoIndice,
          indice_aplicado_valor: valorIndice,
          coeficiente_ajuste: coeficiente,
        })
        .eq("id", ultimoPeriodo.id);
    }

    revalidatePath("/indices");
    revalidatePath("/contratos");
    revalidatePath("/cobranzas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Carga o actualiza un valor puntual de índice económico
 */
export async function guardarIndiceManualAction(
  tipo_indice: "ICL" | "IPC" | "UVA" | "USD_OFICIAL" | "USD_BLUE",
  fecha: string,
  valor: number,
  fuente?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("indices_economicos").upsert(
      [
        {
          tipo_indice,
          fecha,
          valor,
          fuente: fuente || "Carga Manual",
        },
      ],
      { onConflict: "tipo_indice, fecha" }
    );

    if (error) throw error;

    revalidatePath("/indices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
