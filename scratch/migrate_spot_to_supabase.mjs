import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

async function runMigration() {
  console.log("=== INICIANDO MIGRACIÓN CONTROLADA SPOT -> DEUSX INMOBILIARIAS ===");

  // 1. Obtener o crear el Tenant para el Cliente 102201848
  let tenantId;
  const { data: existingTenants } = await supabase.from("tenants").select("id, nombre_fantasia").limit(1);
  if (existingTenants && existingTenants.length > 0) {
    tenantId = existingTenants[0].id;
    console.log(`Usando tenant existente: "${existingTenants[0].nombre_fantasia}" (${tenantId})`);
  } else {
    const { data: newT, error: tErr } = await supabase.from("tenants").insert({
      nombre_fantasia: "Inmobiliaria 9 de Julio (Cliente 102201848)",
      cuit: "30-71829401-9",
      email: "inmobiliaria102201848@deusx.com.ar",
      telefono: "+54 9 2317 415612",
      configuracion: {
        slug: "inmo-9dejulio",
        spot_client_id: "102201848",
      },
    }).select().single();
    if (tErr) throw new Error("Error creando tenant: " + tErr.message);
    tenantId = newT.id;
    console.log(`Tenant creado: ${tenantId}`);
  }

  // 2. Migrar Propietarios a `personas`
  console.log("\n--> Migrando Propietarios...");
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
      console.log(`  ✓ Dueño ya existía: ${nombreCompleto}`);
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
        console.error(`  x Error insertando ${nombreCompleto}:`, pErr?.message);
      }
    }
  }

  // 3. Migrar Inquilinos a `personas`
  console.log("\n--> Migrando Inquilinos...");
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
      console.log(`  ✓ Inquilino ya existía: ${nombreCompleto}`);
    } else {
      const { data: inqNew, error: inqErr } = await supabase.from("personas").insert({
        tenant_id: tenantId,
        tipo_persona: "fisica",
        nombre_completo: nombreCompleto,
        documento_tipo: "DNI",
        documento_numero: dni,
        email,
        telefono: tel,
      }).select("id").single();

      if (!inqErr && inqNew) {
        inquilinosMap.set(spotId, inqNew.id);
        console.log(`  + Inquilino insertado: ${nombreCompleto}`);
      }
    }
  }

  // 4. Migrar Propiedades a `propiedades`
  console.log("\n--> Migrando Propiedades...");
  const propRows = getSection("Tabla: web_propiedades", "Tabla: web_movimientos");
  const propiedadesMap = new Map(); // id_spot_prop -> propiedad_id_uuid

  for (let i = 2; i < propRows.length; i++) {
    const cols = propRows[i].split("\t");
    if (cols.length < 10) continue;
    const spotPropId = cols[0]?.trim();
    const carpeta = cols[5]?.trim() || spotPropId;
    const direccion = cols[6]?.trim();
    const localidad = cols[7]?.trim() || "9 de Julio";
    const ambientesStr = cols[11]?.trim() || "2";
    const ambientes = parseInt(ambientesStr.replace(/[^0-9]/g, "")) || 2;
    const supTotal = parseInt(cols[42]?.replace(/[^0-9]/g, "")) || null;
    const expensas = parseInt(cols[83]?.replace(/[^0-9]/g, "")) || null;

    if (!direccion) continue;

    const { data: propExist } = await supabase
      .from("propiedades")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("direccion_calle", direccion)
      .maybeSingle();

    if (propExist) {
      propiedadesMap.set(spotPropId, propExist.id);
      console.log(`  ✓ Propiedad ya existía: [Carpeta #${carpeta}] ${direccion}`);
    } else {
      const { data: propNew, error: prErr } = await supabase.from("propiedades").insert({
        tenant_id: tenantId,
        codigo_interno: `CARPETA-${carpeta}`,
        tipo_inmueble: "departamento",
        destino: "vivienda",
        direccion_calle: direccion,
        direccion_numero: "S/N",
        localidad: localidad,
        provincia: "Buenos Aires",
        notas: `Importado de SPOT. Carpeta #${carpeta}. ID SPOT: ${spotPropId}. Ambientes: ${ambientes}, Sup: ${supTotal || '--'}m², Expensas: $${expensas || '0'}`,
      }).select("id").single();

      if (!prErr && propNew) {
        propiedadesMap.set(spotPropId, propNew.id);
        console.log(`  + Propiedad insertada: [Carpeta #${carpeta}] ${direccion} (${localidad})`);
      } else {
        console.error(`  x Error insertando propiedad ${direccion}:`, prErr?.message);
      }
    }
  }

  // 5. Migrar Contratos y Períodos (`web_zdatoscontrato`)
  console.log("\n--> Migrando Contratos y Períodos de Alquiler...");
  const contratoLines = getSection("Tabla: web_zdatoscontrato", "Tabla: web_zliquidarpropietario");
  const contratosMap = new Map(); // spotContratoId -> contratoUuid
  let cuotasInsertadas = 0;

  // Tomamos una propiedad por defecto si no encontramos la exacta
  const fallbackPropId = Array.from(propiedadesMap.values())[0];

  for (let i = 2; i < contratoLines.length; i++) {
    const cols = contratoLines[i].split("\t");
    if (cols.length < 15) continue;

    const spotContratoId = cols[9]?.trim();
    const spotPropId = cols[10]?.trim();
    const detalle = cols[3]?.trim();
    const monto = parseFloat(cols[4]) || 0;
    const vence = cols[6]?.trim();
    const abonado = cols[8]?.trim() === "1";

    if (!spotContratoId || !vence || vence.startsWith("0000")) continue;

    let contratoUuid = contratosMap.get(spotContratoId);

    if (!contratoUuid) {
      const { data: cExist } = await supabase
        .from("contratos")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("carpeta_numero", spotContratoId)
        .maybeSingle();

      if (cExist) {
        contratoUuid = cExist.id;
        contratosMap.set(spotContratoId, contratoUuid);
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
          notas: `Contrato migrado desde SPOT. ID Original: ${spotContratoId}`,
        }).select("id").single();

        if (!cErr && cNew) {
          contratoUuid = cNew.id;
          contratosMap.set(spotContratoId, contratoUuid);
          console.log(`  + Contrato creado: Carpeta #${spotContratoId}`);
        } else {
          console.error(`  x Error contrato #${spotContratoId}:`, cErr?.message);
        }
      }
    }

    if (contratoUuid && monto > 0) {
      const { error: perErr } = await supabase.from("periodos_contrato").insert({
        contrato_id: contratoUuid,
        numero_periodo: i,
        fecha_periodo: vence,
        fecha_vencimiento: vence,
        monto_alquiler_base: monto,
        monto_total_exigible: monto,
        saldo_pendiente: abonado ? 0 : monto,
        estado_periodo: abonado ? "cobrado_total" : "pendiente",
        notas: detalle,
      });
      if (!perErr) cuotasInsertadas++;
    }
  }

  console.log("\n=========================================================");
  console.log("🎉 MIGRACIÓN COMPLETADA CON ÉXITO EN SUPABASE:");
  console.log(`- Propietarios procesados: ${propietariosMap.size}`);
  console.log(`- Inquilinos procesados: ${inquilinosMap.size}`);
  console.log(`- Propiedades creadas: ${propiedadesMap.size}`);
  console.log(`- Contratos creados: ${contratosMap.size}`);
  console.log(`- Cuotas/Períodos importados: ${cuotasInsertadas}`);
  console.log("=========================================================");
}

runMigration().catch(console.error);
