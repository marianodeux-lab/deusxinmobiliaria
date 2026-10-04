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

async function runPeriodosMigration() {
  console.log("=== IMPORTANDO PERÍODOS DE CONTRATO (SPOT -> SUPABASE) ===");

  const { data: tenant } = await supabase.from("tenants").select("id").limit(1).single();
  const tenantId = tenant.id;

  const { data: contratos } = await supabase.from("contratos").select("id, carpeta_numero").eq("tenant_id", tenantId);
  const contratosMap = new Map();
  contratos.forEach((c) => contratosMap.set(c.carpeta_numero, c.id));

  console.log(`Contratos existentes en Supabase para vincular: ${contratosMap.size}`);

  const contratoLines = getSection("Tabla: web_zdatoscontrato", "Tabla: web_zliquidarpropietario");
  let cuotasInsertadas = 0;
  let cuotasOmitidas = 0;

  for (let i = 2; i < contratoLines.length; i++) {
    const cols = contratoLines[i].split("\t");
    if (cols.length < 15) continue;

    const spotContratoId = cols[9]?.trim();
    const monto = parseFloat(cols[4]) || 0;
    const vence = cols[6]?.trim();
    const abonado = cols[8]?.trim() === "1";

    if (!spotContratoId || !vence || vence.startsWith("0000") || monto <= 0) continue;

    const contratoUuid = contratosMap.get(spotContratoId);
    if (!contratoUuid) continue;

    const [yearStr, monthStr] = vence.split("-");
    const yearInt = parseInt(yearStr, 10);
    const monthInt = parseInt(monthStr, 10);

    if (monthInt >= 1 && monthInt <= 12 && yearInt >= 2020) {
      const { error: perErr } = await supabase.from("periodos_contrato").insert({
        tenant_id: tenantId,
        contrato_id: contratoUuid,
        periodo_mes: monthInt,
        periodo_anio: yearInt,
        monto_alquiler: monto,
        fecha_vencimiento: vence,
        estado_cobranza: abonado ? "cobrado" : "pendiente",
        estado_liquidacion: abonado ? "liquidado" : "pendiente",
      });

      if (!perErr) {
        cuotasInsertadas++;
      } else {
        cuotasOmitidas++;
      }
    }
  }

  console.log("\n=========================================================");
  console.log(`🎉 PERÍODOS / CUOTAS DE ALQUILER IMPORTADAS: ${cuotasInsertadas}`);
  console.log(`- Omitidas / Duplicadas: ${cuotasOmitidas}`);
  console.log("=========================================================");
}

runPeriodosMigration().catch(console.error);
