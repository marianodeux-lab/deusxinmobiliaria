import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing Supabase connection to:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: newT, error: insErr } = await supabase.from("tenants").insert({
      nombre_fantasia: "DeusX Inmobiliarias",
      cuit: "30-71829401-9",
      email: "contacto@deusxinmobiliarias.com",
      telefono: "+54 9 223 512-3456",
      configuracion: {
        slug: "deus-propiedades",
        whatsapp: "+54 9 223 512-3456",
        color_marca: "#004d40",
      },
    }).select().single();

    if (insErr) {
      console.error("Error al insertar tenant:", insErr.message);
    } else {
      console.log("¡Tenant inicial creado con éxito! ID:", newT.id);
    }

    const { data: allTenants } = await supabase.from("tenants").select("*");
    console.log("Total tenants en BD:", allTenants?.length, allTenants);
  } catch (err) {
    console.error("Excepción:", err);
  }
}

test();
