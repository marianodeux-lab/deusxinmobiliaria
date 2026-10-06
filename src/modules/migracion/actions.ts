"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedTenant } from "@/lib/supabase/auth-tenant";
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

export interface DiagnosticResult {
  esCompatible: boolean;
  score: number;
  formatoDetectado: string;
  totalLineas: number;
  carpetasEstimadas: number;
  requiereSoporteAsistido: boolean;
  diagnosticoDetallado: string;
  preview?: PreviewSpotResult;
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
 * Analizador Inteligente de Pre-Vuelo:
 * Valida delimitadores, encabezados y estructura del archivo para determinar
 * si es 100% apto para importación automática o requiere asistencia de Soporte.
 */
export async function analizarArchivoMigracionAction(
  fileContent: string,
  fileName: string
): Promise<{
  success: boolean;
  diagnostic: DiagnosticResult;
  error?: string;
}> {
  try {
    const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const totalLineas = lines.length;

    // 1. Verificación de formato tabulado compatible (carpetas, propietarios, inquilinos)
    const hasWebTablas = lines.some((l) => l.includes("Tabla: web_") || l.includes("web_inquilinos"));
    if (hasWebTablas) {
      const previewRes = await previsualizarArchivoSpotAction(fileContent);
      if (previewRes.success && previewRes.preview) {
        return {
          success: true,
          diagnostic: {
            esCompatible: true,
            score: 98,
            formatoDetectado: "Estructura Tabular Inmobiliaria (Alta Compatibilidad)",
            totalLineas,
            carpetasEstimadas: previewRes.preview.contratosCount,
            requiereSoporteAsistido: false,
            diagnosticoDetallado: `Se identificaron correctamente ${previewRes.preview.propietariosCount} propietarios, ${previewRes.preview.inquilinosCount} inquilinos, ${previewRes.preview.propiedadesCount} inmuebles y ${previewRes.preview.contratosCount} contratos vigentes. Compatible para importación instantánea.`,
            preview: previewRes.preview,
          },
        };
      }
    }

    // 2. Verificación de archivos CSV o delimitados por punto y coma / tabulaciones
    const firstLine = lines[0] || "";
    const isCsvComma = firstLine.includes(",") && firstLine.split(",").length >= 4;
    const isCsvSemicolon = firstLine.includes(";") && firstLine.split(";").length >= 4;
    const isTsv = firstLine.includes("\t") && firstLine.split("\t").length >= 4;

    if (isCsvComma || isCsvSemicolon || isTsv) {
      return {
        success: true,
        diagnostic: {
          esCompatible: false,
          score: 55,
          formatoDetectado: isCsvComma
            ? "CSV Delimitado por Comas"
            : isCsvSemicolon
            ? "CSV Delimitado por Punto y Coma"
            : "Archivo TSV Delimitado por Tabulaciones",
          totalLineas,
          carpetasEstimadas: Math.max(1, totalLineas - 1),
          requiereSoporteAsistido: true,
          diagnosticoDetallado:
            "El archivo contiene columnas de datos, pero la disposición de campos difiere del esquema estándar. Para garantizar la absoluta exactitud de contratos, saldos y CBU, nuestro Soporte Técnico mapeará el archivo sin cargo.",
        },
      };
    }

    // 3. Formato no estandarizado / Desconocido
    return {
      success: true,
      diagnostic: {
        esCompatible: false,
        score: 20,
        formatoDetectado: "Estructura Propietaria No Estandarizada",
        totalLineas,
        carpetasEstimadas: 0,
        requiereSoporteAsistido: true,
        diagnosticoDetallado:
          "El archivo posee un esquema propio que no coincide con los patrones de importación automática. Nuestro equipo de desarrollo puede realizar la migración y mapeo a medida sin ningún costo.",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      diagnostic: {
        esCompatible: false,
        score: 0,
        formatoDetectado: "Error de lectura",
        totalLineas: 0,
        carpetasEstimadas: 0,
        requiereSoporteAsistido: true,
        diagnosticoDetallado: "No fue posible procesar el archivo: " + err.message,
      },
      error: err.message,
    };
  }
}

/**
 * Previsualiza el contenido del archivo exportado de Spot / AR Comercial Gestión
 */
export async function previsualizarArchivoSpotAction(fileContent: string): Promise<{
  success: boolean;
  preview?: PreviewSpotResult;
  error?: string;
}> {
  try {
    const lines = fileContent.split(/\r?\n/);
    const zdatosLines = getSectionFromLines(lines, "Tabla: web_zdatoscontrato", "Tabla: web_zliquidarpropietario");
    const relPropLines = getSectionFromLines(lines, "Tabla: web_relacionpropietarios", "Tabla: web_recibos");
    const propLines = getSectionFromLines(lines, "Tabla: web_propietarios", "Tabla: web_propiedades");
    const propRows = getSectionFromLines(lines, "Tabla: web_propiedades", "Tabla: web_movimientos");
    const movLines = getSectionFromLines(lines, "Tabla: web_movimientos", "Tabla: web_log_actividades");
    const inqLines = getSectionFromLines(lines, "Tabla: web_inquilinos", "Tabla: web_garantes");

    // Propietarios válidos
    let propietariosCount = 0;
    let samplePropietario = "";
    for (let i = 2; i < propLines.length; i++) {
      const cols = propLines[i].split("\t");
      const ap = cols[3]?.trim();
      const nom = cols[4]?.trim();
      if (ap || nom) {
        propietariosCount++;
        if (!samplePropietario) {
          samplePropietario = `${ap || ""} ${nom || ""}`.trim();
        }
      }
    }

    // Inquilinos válidos
    let inquilinosCount = 0;
    let sampleInquilino = "";
    for (let i = 2; i < inqLines.length; i++) {
      const cols = inqLines[i].split("\t");
      const ap = cols[4]?.trim();
      const nom = cols[5]?.trim();
      if (ap || nom) {
        inquilinosCount++;
        if (!sampleInquilino) {
          sampleInquilino = `${ap || ""} ${nom || ""}`.trim();
        }
      }
    }

    // Propiedades válidas
    let propiedadesCount = 0;
    let samplePropiedad = "";
    for (let i = 2; i < propRows.length; i++) {
      const cols = propRows[i].split("\t");
      const dir = cols[6]?.trim();
      if (dir) {
        propiedadesCount++;
        if (!samplePropiedad) {
          samplePropiedad = `${dir} (${cols[7]?.trim() || "Ciudad"})`;
        }
      }
    }

    // Contratos únicos identificados cruzando web_zdatoscontrato, web_movimientos y web_relacionpropietarios
    const uniqueContratos = new Set<string>();
    for (let i = 2; i < movLines.length; i++) {
      const cols = movLines[i].split("\t");
      if (cols.length > 32) {
        const cid = cols[17]?.trim();
        const pid = cols[32]?.trim();
        if (cid && cid !== "0" && pid && pid !== "0") {
          uniqueContratos.add(cid);
        }
      }
    }

    for (let i = 2; i < zdatosLines.length; i++) {
      const cols = zdatosLines[i].split("\t");
      if (cols.length > 10) {
        const cid = cols[9]?.trim();
        const pid = cols[10]?.trim();
        if (cid && cid !== "0" && pid && pid !== "0") {
          uniqueContratos.add(cid);
        }
      }
    }

    const contratosCount = uniqueContratos.size;

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
    const { tenantId } = await requireAuthenticatedTenant();
    const adminSupabase = createAdminClient();

    const lines = fileContent.split(/\r?\n/);
    let propCount = 0;
    let inqCount = 0;
    let inmuebleCount = 0;
    let contratoCount = 0;

    // 1. Extraer secciones del archivo
    const propLines = getSectionFromLines(lines, "Tabla: web_propietarios", "Tabla: web_propiedades");
    const inqLines = getSectionFromLines(lines, "Tabla: web_inquilinos", "Tabla: web_garantes");
    const propRows = getSectionFromLines(lines, "Tabla: web_propiedades", "Tabla: web_movimientos");
    const relPropRows = getSectionFromLines(lines, "Tabla: web_relacionpropietarios", "Tabla: web_recibos");
    const zdatosRows = getSectionFromLines(lines, "Tabla: web_zdatoscontrato", "Tabla: web_zliquidarpropietario");
    const movRows = getSectionFromLines(lines, "Tabla: web_movimientos", "Tabla: web_log_actividades");

    // 2. Importar Propietarios -> tabla personas
    const propietariosMap = new Map<string, string>(); // spotId -> uuid

    for (let i = 2; i < propLines.length; i++) {
      const cols = propLines[i].split("\t");
      if (cols.length < 5) continue;
      const spotId = cols[0]?.trim();
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
        const { data: pNew, error: pErr } = await adminSupabase.from("personas").insert({
          tenant_id: tenantId,
          tipo_persona: "fisica",
          nombre_completo: nombreCompleto.slice(0, 200),
          documento_tipo: cuit.length > 9 ? "CUIT" : "DNI",
          documento_numero: docNumero.slice(0, 50),
          email: email ? email.slice(0, 150) : null,
          telefono: telefono ? telefono.slice(0, 50) : null,
          direccion: direccion ? direccion.slice(0, 250) : null,
          cbu_alias: cbu ? cbu.slice(0, 100) : null,
        }).select("id").single();

        if (pErr) throw pErr;

        if (pNew) {
          propietariosMap.set(spotId, pNew.id);
          propCount++;
        }
      }
    }

    // 3. Importar Inquilinos -> tabla personas
    const inquilinosMap = new Map<string, string>(); // spotId -> uuid

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
      const direccion = cols[8]?.trim() || null;

      const { data: inqExist } = await adminSupabase
        .from("personas")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("documento_numero", dni)
        .maybeSingle();

      if (inqExist) {
        inquilinosMap.set(spotId, inqExist.id);
      } else {
        const { data: inqNew, error: inqErr } = await adminSupabase.from("personas").insert({
          tenant_id: tenantId,
          tipo_persona: "fisica",
          nombre_completo: nombreCompleto.slice(0, 200),
          documento_tipo: "DNI",
          documento_numero: dni.slice(0, 50),
          email: email ? email.slice(0, 150) : null,
          telefono: tel ? tel.slice(0, 50) : null,
          direccion: direccion ? direccion.slice(0, 250) : null,
        }).select("id").single();

        if (inqErr) throw inqErr;

        if (inqNew) {
          inquilinosMap.set(spotId, inqNew.id);
          inqCount++;
        }
      }
    }

    // 4. Mapear relación Propiedad -> Propietario y Honorarios
    const relPropMap = new Map<string, { spotOwnerId: string; honorarios: number }>();
    for (let i = 2; i < relPropRows.length; i++) {
      const cols = relPropRows[i].split("\t");
      if (cols.length < 5) continue;
      const pid = cols[4]?.trim();
      const oid = cols[2]?.trim();
      const honorarios = parseFloat(cols[6]) || 4.13;
      if (pid && oid && oid !== "0") {
        relPropMap.set(pid, { spotOwnerId: oid, honorarios });
      }
    }

    // 5. Importar Propiedades -> tabla propiedades (únicamente columnas existentes del esquema)
    const propiedadesMap = new Map<string, string>(); // spotPropId -> uuid

    for (let i = 2; i < propRows.length; i++) {
      const cols = propRows[i].split("\t");
      if (cols.length < 10) continue;
      const spotPropId = cols[0]?.trim();
      const direccionCompleta = cols[6]?.trim();
      const carpeta = cols[5]?.trim() || "";
      const localidad = cols[7]?.trim() || "Ciudad";
      const provincia = cols[26]?.trim() || "Buenos Aires";
      const cp = cols[27]?.trim() || null;
      const tipoProp = cols[25]?.trim() || "departamento";

      if (!direccionCompleta) continue;

      let calle = direccionCompleta;
      let numero = "S/N";

      const matchNum = direccionCompleta.match(/^(.+?)\s+(\d+)(.*)$/);
      if (matchNum) {
        const callePart = matchNum[1].trim();
        const extraPart = matchNum[3].trim().replace(/^,\s*/, "");
        calle = extraPart ? `${callePart} (${extraPart})` : callePart;
        numero = matchNum[2].trim();
      }

      calle = calle.slice(0, 150);
      numero = numero.slice(0, 20);

      const tipoInmueble = tipoProp.toLowerCase().includes("casa") || tipoProp.toLowerCase().includes("vivienda")
        ? "casa"
        : tipoProp.toLowerCase().includes("local")
        ? "local"
        : "departamento";

      const { data: propExist } = await adminSupabase
        .from("propiedades")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("direccion_calle", calle)
        .eq("direccion_numero", numero)
        .maybeSingle();

      if (propExist) {
        propiedadesMap.set(spotPropId, propExist.id);
      } else {
        const { data: propNew, error: propErr } = await adminSupabase.from("propiedades").insert({
          tenant_id: tenantId,
          direccion_calle: calle,
          direccion_numero: numero,
          localidad: localidad.slice(0, 100),
          provincia: provincia.slice(0, 100),
          tipo_inmueble: tipoInmueble.slice(0, 50),
          destino: "vivienda",
          codigo_postal: cp ? cp.slice(0, 20) : null,
          notas: carpeta ? `Carpeta Spot: ${carpeta}` : null,
        }).select("id").single();

        if (propErr) throw propErr;

        if (propNew) {
          propiedadesMap.set(spotPropId, propNew.id);
          inmuebleCount++;
        }
      }
    }

    // 6. Analizar metadatos de cuotas y fechas en web_zdatoscontrato
    const contractMeta = new Map<
      string,
      {
        alquiler: number;
        vences: string[];
        duracionMeses: number;
        diaVenc: number;
        spotPropId?: string;
        spotOwnerId?: string;
      }
    >();
    for (let i = 2; i < zdatosRows.length; i++) {
      const c = zdatosRows[i].split("\t");
      if (c.length < 10) continue;
      const cid = c[9]?.trim();
      if (!cid || cid === "0") continue;
      const detalle = c[3]?.trim() || "";
      const debe = parseFloat(c[4]) || 0;
      const vence = c[6]?.trim();
      const pid = c[10]?.trim();
      const oid = c[30]?.trim();

      if (!contractMeta.has(cid)) {
        contractMeta.set(cid, { alquiler: 0, vences: [], duracionMeses: 24, diaVenc: 10 });
      }
      const meta = contractMeta.get(cid)!;
      if (pid && pid !== "0" && !meta.spotPropId) meta.spotPropId = pid;
      if (oid && oid !== "0" && !meta.spotOwnerId) meta.spotOwnerId = oid;

      if (vence && vence !== "0000-00-00" && vence.includes("-")) {
        meta.vences.push(vence);
        const parts = vence.split("-");
        const day = parseInt(parts[2], 10);
        if (day > 0 && day <= 28) meta.diaVenc = day;
      }
      if (detalle.toLowerCase().includes("alquiler") && debe > 1000) {
        if (!meta.alquiler || detalle.includes("cuota 1")) {
          meta.alquiler = debe;
        }
        const matchDur = detalle.match(/cuota \d+ de (\d+)/i);
        if (matchDur) {
          meta.duracionMeses = parseInt(matchDur[1], 10) || 24;
        }
      }
    }

    // 7. Extraer contratos consolidados desde web_movimientos cruzando con web_zdatoscontrato, web_relacionpropietarios y web_propiedades
    interface ParsedContrato {
      cid: string;
      spotPropId: string;
      spotInqId: string;
      spotOwnerId: string;
      alquiler: number;
      inicio: string;
      fin: string;
      diaVenc: number;
      carpeta: string;
    }

    const contractsMap = new Map<string, ParsedContrato>();

    for (let i = 2; i < movRows.length; i++) {
      const c = movRows[i].split("\t");
      if (c.length < 36) continue;
      const cid = c[17]?.trim();
      const pid = c[32]?.trim();
      const inqid = c[35]?.trim();
      let ownerId = c[29]?.trim();
      if (!cid || cid === "0" || !pid || pid === "0") continue;

      if (!ownerId || ownerId === "0") {
        ownerId = relPropMap.get(pid)?.spotOwnerId || contractMeta.get(cid)?.spotOwnerId || "";
      }

      if (!contractsMap.has(cid)) {
        const zm = contractMeta.get(cid) || { alquiler: 150000, vences: ["2025-01-01", "2027-01-01"], duracionMeses: 24, diaVenc: 10 };
        zm.vences.sort();
        const fInicio = zm.vences[0] || "2025-01-01";
        const fFin = zm.vences[zm.vences.length - 1] || "2027-01-01";

        contractsMap.set(cid, {
          cid,
          spotPropId: pid,
          spotInqId: inqid && inqid !== "0" ? inqid : "",
          spotOwnerId: ownerId && ownerId !== "0" ? ownerId : "",
          alquiler: zm.alquiler || 150000,
          inicio: fInicio,
          fin: fFin,
          diaVenc: zm.diaVenc || 10,
          carpeta: "",
        });
      } else {
        const entry = contractsMap.get(cid)!;
        if (!entry.spotInqId && inqid && inqid !== "0") entry.spotInqId = inqid;
        if ((!entry.spotOwnerId || entry.spotOwnerId === "0") && ownerId && ownerId !== "0") entry.spotOwnerId = ownerId;
      }
    }

    // Complementar con contratos de web_zdatoscontrato si tuvieran propiedad asignada
    for (const [cid, zm] of contractMeta.entries()) {
      if (!contractsMap.has(cid) && zm.spotPropId && zm.spotPropId !== "0") {
        const ownerId = zm.spotOwnerId || relPropMap.get(zm.spotPropId)?.spotOwnerId || "";
        zm.vences.sort();
        contractsMap.set(cid, {
          cid,
          spotPropId: zm.spotPropId,
          spotInqId: "",
          spotOwnerId: ownerId && ownerId !== "0" ? ownerId : "",
          alquiler: zm.alquiler || 150000,
          inicio: zm.vences[0] || "2025-01-01",
          fin: zm.vences[zm.vences.length - 1] || "2027-01-01",
          diaVenc: zm.diaVenc || 10,
          carpeta: "",
        });
      }
    }

    // Asignar carpeta y fallback de propietario desde web_propiedades
    for (let i = 2; i < propRows.length; i++) {
      const cols = propRows[i].split("\t");
      const spotPropId = cols[0]?.trim();
      const carp = cols[5]?.trim();
      if (spotPropId) {
        for (const cData of contractsMap.values()) {
          if (cData.spotPropId === spotPropId) {
            if (carp && !cData.carpeta) cData.carpeta = carp;
            if (!cData.spotOwnerId || cData.spotOwnerId === "0") {
              const o = relPropMap.get(spotPropId)?.spotOwnerId;
              if (o && o !== "0") cData.spotOwnerId = o;
            }
          }
        }
      }
    }

    // 8. Insertar Contratos, Participantes y Período Inicial en Supabase
    const usedCarpetas = new Set<string>();

    for (const [cid, cData] of contractsMap.entries()) {
      const propUuid = propiedadesMap.get(cData.spotPropId);
      if (!propUuid) continue;

      const inqUuid = inquilinosMap.get(cData.spotInqId);
      const ownerUuid = propietariosMap.get(cData.spotOwnerId);

      let carpetaNum = cData.carpeta ? `CARP-${cData.carpeta}` : `CARP-${cData.cid.slice(-4)}`;
      if (usedCarpetas.has(carpetaNum)) {
        carpetaNum = `CARP-${cData.carpeta || cData.cid.slice(-4)}-${cData.cid.slice(-4)}`;
      }
      usedCarpetas.add(carpetaNum);

      const { data: cExist } = await adminSupabase
        .from("contratos")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("carpeta_numero", carpetaNum)
        .maybeSingle();

      if (!cExist) {
        const { data: cNew, error: cErr } = await adminSupabase
          .from("contratos")
          .insert({
            tenant_id: tenantId,
            propiedad_id: propUuid,
            carpeta_numero: carpetaNum,
            fecha_inicio: cData.inicio,
            fecha_fin: cData.fin,
            dia_vencimiento_pago: cData.diaVenc,
            moneda_base: "ARS",
            tipo_ajuste: "ICL",
            frecuencia_ajuste_meses: 6,
            valor_alquiler_inicial: cData.alquiler,
            valor_alquiler_actual: cData.alquiler,
            estado: "vigente",
          })
          .select("id")
          .single();

        if (cErr) throw cErr;

        if (cNew) {
          // Inquilino
          if (inqUuid) {
            const { error: inqPartErr } = await adminSupabase
              .from("contrato_participantes")
              .insert({
                contrato_id: cNew.id,
                persona_id: inqUuid,
                rol: "inquilino",
                porcentaje_participacion: 100,
                es_firmante: true,
                recibe_liquidacion: false,
              });
            if (inqPartErr) throw inqPartErr;
          }

          // Propietario
          if (ownerUuid) {
            const { error: ownerPartErr } = await adminSupabase
              .from("contrato_participantes")
              .insert({
                contrato_id: cNew.id,
                persona_id: ownerUuid,
                rol: "propietario",
                porcentaje_participacion: 100,
                es_firmante: true,
                recibe_liquidacion: true,
              });
            if (ownerPartErr) throw ownerPartErr;
          }

          // Período activo mensual
          const now = new Date();
          const curMes = now.getMonth() + 1;
          const curAnio = now.getFullYear();
          const vencDia = Math.min(Math.max(cData.diaVenc, 1), 28);
          const vencStr = `${curAnio}-${String(curMes).padStart(2, "0")}-${String(vencDia).padStart(2, "0")}`;

          const { error: perErr } = await adminSupabase
            .from("periodos_contrato")
            .insert({
              tenant_id: tenantId,
              contrato_id: cNew.id,
              periodo_mes: curMes,
              periodo_anio: curAnio,
              monto_alquiler: cData.alquiler,
              fecha_vencimiento: vencStr,
              estado_cobranza: "pendiente",
              estado_liquidacion: "pendiente",
            });
          if (perErr) throw perErr;

          contratoCount++;
        }
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/contratos");
    revalidatePath("/propiedades");
    revalidatePath("/personas");
    revalidatePath("/cobranzas");
    revalidatePath("/liquidaciones");

    return {
      success: true,
      propietariosImportados: propCount,
      inquilinosImportados: inqCount,
      propiedadesImportadas: inmuebleCount,
      contratosImportados: contratoCount,
    };
  } catch (err: any) {
    console.error("Error en importarDatosSpotAction:", err);
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
    const { tenantId } = await requireAuthenticatedTenant();
    const adminSupabase = createAdminClient();

    // 1. Borrar comprobantes / cobranzas, liquidaciones y periodos del tenant
    await adminSupabase.from("cobranzas").delete().eq("tenant_id", tenantId);
    await adminSupabase.from("liquidaciones").delete().eq("tenant_id", tenantId);
    await adminSupabase.from("periodos_contrato").delete().eq("tenant_id", tenantId);

    // 2. Borrar participantes y contratos
    const { data: contratos } = await adminSupabase.from("contratos").select("id").eq("tenant_id", tenantId);
    if (contratos && contratos.length > 0) {
      const ids = contratos.map((c) => c.id);
      await adminSupabase.from("contrato_participantes").delete().in("contrato_id", ids);
      await adminSupabase.from("contratos").delete().eq("tenant_id", tenantId);
    }

    // 3. Borrar propiedades
    await adminSupabase.from("propiedades").delete().eq("tenant_id", tenantId);

    // 4. Borrar personas (inquilinos, propietarios)
    await adminSupabase.from("personas").delete().eq("tenant_id", tenantId);

    revalidatePath("/", "layout");
    revalidatePath("/contratos");
    revalidatePath("/propiedades");
    revalidatePath("/personas");
    revalidatePath("/cobranzas");

    return { success: true };
  } catch (err: any) {
    console.error("Error en limpiarDatosTenantAction:", err);
    return { success: false, error: err.message || "Error al limpiar datos del tenant." };
  }
}
