import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data: contratos, error } = await supabase
    .from("contratos")
    .select(`
      id,
      carpeta_numero,
      fecha_inicio,
      fecha_fin,
      dia_vencimiento_pago,
      moneda_base,
      valor_alquiler_actual,
      tipo_ajuste,
      frecuencia_ajuste_meses,
      notas,
      propiedades (
        id,
        direccion_calle,
        direccion_numero,
        localidad
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
    .limit(5);

  if (error) {
    console.error("Error en query:", error);
  } else {
    console.log("Contratos encontrados:", contratos.length);
    console.log(JSON.stringify(contratos[0], null, 2));
  }
}

testQuery();
