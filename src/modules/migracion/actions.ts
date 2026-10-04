"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface PreviewSpotResult {
  propietariosCount: number;
  inquilinosCount: number;
  propiedadesCount: number;
  contratosCount: number;
  samplePropietario?: string;
  sampleInquilino?: string;
  samplePropiedad?: string;
}

export interface ImportResult {
  success: boolean;
  propietariosImportados: number;
  inquilinosImportados: number;
  propiedadesImportadas: number;
  contratosImportados: number;
  error?: string;
}

function getSectionFromLines(lines: string[], startHeader: string, endHeader?: string) {
  const startIndex = lines.findIndex((l) => l.trim().startsWith(startHeader));
  if (startIndex === -1) return [];
  let endIndex = lines.length;
  if (endHeader) {
    const foundEnd = lines.findIndex((l, idx) => idx > startIndex && l.trim().startsWith(endHeader));
    if (foundEnd !== -1) endIndex = foundEnd;
  }
  return lines.slice(startIndex, endIndex);
}

/**
 * Previsualiza el contenido del archivo exportado de AR Comercial Gestión / Spot
 */
export async function previsualizarArchivoSpotAction(fileContent: string): Promise<{
  success: boolean;
  preview?: PreviewSpotResult;
  error?: string;
}> {
  try {
    const lines = fileContent.split("\n");
    const propLines = getSectionFromLines(lines, "Tabla: web_propietarios", "Tabla: web_propiedades");
    const inqLines = getSectionFromLines(lines, "Tabla: web_inquilinos", "Tabla: web_garantes");
    const propRows = getSectionFromLines(lines, "Tabla: web_propiedades", "Tabla: web_movimientos");
    const contRows = getSectionFromLines(lines, "Tabla: web_inquilinos_inmuebles", "Tabla: web_propietarios_inmuebles");

    const propietariosCount = Math.max(0, propLines.length - 2);
    const inquilinosCount = Math.max(0, inqLines.length - 2);
    const propiedadesCount = Math.max(0, propRows.length - 2);
    const contratosCount = Math.max(0, contRows.length - 2);

    let samplePropietario = "";
    if (propLines.length > 2) {
      const cols = propLines[2].split("\t");
      samplePropietario = `${cols[3] || ""} ${cols[4] || ""}`.trim();
    }

    let sampleInquilino = "";
    if (inqLines.length > 2) {
      const cols = inqLines[2].split("\t");
      sampleInquilino = `${cols[4] || ""} ${cols[5] || ""}`.trim();
    }

    let samplePropiedad = "";
    if (propRows.length > 2) {
      const cols = propRows[2].split("\t");
      samplePropiedad = `${cols[6] || ""} (${cols[7] || ""})`.trim();
    }

    return {
      success: true,
      preview: {
        propietariosCount,
        inquilinosCount,
        propiedadesCount,
        contratosCount,
        samplePropietario,
        sampleInquilino,
        samplePropiedad,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al analizar el archivo de Spot." };
  }
}

/**
 * Importa los datos completos de AR Comercial Gestión / Spot al Tenant actual
 */
export async function importarDatosSpotAction(fileContent: string): Promise<ImportResult> {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Obtener tenant del usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    let tenantId: string | null = null;

    if (user) {
      const { data: tu } = await adminSupabase
        .from("tenant_usuarios")
        .select("tenant_id")
        .eq("usuario_id", user.id)
        .maybeSingle();
      if (tu) tenantId = tu.tenant_id;
    }

    if (!tenantId) {
      // Fallback al primer tenant
      const { data: tenants } = await adminSupabase.from("tenants").select("id").limit(1);
      if (tenants && tenants.length > 0) {
        tenantId = tenants[0].id;
      } else {
        return {
          success: false,
          propietariosImportados: 0,
          inquilinosImportados: 0,
          propiedadesImportadas: 0,
          contratosImportados: 0,
          error: "No se encontró una inmobiliaria (tenant) activa para asociar los datos.",
        };
      }
    }

    const lines = fileContent.split("\n");
    let propCount = 0;
    let inqCount = 0;
    let inmuebleCount = 0;
    let contratoCount = 0;

    // 2. Propietarios
    const propLines = getSectionFromLines(lines, "Tabla: web_propietarios", "Tabla: web_propiedades");
    const propietariosMap = new Map<string, string>(); // spotId -> uuid

    for (let i = 2; i < propLines.length; i++) {
      const cols = propLines[i].split("\t");
      if (cols.length < 5) continue;
      const spotId = cols[0];
      const apellido = cols[3]?.trim();
      const nombre = cols[4]?.trim();
      if (!apellido && !nombre) continue;

      const nombreCompleto = `${apellido} ${nombre}`.trim();
      const docNumero = cols[9]?.replace(/[^0-9]/g, "") || cols[12]?.replace(/[^0-9]/g, "") || `DNI-${spotId}`;
      const cuit = cols[12]?.trim() || cols[9]?.trim() || docNumero;
      const cbu = cols[40]?.trim() || null;
      const direccion = cols[6]?.trim() || null;
      const email = cols[29]?.trim() || null;
      const telefono = cols[7]?.trim() || cols[19]?.trim() || null;

      const { data: pExist } = await adminSupabase
        .from("personas")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("documento_numero", docNumero)
        .maybeSingle();

      if (pExist) {
        propietariosMap.set(spotId, pExist.id);
      } else {
        const { data: pNew } = await adminSupabase.from("personas").insert({
          tenant_id: tenantId,
          tipo_persona: "fisica",
          nombre_completo: nombreCompleto,
          documento_tipo: cuit.length > 9 ? "CUIT" : "DNI",
          documento_numero: docNumero,
          email,
          telefono,
          direccion,
          cbu_alias: cbu,
        }).select("id").single();

        if (pNew) {
          propietariosMap.set(spotId, pNew.id);
          propCount++;
        }
      }
    }

    // 3. Inquilinos
    const inqLines = getSectionFromLines(lines, "Tabla: web_inquilinos", "Tabla: web_garantes");
    const inquilinosMap = new Map<string, string>();

    for (let i = 2; i < inqLines.length; i++) {
      const cols = inqLines[i].split("\t");
      if (cols.length < 15) continue;
      const spotId = cols[2]?.trim();
      const apellido = cols[4]?.trim();
      const nombre = cols[5]?.trim();
      if (!apellido && !nombre) continue;

      const nombreCompleto = `${apellido} ${nombre}`.trim();
      const dni = cols[12]?.replace(/[^0-9]/g, "") || `INQ-${spotId}`;
      const tel = cols[19]?.trim() || cols[10]?.trim() || null;
      const email = cols[28]?.trim() || null;

      const { data: inqExist } = await adminSupabase
        .from("personas")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("documento_numero", dni)
        .maybeSingle();

      if (inqExist) {
        inquilinosMap.set(spotId, inqExist.id);
      } else {
        const { data: inqNew } = await adminSupabase.from("personas").insert({
          tenant_id: tenantId,
          tipo_persona: "fisica",
          nombre_completo: nombreCompleto,
          documento_tipo: "DNI",
          documento_numero: dni,
          email,
          telefono: tel,
        }).select("id").single();

        if (inqNew) {
          inquilinosMap.set(spotId, inqNew.id);
          inqCount++;
        }
      }
    }

    // 4. Propiedades
    const propRows = getSectionFromLines(lines, "Tabla: web_propiedades", "Tabla: web_movimientos");
    const propiedadesMap = new Map<string, string>();

    for (let i = 2; i < propRows.length; i++) {
      const cols = propRows[i].split("\t");
      if (cols.length < 10) continue;
      const spotPropId = cols[0]?.trim();
      const direccion = cols[6]?.trim();
      const localidad = cols[7]?.trim() || "9 de Julio";
      const ambientes = parseInt(cols[11]?.replace(/[^0-9]/g, "") || "2") || 2;
      const supTotal = parseInt(cols[42]?.replace(/[^0-9]/g, "") || "60") || 60;

      if (!direccion) continue;

      const { data: propExist } = await adminSupabase
        .from("propiedades")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("direccion_calle", direccion)
        .maybeSingle();

      if (propExist) {
        propiedadesMap.set(spotPropId, propExist.id);
      } else {
        const { data: propNew } = await adminSupabase.from("propiedades").insert({
          tenant_id: tenantId,
          tipo_propiedad: "departamento",
          direccion_calle: direccion,
          direccion_numero: "S/N",
          localidad,
          provincia: "Buenos Aires",
          ambientes,
          superficie_cubierta: supTotal,
          superficie_total: supTotal,
          estado_operativo: "alquilada",
          tipo_operacion: "alquiler",
          moneda_publicacion: "ARS",
          precio_publicacion: 150000,
        }).select("id").single();

        if (propNew) {
          propiedadesMap.set(spotPropId, propNew.id);
          inmuebleCount++;
        }
      }
    }

    // 5. Contratos
    const contRows = getSectionFromLines(lines, "Tabla: web_inquilinos_inmuebles", "Tabla: web_propietarios_inmuebles");

    for (let i = 2; i < contRows.length; i++) {
      const cols = contRows[i].split("\t");
      if (cols.length < 20) continue;

      const spotInqId = cols[1]?.trim();
      const spotPropId = cols[2]?.trim();
      const propUuid = propiedadesMap.get(spotPropId);
      const inqUuid = inquilinosMap.get(spotInqId);
      if (!propUuid) continue;

      const carpeta = cols[3]?.trim() || `SPOT-${i}`;
      const alquilerStr = cols[15]?.replace(/[^0-9]/g, "") || "100000";
      const valorAlquiler = parseInt(alquilerStr) || 100000;
      const fechaInicio = cols[11]?.trim() || "2024-01-01";
      const fechaFin = cols[12]?.trim() || "2026-12-31";

      const { data: cExist } = await adminSupabase
        .from("contratos")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("carpeta_numero", carpeta)
        .maybeSingle();

      if (!cExist) {
        const { data: cNew } = await adminSupabase.from("contratos").insert({
          tenant_id: tenantId,
          propiedad_id: propUuid,
          carpeta_numero: carpeta,
          tipo_contrato: "vivienda",
          tipo_ajuste: "ICL",
          frecuencia_ajuste_meses: 6,
          valor_alquiler_inicial: valorAlquiler,
          valor_alquiler_actual: valorAlquiler,
          moneda: "ARS",
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: "vigente",
        }).select("id").single();

        if (cNew && inqUuid) {
          await adminSupabase.from("contrato_participantes").insert({
            contrato_id: cNew.id,
            persona_id: inqUuid,
            rol: "inquilino_principal",
          });
          contratoCount++;
        }
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      propietariosImportados: propCount,
      inquilinosImportados: inqCount,
      propiedadesImportadas: inmuebleCount,
      contratosImportados: contratoCount,
    };
  } catch (err: any) {
    return {
      success: false,
      propietariosImportados: 0,
      inquilinosImportados: 0,
      propiedadesImportadas: 0,
      contratosImportados: 0,
      error: err.message || "Error durante la importación de datos.",
    };
  }
}

/**
 * Borra todos los datos de demostración o prueba del Tenant actual
 * para dejar la inmobiliaria 100% limpia y en blanco para producción.
 */
export async function limpiarDatosTenantAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    let tenantId: string | null = null;

    if (user) {
      const { data: tu } = await adminSupabase
        .from("tenant_usuarios")
        .select("tenant_id")
        .eq("usuario_id", user.id)
        .maybeSingle();
      if (tu) tenantId = tu.tenant_id;
    }

    if (!tenantId) {
      const { data: tenants } = await adminSupabase.from("tenants").select("id").limit(1);
      if (tenants && tenants.length > 0) tenantId = tenants[0].id;
    }

    if (!tenantId) {
      return { success: false, error: "No se identificó el tenant a limpiar." };
    }

    // 1. Borrar reservas temporarias
    await adminSupabase.from("reservas_temporarias").delete().eq("tenant_id", tenantId);

    // 2. Borrar comprobantes / cobranzas
    await adminSupabase.from("cobranzas").delete().eq("tenant_id", tenantId);
    await adminSupabase.from("liquidaciones").delete().eq("tenant_id", tenantId);

    // 3. Borrar participantes y contratos
    const { data: contratos } = await adminSupabase.from("contratos").select("id").eq("tenant_id", tenantId);
    if (contratos && contratos.length > 0) {
      const ids = contratos.map((c) => c.id);
      await adminSupabase.from("contrato_participantes").delete().in("contrato_id", ids);
      await adminSupabase.from("contratos").delete().eq("tenant_id", tenantId);
    }

    // 4. Borrar propiedades
    await adminSupabase.from("propiedades").delete().eq("tenant_id", tenantId);

    // 5. Borrar personas (inquilinos, propietarios)
    await adminSupabase.from("personas").delete().eq("tenant_id", tenantId);

    revalidatePath("/", "layout");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al limpiar datos del tenant." };
  }
}
