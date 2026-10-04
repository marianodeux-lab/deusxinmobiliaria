import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('periodos_contrato')
    .select(`
      id,
      contrato_id,
      monto_alquiler,
      monto_punitorios_calculados,
      periodo_mes,
      periodo_anio,
      contratos (
        id,
        carpeta_numero,
        moneda_base,
        propiedades ( direccion_calle, direccion_numero, localidad ),
        contrato_participantes (
          rol,
          personas (
            id,
            nombre_completo,
            documento_numero,
            telefono,
            cbu_alias
          )
        )
      )
    `)
    .eq('periodo_anio', 2026)
    .eq('periodo_mes', 10)
    .eq('estado_cobranza', 'cobrado')
    .eq('estado_liquidacion', 'pendiente');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result count:', data.length);
    console.log(JSON.stringify(data[0], null, 2));
  }
}

run();
