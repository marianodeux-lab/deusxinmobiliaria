import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();
const anonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

console.log("URL:", url);

async function test() {
  // Test with Service Role first
  const adminClient = createClient(url, key);
  const { data: t } = await adminClient.from("tenants").select("id, nombre");
  console.log("Tenants:", t);

  const { data: cAdmin, error: errAdmin } = await adminClient
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
        personas (
          id,
          nombre_completo,
          documento_numero
        )
      )
    `);

  if (errAdmin) console.error("Admin Error:", errAdmin);
  else console.log("Admin Contratos count:", cAdmin.length);

  // Test with Anon Client (what Next.js server uses if user is not authenticated or RLS is active)
  const anonClient = createClient(url, anonKey);
  const { data: cAnon, error: errAnon } = await anonClient
    .from("contratos")
    .select("id, carpeta_numero");
  if (errAnon) console.error("Anon Error:", errAnon);
  else console.log("Anon Contratos count:", cAnon?.length);
}

test();
