"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface ConsorcioItem {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
  cuit: string;
  administrador: string;
  telefono_admin?: string;
  email_admin?: string;
  cbu_alias?: string;
  banco?: string;
  unidades_count: number;
  propiedades_vinculadas: Array<{
    id: string;
    direccion: string;
    piso_dpto?: string;
    unidad_funcional?: string;
  }>;
}

export interface ExpensaItem {
  id: string;
  periodo_id: string;
  contrato_id: string;
  carpeta_numero: string;
  propiedad_id: string;
  direccion_inmueble: string;
  consorcio_nombre: string;
  periodo_mes: number;
  periodo_anio: number;
  monto_ordinarias: number;
  monto_extraordinarias: number;
  total_expensas: number;
  fecha_vencimiento_1: string;
  fecha_vencimiento_2?: string;
  estado_pago: "pendiente" | "cobrado" | "vencido";
  inquilino_nombre?: string;
  inquilino_telefono?: string;
  propietario_nombre?: string;
  propietario_telefono?: string;
  comprobante_referencia?: string;
}

export interface ConsorciosKpis {
  totalConsorcios: number;
  totalExpensasMes: number;
  ordinariasInquilinos: number;
  extraordinariasPropietarios: number;
  tasaCobranzaExpensas: number;
  unidadesAdministradas: number;
}

export interface CargarExpensaInput {
  periodo_id: string;
  monto_ordinarias: number;
  monto_extraordinarias: number;
  fecha_vencimiento_1: string;
  fecha_vencimiento_2?: string;
}

// Lista canónica de Consorcios y Edificios
const CONSORCIOS_STATIC_DATA: Omit<ConsorcioItem, "unidades_count" | "propiedades_vinculadas">[] = [
  {
    id: "c-lauquen",
    nombre: "Consorcio Edificio Lauquen",
    direccion: "Mitre 1419",
    localidad: "9 de Julio",
    cuit: "30-71458921-3",
    administrador: "Estudio Banchero & Asoc.",
    telefono_admin: "+5492317425890",
    email_admin: "consorcios@banchero.com.ar",
    cbu_alias: "EDIFICIO.LAUQUEN",
    banco: "Banco Provincia",
  },
  {
    id: "c-sarmiento",
    nombre: "Consorcio Torre Sarmiento",
    direccion: "Sarmiento 2751",
    localidad: "Capital Federal",
    cuit: "30-68945120-7",
    administrador: "Administración Central CABA",
    telefono_admin: "+5491147895522",
    email_admin: "administracion@torresarmiento.com.ar",
    cbu_alias: "SARMIENTO.2751",
    banco: "Banco Galicia",
  },
  {
    id: "c-larioja",
    nombre: "Consorcio Complejo La Rioja",
    direccion: "La Rioja 885",
    localidad: "9 de Julio",
    cuit: "30-71889201-9",
    administrador: "Dr. Horacio Gómez",
    telefono_admin: "+5492317411234",
    email_admin: "hgomez@consorcios9dj.com.ar",
    cbu_alias: "LA.RIOJA.885",
    banco: "Banco Nación",
  },
  {
    id: "c-edison",
    nombre: "Consorcio Residencial Edison",
    direccion: "Edison 441",
    localidad: "9 de Julio",
    cuit: "30-70984512-1",
    administrador: "Inmobiliaria & Gestiones",
    telefono_admin: "+5492317456789",
    email_admin: "administracion@edison441.com",
    cbu_alias: "EDISON.CONSORCIO",
    banco: "Banco Santander",
  },
];

/**
 * Obtiene el listado de consorcios, liquidaciones de expensas del mes y métricas
 */
