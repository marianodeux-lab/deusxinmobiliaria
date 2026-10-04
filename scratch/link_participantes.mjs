import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const admin = createClient(url, key);

async function link() {
  const { data: contratos } = await admin
    .from("contratos")
    .select("id, propiedad_id, propiedades(direccion_calle)");

  const { data: personas } = await admin.from("personas").select("id, nombre_completo");

  const findPersona = (namePart) =>
    personas.find((p) => p.nombre_completo.toLowerCase().includes(namePart.toLowerCase()))?.id;

  const stigli = findPersona("Stiglich");
  const furega = findPersona("FUREGA");
  const arcucci = findPersona("ARCUCCI");
  const altare = findPersona("ALTARE");
  const greco = findPersona("GRECO");

  const girardi = findPersona("Girardi");
  const lopez = findPersona("LOPEZ MARTIN");
  const cabrera = findPersona("CABRERA");
  const brance = findPersona("BRANCE");
  const susa = findPersona("SUSA");
  const marti = findPersona("MARTI");
  const gonzalez = findPersona("GONZALEZ");
  const ferrer = findPersona("FERRER");
  const mencia = findPersona("MENCIA");
  const hardoy = findPersona("HARDOY");

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

  console.log(`Asociando participantes para ${contratos.length} contratos...`);

  for (const c of contratos) {
    const calle = c.propiedades?.direccion_calle?.toLowerCase() || "";
    let pair = pairs.find((p) => calle.includes(p.match));
    if (!pair) {
      pair = { dueno: stigli, inquilino: girardi };
    }

    if (pair.dueno) {
      await admin.from("contrato_participantes").upsert(
        {
          contrato_id: c.id,
          persona_id: pair.dueno,
          rol: "propietario",
          porcentaje_participacion: 100,
          es_firmante: true,
          recibe_liquidacion: true,
        },
        { onConflict: "contrato_id, persona_id, rol" }
      );
    }

    if (pair.inquilino) {
      await admin.from("contrato_participantes").upsert(
        {
          contrato_id: c.id,
          persona_id: pair.inquilino,
          rol: "inquilino",
          porcentaje_participacion: 100,
          es_firmante: true,
          recibe_liquidacion: false,
        },
        { onConflict: "contrato_id, persona_id, rol" }
      );
    }
  }

  console.log("✓ Todos los participantes asociados exitosamente!");
}

link().catch(console.error);
