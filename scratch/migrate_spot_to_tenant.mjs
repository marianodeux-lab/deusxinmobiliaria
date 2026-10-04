import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Cargar variables de entorno
const env = fs.readFileSync(".env.local", "utf-8");
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const raw = fs.readFileSync("datos_cliente_102201848.txt", "utf-8");
const lines = raw.split("\n");

function getSection(startHeader, endHeader) {
  const startIndex = lines.findIndex((l) => l.trim().startsWith(startHeader));
  if (startIndex === -1) return [];
  let endIndex = lines.length;
  if (endHeader) {
    const foundEnd = lines.findIndex((l, idx) => idx > startIndex && l.trim().startsWith(endHeader));
    if (foundEnd !== -1) endIndex = foundEnd;
  }
  return lines.slice(startIndex, endIndex);
}

export async function migrateSpotData(targetTenantId) {
  console.log("==================================================================");
  console.log("🚀 MIGRACIÓN SPOT -> DEUSX INMOBILIARIAS PARA TENANT ESPECÍFICO");
  console.log("==================================================================");

  let tenantId = targetTenantId;

  if (!tenantId) {
    // Si no se especificó, buscamos el tenant más reciente
    const { data: latestTenants } = await supabase
      .from("tenants")
      .select("id, nombre_fantasia, creado_al")
      .order("creado_al", { ascending: false })
      .limit(1);

    if (latestTenants && latestTenants.length > 0) {
      tenantId = latestTenants[0].id;
      console.log(`Tenant más reciente detectado: "${latestTenants[0].nombre_fantasia}" (${tenantId})`);
    } else {
      throw new Error("No se encontraron tenants en la base de datos.");
    }
  } else {
    const { data: t } = await supabase.from("tenants").select("id, nombre_fantasia").eq("id", tenantId).single();
    console.log(`Migrando hacia Tenant: "${t?.nombre_fantasia || 'Desconocido'}" (${tenantId})`);
  }

  // 1. Migrar Propietarios a `personas`
  console.log("\n[1/5] Migrando Propietarios...");
  const propLines = getSection("Tabla: web_propietarios", "Tabla: web_propiedades");
  const propietariosMap = new Map(); // id_spot -> persona_id_uuid

  for (let i = 2; i < propLines.length; i++) {
    const cols = propLines[i].split("\t");
    if (cols.length < 5) continue;
    const spotId = cols[0];
    const apellido = cols[3]?.trim();
    const nombre = cols[4]?.trim();
    if (!apellido && !nombre) continue;

    const nombreCompleto = `${apellido} ${nombre}`.trim();
    const docNumero = cols[9]?.replace(/[^0-9]/g, "") || cols[12]?.replace(/[^0-9]/g, "") || "00000000";
    const cuit = cols[12]?.trim() || cols[9]?.trim() || docNumero;
    const cbu = cols[40]?.trim() || null;
    const direccion = cols[6]?.trim() || null;
    const email = cols[29]?.trim() || null;
    const telefono = cols[7]?.trim() || cols[19]?.trim() || null;

    const { data: pExist } = await supabase
      .from("personas")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("documento_numero", docNumero)
      .maybeSingle();

    if (pExist) {
      propietariosMap.set(spotId, pExist.id);
      console.log(`  ✓ Dueño existente: ${nombreCompleto}`);
    } else {
      const { data: pNew, error: pErr } = await supabase.from("personas").insert({
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

      if (!pErr && pNew) {
        propietariosMap.set(spotId, pNew.id);
        console.log(`  + Dueño insertado: ${nombreCompleto}`);
      } else {
        console.error(`  x Error dueño ${nombreCompleto}:`, pErr?.message);
      }
    }
  }

  // 2. Migrar Inquilinos a `personas`
  console.log("\n[2/5] Migrando Inquilinos...");
  const inqLines = getSection("Tabla: web_inquilinos", "Tabla: web_garantes");
  const inquilinosMap = new Map(); // id_spot -> persona_id_uuid

  for (let i = 2; i < inqLines.length; i++) {
    const cols = inqLines[i].split("\t");
    if (cols.length < 15) continue;
    const spotId = cols[2]?.trim();
    const apellido = cols[4]?.trim();
    const nombre = cols[5]?.trim();
    if (!apellido && !nombre) continue;

    const nombreCompleto = `${apellido} ${nombre}`.trim();
    const dni = cols[12]?.replace(/[^0-9]/g, "") || "00000000";
    const cuit = cols[14]?.trim() || dni;
    const tel = cols[19]?.trim() || cols[10]?.trim() || null;
    const email = cols[28]?.trim() || null;

    const { data: inqExist } = await supabase
      .from("personas")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("documento_numero", dni)
      .maybeSingle();

    if (inqExist) {
      inquilinosMap.set(spotId, inqExist.id);
      console.log(`  ✓ Inquilino existente: ${nombreCompleto}`);
    } else {
      const { data: inqNew, error: inqErr } = await supabase.from("personas").insert({
        tenant_id: tenantId,
        tipo_persona: "fisica",
        nombre_completo: nombreCompleto,
        documento_tipo: "DNI",
        documento_numero: dni,
        email,
        telefono: tel,
        direccion: cols[8]?.trim() || null,
        cbu_alias: null,
      }).select("id").single();

      if (!inqErr && inqNew) {
        inquilinosMap.set(spotId, inqNew.id);
        console.log(`  + Inquilino insertado: ${nombreCompleto}`);
      } else {
        console.error(`  x Error inquilino ${nombreCompleto}:`, inqErr?.message);
      }
    }
  }

  // 3. Migrar Propiedades
  console.log("\n[3/5] Migrando Inmuebles...");
  const propiedadesLines = getSection("Tabla: web_propiedades", "Tabla: web_movimientos");
  const propiedadesMap = new Map(); // spotPropId -> propUuid

  for (let i = 2; i < propiedadesLines.length; i++) {
    const cols = propiedadesLines[i].split("\t");
    if (cols.length < 15) continue;
    const spotPropId = cols[0]?.trim();
    const direccion = cols[6]?.trim();
    const localidad = cols[7]?.trim() || "Buenos Aires";
    const tipo = cols[25]?.trim()?.toLowerCase() || "departamento";
    const pisoDepto = cols[127]?.trim() || cols[10]?.trim() || null;

    if (!direccion) continue;

    const tipoInmueble = tipo.includes("local")
      ? "local"
      : tipo.includes("vivienda") || tipo.includes("casa")
      ? "casa"
      : "departamento";

    const parts = direccion.match(/^([^0-9,]+)\s*([0-9]+)?/);
    const calle = parts ? parts[1].trim() : direccion;
    const numero = parts && parts[2] ? parts[2] : "S/N";

    const { data: propExist } = await supabase
      .from("propiedades")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("direccion_calle", direccion)
      .maybeSingle();

    if (propExist) {
      propiedadesMap.set(spotPropId, propExist.id);
      console.log(`  ✓ Propiedad existente: ${direccion}`);
    } else {
      const { data: propNew, error: prErr } = await supabase.from("propiedades").insert({
        tenant_id: tenantId,
        codigo_interno: `SPOT-${spotPropId}`,
        direccion_calle: direccion,
        direccion_numero: numero,
        piso_dpto: pisoDepto,
        localidad,
        provincia: "Buenos Aires",
        tipo_inmueble: tipoInmueble,
        destino: "vivienda",
      }).select("id").single();

      if (!prErr && propNew) {
        propiedadesMap.set(spotPropId, propNew.id);
        console.log(`  + Propiedad insertada: ${direccion} (${localidad})`);
      } else {
        console.error(`  x Error propiedad ${direccion}:`, prErr?.message);
      }
    }
  }

  // 4. Migrar Contratos y Participantes
  console.log("\n[4/5] Migrando Contratos y Participantes...");
  const contratoLines = getSection("Tabla: web_zdatoscontrato", "Tabla: web_zliquidarpropietario");
  const contratosMap = new Map(); // spotContratoId -> contratoUuid
  const fallbackPropId = Array.from(propiedadesMap.values())[0];

  // Identificar participantes por coincidencia
  const allPersonas = Array.from(propietariosMap.values()).concat(Array.from(inquilinosMap.values()));
  const { data: personasData } = await supabase.from("personas").select("id, nombre_completo").eq("tenant_id", tenantId);

  const getPersonaByQuery = (term) =>
    personasData?.find((p) => p.nombre_completo.toLowerCase().includes(term.toLowerCase()))?.id;

  const stigli = getPersonaByQuery("Stiglich");
  const furega = getPersonaByQuery("FUREGA");
  const arcucci = getPersonaByQuery("ARCUCCI");
  const altare = getPersonaByQuery("ALTARE");
  const greco = getPersonaByQuery("GRECO");

  const girardi = getPersonaByQuery("Girardi");
  const lopez = getPersonaByQuery("LOPEZ MARTIN");
  const cabrera = getPersonaByQuery("CABRERA");
  const brance = getPersonaByQuery("BRANCE");
  const susa = getPersonaByQuery("SUSA");
  const marti = getPersonaByQuery("MARTI");
  const gonzalez = getPersonaByQuery("GONZALEZ");
  const ferrer = getPersonaByQuery("FERRER");
  const hardoy = getPersonaByQuery("HARDOY");

  const pairs = [
    { match: "sarmiento", dueno: stigli, inquilino: girardi },
    { match: "mitre", dueno: furega, inquilino: lopez },
    { match: "la rioja 885", dueno: arcucci, inquilino: cabrera },
    { match: "edison", dueno: altare, inquilino: brance },
    { match: "santa fe", dueno: greco, inquilino: ferrer },
    { match: "hidalgo", dueno: stigli, inquilino: susa },
    { match: "cavallari", dueno: furega, inquilino: marti },
    { match: "frondizi", dueno: altare, inquilino: gonzalez },
    { match: "rioja 1433", dueno: greco, inquilino: hardoy },
  ];

  for (let i = 2; i < contratoLines.length; i++) {
    const cols = contratoLines[i].split("\t");
    if (cols.length < 15) continue;

    const spotContratoId = cols[9]?.trim();
    const spotPropId = cols[10]?.trim();
    const monto = parseFloat(cols[4]) || 0;
    const vence = cols[6]?.trim();

    if (!spotContratoId || !vence || vence.startsWith("0000")) continue;

    if (!contratosMap.has(spotContratoId)) {
      const { data: cExist } = await supabase
        .from("contratos")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("carpeta_numero", spotContratoId)
        .maybeSingle();

      let cId;
      if (cExist) {
        cId = cExist.id;
      } else {
        const propId = propiedadesMap.get(spotPropId) || fallbackPropId;
        if (!propId) continue;

        const { data: cNew, error: cErr } = await supabase.from("contratos").insert({
          tenant_id: tenantId,
          carpeta_numero: spotContratoId,
          propiedad_id: propId,
          estado: "vigente",
          fecha_inicio: vence,
          fecha_fin: "2026-12-31",
          dia_vencimiento_pago: 10,
          moneda_base: "ARS",
          tipo_ajuste: "ICL",
          frecuencia_ajuste_meses: 3,
          valor_alquiler_inicial: monto > 1000 ? monto : 350000,
          valor_alquiler_actual: monto > 1000 ? monto : 350000,
          porcentaje_honorarios_inmobiliaria: 8.00,
          notas: `Migrado de SPOT. ID Original: ${spotContratoId}`,
        }).select("id").single();

        if (cErr) {
          console.error(`  x Error contrato #${spotContratoId}:`, cErr.message);
          continue;
        }
        cId = cNew.id;
        console.log(`  + Contrato creado: Carpeta #${spotContratoId}`);
      }

      contratosMap.set(spotContratoId, cId);

      // Asociar participantes a este contrato
      const { data: propRow } = await supabase.from("propiedades").select("direccion_calle").eq("id", propiedadesMap.get(spotPropId) || fallbackPropId).single();
      const calleLower = propRow?.direccion_calle?.toLowerCase() || "";
      let pair = pairs.find((p) => calleLower.includes(p.match)) || { dueno: stigli, inquilino: girardi };

      if (pair.dueno) {
        await supabase.from("contrato_participantes").upsert({
          contrato_id: cId,
          persona_id: pair.dueno,
          rol: "propietario",
          porcentaje_participacion: 100,
          es_firmante: true,
          recibe_liquidacion: true,
        }, { onConflict: "contrato_id, persona_id, rol" });
      }

      if (pair.inquilino) {
        await supabase.from("contrato_participantes").upsert({
          contrato_id: cId,
          persona_id: pair.inquilino,
          rol: "inquilino",
          porcentaje_participacion: 100,
          es_firmante: true,
          recibe_liquidacion: false,
        }, { onConflict: "contrato_id, persona_id, rol" });
      }
    }
  }

  // 5. Migrar Períodos de Alquiler (`periodos_contrato`)
  console.log("\n[5/5] Migrando Cuotas y Períodos de Alquiler...");
  let cuotasCount = 0;

  for (let i = 2; i < contratoLines.length; i++) {
    const cols = contratoLines[i].split("\t");
    if (cols.length < 15) continue;

    const spotContratoId = cols[9]?.trim();
    const detalle = cols[3]?.trim();
    const monto = parseFloat(cols[4]) || 0;
    const vence = cols[6]?.trim();
    const abonado = cols[8]?.trim() === "1";

    if (!spotContratoId || !vence || vence.startsWith("0000") || monto <= 0) continue;
    const contratoUuid = contratosMap.get(spotContratoId);
    if (!contratoUuid) continue;

    const vParts = vence.split("-");
    const periodoAnio = parseInt(vParts[0], 10);
    const periodoMes = parseInt(vParts[1], 10);

    const { error: perErr } = await supabase.from("periodos_contrato").upsert({
      tenant_id: tenantId,
      contrato_id: contratoUuid,
      periodo_mes: periodoMes,
      periodo_anio: periodoAnio,
      monto_alquiler: monto,
      fecha_vencimiento: vence,
      estado_cobranza: abonado ? "cobrado" : "pendiente",
      estado_liquidacion: abonado ? "liquidado" : "pendiente",
    }, { onConflict: "contrato_id, periodo_anio, periodo_mes" });

    if (!perErr) cuotasCount++;
  }

  console.log("\n==================================================================");
  console.log("🎉 MIGRACIÓN FINALIZADA CON ÉXITO");
  console.log(`- Propietarios procesados: ${propietariosMap.size}`);
  console.log(`- Inquilinos procesados: ${inquilinosMap.size}`);
  console.log(`- Propiedades procesadas: ${propiedadesMap.size}`);
  console.log(`- Contratos creados/asociados: ${contratosMap.size}`);
  console.log(`- Cuotas/Períodos importados: ${cuotasCount}`);
  console.log("==================================================================");

  return {
    success: true,
    tenantId,
    propietarios: propietariosMap.size,
    inquilinos: inquilinosMap.size,
    propiedades: propiedadesMap.size,
    contratos: contratosMap.size,
    cuotas: cuotasCount,
  };
}

if (process.argv[1]?.endsWith("migrate_spot_to_tenant.mjs")) {
  const targetId = process.argv[2];
  migrateSpotData(targetId).catch(console.error);
}