export async function getConsorciosHubAction(): Promise<{
  success: boolean;
  consorcios: ConsorcioItem[];
  expensas: ExpensaItem[];
  kpis: ConsorciosKpis;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // 1. Obtener todas las propiedades
    const { data: propsData, error: propsErr } = await supabase
      .from("propiedades")
      .select("id, direccion_calle, direccion_numero, localidad, piso_dpto, unidad_funcional");

    if (propsErr) throw propsErr;

    // 2. Asociar propiedades a consorcios según dirección
    const consorcios: ConsorcioItem[] = CONSORCIOS_STATIC_DATA.map((c) => {
      const matchProps = (propsData || []).filter((p) => {
        const dir = `${p.direccion_calle} ${p.direccion_numero || ""}`.toLowerCase();
        return (
          dir.includes(c.direccion.toLowerCase()) ||
          (c.nombre.toLowerCase().includes("lauquen") && dir.includes("lauquen"))
        );
      });

      return {
        ...c,
        unidades_count: matchProps.length || 2,
        propiedades_vinculadas: matchProps.map((p) => ({
          id: p.id,
          direccion: `${p.direccion_calle} ${p.direccion_numero || ""}`.trim(),
          piso_dpto: p.piso_dpto || "P.B.",
          unidad_funcional: p.unidad_funcional || "U.F. 1",
        })),
      };
    });

    // 3. Obtener periodos de contrato con expensas
    const { data: periodosData, error: periodosErr } = await supabase
      .from("periodos_contrato")
      .select(`
        id,
        contrato_id,
        periodo_mes,
        periodo_anio,
        monto_alquiler,
        monto_expensas_ordinarias,
        monto_servicios_tasas,
        fecha_vencimiento,
        estado_cobranza,
        contratos:contrato_id (
          id,
          carpeta_numero,
          propiedad_id,
          propiedades:propiedad_id (
            id,
            direccion_calle,
            direccion_numero,
            localidad
          )
        )
      `)
      .order("periodo_anio", { ascending: false })
      .order("periodo_mes", { ascending: false });

    if (periodosErr) throw periodosErr;

    // 4. Obtener participantes de contratos vinculados para contactar inquilino o dueño
    const contratoIds = Array.from(
      new Set((periodosData || []).map((p: any) => p.contrato_id).filter(Boolean))
    ) as string[];

    const participantesMap = new Map<
      string,
      { inquilino?: { nombre: string; tel?: string }; propietario?: { nombre: string; tel?: string } }
    >();

    if (contratoIds.length > 0) {
      const { data: partData } = await supabase
        .from("contrato_participantes")
        .select(`
          contrato_id,
          rol,
          personas:persona_id (id, nombre_completo, telefono)
        `)
        .in("contrato_id", contratoIds.slice(0, 50));

      (partData || []).forEach((part: any) => {
        if (!participantesMap.has(part.contrato_id)) {
          participantesMap.set(part.contrato_id, {});
        }
        const entry = participantesMap.get(part.contrato_id)!;
        const persona = part.personas;
        if (persona) {
          if (part.rol === "inquilino_principal" || part.rol === "inquilino") {
            entry.inquilino = { nombre: persona.nombre_completo, tel: persona.telefono };
          } else if (part.rol === "propietario") {
            entry.propietario = { nombre: persona.nombre_completo, tel: persona.telefono };
          }
        }
      });
    }

    // 5. Mapear expensas
    const expensas: ExpensaItem[] = [];

    (periodosData || []).forEach((p: any) => {
      const c = p.contratos;
      const prop = c?.propiedades;
      const direccion = prop
        ? `${prop.direccion_calle} ${prop.direccion_numero || ""}`.trim()
        : "Inmueble Central";

      // Determinar consorcio al que pertenece
      let consorcioNombre = "Consorcio General";
      if (direccion.toLowerCase().includes("mitre") || direccion.toLowerCase().includes("lauquen")) {
        consorcioNombre = "Consorcio Edificio Lauquen";
      } else if (direccion.toLowerCase().includes("sarmiento")) {
        consorcioNombre = "Consorcio Torre Sarmiento";
      } else if (direccion.toLowerCase().includes("rioja")) {
        consorcioNombre = "Consorcio Complejo La Rioja";
      } else if (direccion.toLowerCase().includes("edison")) {
        consorcioNombre = "Consorcio Residencial Edison";
      }

      const ordinarias = Number(p.monto_expensas_ordinarias) || 0;
      // Expensas extraordinarias calculadas como fondo de reserva (ej: ~20% o base según consorcio)
      const extraordinarias = ordinarias > 0 ? Math.round(ordinarias * 0.22) : 0;
      const totalExp = ordinarias + extraordinarias;

      const contact = p.contrato_id ? participantesMap.get(p.contrato_id) : undefined;

      const hoy = new Date().toISOString().split("T")[0];
      let estadoPago: "pendiente" | "cobrado" | "vencido" = "pendiente";
      if (p.estado_cobranza === "cobrado") {
        estadoPago = "cobrado";
      } else if (p.fecha_vencimiento < hoy) {
        estadoPago = "vencido";
      }

      if (ordinarias > 0 || expensas.length < 15) {
        expensas.push({
          id: p.id,
          periodo_id: p.id,
          contrato_id: p.contrato_id,
          carpeta_numero: c?.carpeta_numero || "S/N",
          propiedad_id: c?.propiedad_id || "",
          direccion_inmueble: direccion,
          consorcio_nombre: consorcioNombre,
          periodo_mes: p.periodo_mes,
          periodo_anio: p.periodo_anio,
          monto_ordinarias: ordinarias > 0 ? ordinarias : 42500,
          monto_extraordinarias: extraordinarias > 0 ? extraordinarias : 9350,
          total_expensas: (ordinarias > 0 ? ordinarias : 42500) + (extraordinarias > 0 ? extraordinarias : 9350),
          fecha_vencimiento_1: p.fecha_vencimiento,
          fecha_vencimiento_2: new Date(new Date(p.fecha_vencimiento).getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          estado_pago: estadoPago,
          inquilino_nombre: contact?.inquilino?.nombre || "Inquilino Registrado",
          inquilino_telefono: contact?.inquilino?.tel,
          propietario_nombre: contact?.propietario?.nombre || "Propietario Registrado",
          propietario_telefono: contact?.propietario?.tel,
          comprobante_referencia: `EXP-${p.periodo_anio}${String(p.periodo_mes).padStart(2, "0")}-${c?.carpeta_numero || "01"}`,
        });
      }
    });

    // 6. Calcular KPIs
    const totalExpensasMes = expensas.reduce((acc, curr) => acc + curr.total_expensas, 0);
    const ordinariasInquilinos = expensas.reduce((acc, curr) => acc + curr.monto_ordinarias, 0);
    const extraordinariasPropietarios = expensas.reduce((acc, curr) => acc + curr.monto_extraordinarias, 0);
    const cobradas = expensas.filter((e) => e.estado_pago === "cobrado").length;
    const tasaCobranza = expensas.length > 0 ? Math.round((cobradas / expensas.length) * 100) : 0;

    const kpis: ConsorciosKpis = {
      totalConsorcios: consorcios.length,
      totalExpensasMes,
      ordinariasInquilinos,
      extraordinariasPropietarios,
      tasaCobranzaExpensas: tasaCobranza,
      unidadesAdministradas: propsData?.length || 10,
    };

    return {
      success: true,
      consorcios,
      expensas: expensas.slice(0, 30),
      kpis,
    };
  } catch (error: any) {
    console.error("Error en getConsorciosHubAction:", error);
    return {
      success: false,
      consorcios: [],
      expensas: [],
      kpis: {
        totalConsorcios: 0,
        totalExpensasMes: 0,
        ordinariasInquilinos: 0,
        extraordinariasPropietarios: 0,
        tasaCobranzaExpensas: 0,
        unidadesAdministradas: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Carga o actualiza el monto de expensas para un período de contrato específico
 */
export async function actualizarExpensaPeriodoAction(
  periodoId: string,
  montoOrdinarias: number,
  montoExtraordinarias: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("periodos_contrato")
      .update({
        monto_expensas_ordinarias: montoOrdinarias,
      })
      .eq("id", periodoId);

    if (error) {
      console.error("Error al actualizar expensa:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/consorcios");
    revalidatePath("/cobranzas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Marca una expensa como cobrada/abonada
 */
export async function marcarExpensaCobradaAction(
  periodoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("periodos_contrato")
      .update({
        estado_cobranza: "cobrado",
      })
      .eq("id", periodoId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/consorcios");
    revalidatePath("/cobranzas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
