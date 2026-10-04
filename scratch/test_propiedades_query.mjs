import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('propiedades')
    .select(`
      id,
      codigo_interno,
      direccion_calle,
      direccion_numero,
      piso_dpto,
      localidad,
      tipo_inmueble,
      destino,
      ambientes,
      dormitorios,
      banios,
      cocheras,
      superficie_total,
      expensas_estimadas,
      operacion_web,
      precio_web,
      moneda_web,
      publicar_en_vidriera,
      destacada_web,
      titulo_web,
      descripcion_web,
      fotos_web,
      contratos (
        id,
        carpeta_numero,
        estado,
        valor_alquiler_actual,
        moneda_base,
        fecha_fin,
        contrato_participantes (
          rol,
          personas (
            nombre_completo,
            documento_numero,
            telefono
          )
        )
      )
    `);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total propiedades fetched:', data.length);
    console.log('Sample item:', JSON.stringify(data[0], null, 2));
  }
}

run();
