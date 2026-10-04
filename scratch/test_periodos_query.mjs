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
      periodo_mes,
      periodo_anio,
      monto_alquiler,
      estado_cobranza,
      cobranza_imputaciones (
        cobranza_id,
        cobranzas (
          numero_recibo,
          fecha_cobro,
          medio_pago,
          monto_total_cobrado
        )
      )
    `)
    .limit(3);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Query result:', JSON.stringify(data, null, 2));
  }
}

run();
