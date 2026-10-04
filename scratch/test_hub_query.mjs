import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const admin = createClient(url, key);

async function run() {
  const { data: t } = await admin.from("tenants").select("id").limit(1).single();
  console.log("Tenant:", t?.id);

  const { data: contratos, error } = await admin
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
    .eq("tenant_id", t.id)
    .order("creado_al", { ascending: false });

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Found contratos:", contratos.length);
    console.log("Sample contrato:", {
      id: contratos[0]?.id,
      carpeta: contratos[0]?.carpeta_numero,
      valor: contratos[0]?.valor_alquiler_actual,
      prop: contratos[0]?.propiedades,
      periodosCount: contratos[0]?.periodos_contrato?.length,
    });
  }
}

run();
