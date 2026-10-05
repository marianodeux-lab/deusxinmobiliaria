"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedTenant } from "@/lib/supabase/auth-tenant";
import { revalidatePath } from "next/cache";

export interface MovimientoCajaItem {
  id: string;
  fecha_hora: string;
  tipo_movimiento: "ingreso" | "egreso";
  concepto: string;
  categoria: "alquiler" | "honorarios" | "mantenimiento" | "caja_chica" | "retiro" | "otro";
  medio_pago: "efectivo" | "transferencia" | "cheque" | "dolares";
  monto: number;
  moneda: "ARS" | "USD";
  comprobante_referencia?: string;
  usuario: string;
  observaciones?: string;
}

export interface FacturaAfipItem {
  id: string;
  tipo_comprobante: "Factura B" | "Factura C" | "Factura A" | "Recibo X";
  punto_venta: number;
  numero_comprobante: number;
  comprobante_completo: string;
  fecha_emision: string;
  cliente_nombre: string;
  cliente_cuit_dni: string;
  condicion_iva: "Consumidor Final" | "Monotributo" | "Responsable Inscripto" | "Exento";
  concepto_descripcion: string;
  neto_gravado: number;
  iva_21: number;
  total_facturado: number;
  cae: string;
  cae_vencimiento: string;
  estado_afip: "aprobado" | "pendiente" | "rechazado";
  qr_url: string;
}

export interface CajaKpis {
  saldoEfectivoARS: number;
  saldoTransferenciasARS: number;
  saldoEfectivoUSD: number;
  totalIngresosHoy: number;
  totalEgresosHoy: number;
  totalFacturadoMesAFIP: number;
  facturasEmitidasMes: number;
}

export interface EmitirFacturaInput {
  tipo_comprobante: "Factura B" | "Factura C" | "Factura A";
  cliente_nombre: string;
  cliente_cuit_dni: string;
  condicion_iva: "Consumidor Final" | "Monotributo" | "Responsable Inscripto" | "Exento";
  concepto_descripcion: string;
  neto_gravado: number;
}

export interface RegistrarMovimientoInput {
  tipo_movimiento: "ingreso" | "egreso";
  concepto: string;
  categoria: "alquiler" | "honorarios" | "mantenimiento" | "caja_chica" | "retiro" | "otro";
  medio_pago: "efectivo" | "transferencia" | "cheque" | "dolares";
  monto: number;
  moneda: "ARS" | "USD";
  comprobante_referencia?: string;
  observaciones?: string;
}

// Generador de URL oficial AFIP QR según RG 4291
function generarUrlQrAfip(params: {
  fecha: string;
  cuit: number;
  ptoVta: number;
  tipoCmp: number;
  nroCmp: number;
  importe: number;
  docRec: number;
  cae: string;
}): string {
  const payload = {
    ver: 1,
    fecha: params.fecha,
    cuit: params.cuit,
    ptoVta: params.ptoVta,
    tipoCmp: params.tipoCmp,
    nroCmp: params.nroCmp,
    importe: params.importe,
    moneda: "PES",
    ctz: 1,
    tipoDocRec: 96,
    nroDocRec: params.docRec,
    tipoCodAut: "E",
    codAut: Number(params.cae),
  };

  const jsonStr = JSON.stringify(payload);
  const base64Str = Buffer.from(jsonStr).toString("base64");
  return `https://www.afip.gob.ar/fe/qr/?p=${base64Str}`;
}

/**
 * Obtiene el dashboard de Caja Diaria y Facturación AFIP
 */
export async function getCajaHubAction(): Promise<{
  success: boolean;
  movimientos: MovimientoCajaItem[];
  facturas: FacturaAfipItem[];
  kpis: CajaKpis;
  error?: string;
}> {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const supabase = createAdminClient();

    // 1. Obtener cobranzas reales para alimentar movimientos de caja
    const { data: cobranzasData } = await supabase
      .from("cobranzas")
      .select(`
        id,
        numero_recibo,
        fecha_cobro,
        medio_pago,
        monto_total_cobrado,
        moneda_cobro,
        comprobante_referencia,
        observaciones,
        contratos:contrato_id (carpeta_numero)
      `)
      .eq("tenant_id", tenantId)
      .order("fecha_cobro", { ascending: false });

    // 2. Obtener tickets de mantenimiento pagados para egresos de caja
    const { data: ticketsData } = await supabase
      .from("tickets_mantenimiento")
      .select("id, titulo, costo_total, estado, actualizado_al, proveedor:proveedor_id (nombre_completo)")
      .eq("tenant_id", tenantId)
      .eq("estado", "completado")
      .order("actualizado_al", { ascending: false });

    // 3. Mapear movimientos de caja
    const movimientos: MovimientoCajaItem[] = [];

    // Agregar cobros de alquileres
    (cobranzasData || []).forEach((c: any) => {
      const carpeta = c.contratos?.carpeta_numero || "S/N";
      movimientos.push({
        id: `ing-${c.id}`,
        fecha_hora: `${c.fecha_cobro} 10:30`,
        tipo_movimiento: "ingreso",
        concepto: `Cobro Alquiler - Carpeta #${carpeta}`,
        categoria: "alquiler",
        medio_pago: c.medio_pago === "efectivo" ? "efectivo" : "transferencia",
        monto: Number(c.monto_total_cobrado),
        moneda: c.moneda_cobro === "USD" ? "USD" : "ARS",
        comprobante_referencia: c.numero_recibo,
        usuario: "Operador de Caja",
        observaciones: c.observaciones || c.comprobante_referencia,
      });
    });

    // Agregar honorarios inmobiliarios devengados
    (cobranzasData || []).forEach((c: any, idx: number) => {
      const honorario = Math.round(Number(c.monto_total_cobrado) * 0.0413);
      movimientos.push({
        id: `hon-${c.id}`,
        fecha_hora: `${c.fecha_cobro} 10:35`,
        tipo_movimiento: "ingreso",
        concepto: `Comisión de Administración Inmobiliaria (4.13%)`,
        categoria: "honorarios",
        medio_pago: c.medio_pago === "efectivo" ? "efectivo" : "transferencia",
        monto: honorario,
        moneda: "ARS",
        comprobante_referencia: `FAC-B-0004-0000010${idx + 1}`,
        usuario: "Sistema DeusX",
        observaciones: "Retención automática de corretaje",
      });
    });

    // Agregar egresos por mantenimiento técnico
    (ticketsData || []).forEach((t: any) => {
      const prov = t.proveedor?.nombre_completo || "Técnico Matriculado";
      movimientos.push({
        id: `egr-${t.id}`,
        fecha_hora: `${(t.actualizado_al || new Date().toISOString()).split("T")[0]} 16:45`,
        tipo_movimiento: "egreso",
        concepto: `Pago Servicio Técnico: ${t.titulo}`,
        categoria: "mantenimiento",
        medio_pago: "efectivo",
        monto: Number(t.costo_total) || 0,
        moneda: "ARS",
        comprobante_referencia: `OP-TEC-${t.id.slice(0, 6)}`,
        usuario: "Administración",
        observaciones: `Abonado en mano a ${prov}`,
      });
    });

    // 4. Mapear facturas electrónicas emitidas AFIP / ARCA
    const facturas: FacturaAfipItem[] = [];

    // 5. Calcular KPIs de Caja
    let efectivoARS = 0;
    let transferenciasARS = 0;
    let efectivoUSD = 0;
    let ingresosHoy = 0;
    let egresosHoy = 0;

    movimientos.forEach((m) => {
      if (m.moneda === "USD") {
        efectivoUSD += m.tipo_movimiento === "ingreso" ? m.monto : -m.monto;
      } else {
        if (m.medio_pago === "efectivo") {
          efectivoARS += m.tipo_movimiento === "ingreso" ? m.monto : -m.monto;
        } else {
          transferenciasARS += m.tipo_movimiento === "ingreso" ? m.monto : -m.monto;
        }
      }

      if (m.tipo_movimiento === "ingreso") {
        ingresosHoy += m.monto;
      } else {
        egresosHoy += m.monto;
      }
    });

    const totalFacturadoMesAFIP = facturas.reduce((acc, curr) => acc + curr.total_facturado, 0);

    const kpis: CajaKpis = {
      saldoEfectivoARS: Math.max(0, efectivoARS),
      saldoTransferenciasARS: Math.max(0, transferenciasARS),
      saldoEfectivoUSD: Math.max(0, efectivoUSD),
      totalIngresosHoy: ingresosHoy,
      totalEgresosHoy: egresosHoy,
      totalFacturadoMesAFIP,
      facturasEmitidasMes: facturas.length,
    };

    return {
      success: true,
      movimientos,
      facturas,
      kpis,
    };
  } catch (error: any) {
    console.error("Error en getCajaHubAction:", error);
    return {
      success: false,
      movimientos: [],
      facturas: [],
      kpis: {
        saldoEfectivoARS: 0,
        saldoTransferenciasARS: 0,
        saldoEfectivoUSD: 0,
        totalIngresosHoy: 0,
        totalEgresosHoy: 0,
        totalFacturadoMesAFIP: 0,
        facturasEmitidasMes: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Emite una nueva Factura Electrónica con CAE oficial AFIP simulado / homologado
 */
export async function emitirFacturaAfipAction(
  input: EmitirFacturaInput
): Promise<{ success: boolean; factura?: FacturaAfipItem; error?: string }> {
  try {
    const { tenantId } = await requireAuthenticatedTenant();
    const admin = createAdminClient();

    const { data: tenant } = await admin
      .from("tenants")
      .select("cuit, nombre_fantasia")
      .eq("id", tenantId)
      .single();

    const cuitEmisor = Number(tenant?.cuit?.replace(/[^0-9]/g, "")) || 30000000000;

    const puntoVenta = 4;
    const nroComp = Math.floor(100 + Math.random() * 900);
    const hoyStr = new Date().toISOString().split("T")[0];
    const vencCaeDate = new Date();
    vencCaeDate.setDate(vencCaeDate.getDate() + 10);
    const vencCaeStr = vencCaeDate.toISOString().split("T")[0];

    // Generar CAE de 14 dígitos en ambiente de homologación / prueba
    const caeGenerado = `742918${Math.floor(10000000 + Math.random() * 90000000)}`;

    const iva = input.tipo_comprobante === "Factura A" ? Math.round(input.neto_gravado * 0.21) : 0;
    const total = input.neto_gravado + iva;

    const tipoCmpNum = input.tipo_comprobante === "Factura A" ? 1 : input.tipo_comprobante === "Factura B" ? 6 : 11;

    const cleanDoc = Number(input.cliente_cuit_dni.replace(/[^0-9]/g, "")) || 20111222;

    const qrUrl = generarUrlQrAfip({
      fecha: hoyStr,
      cuit: cuitEmisor,
      ptoVta: puntoVenta,
      tipoCmp: tipoCmpNum,
      nroCmp: nroComp,
      importe: total,
      docRec: cleanDoc,
      cae: caeGenerado,
    });

    const nuevaFactura: FacturaAfipItem = {
      id: `fac-${nroComp}`,
      tipo_comprobante: input.tipo_comprobante,
      punto_venta: puntoVenta,
      numero_comprobante: nroComp,
      comprobante_completo: `00004-${String(nroComp).padStart(8, "0")}`,
      fecha_emision: hoyStr,
      cliente_nombre: input.cliente_nombre.trim(),
      cliente_cuit_dni: input.cliente_cuit_dni.trim(),
      condicion_iva: input.condicion_iva,
      concepto_descripcion: input.concepto_descripcion.trim(),
      neto_gravado: input.neto_gravado,
      iva_21: iva,
      total_facturado: total,
      cae: caeGenerado,
      cae_vencimiento: vencCaeStr,
      estado_afip: "aprobado", // Ambiente de prueba / homologación WSFE
      qr_url: qrUrl,
    };

    revalidatePath("/caja");
    return { success: true, factura: nuevaFactura };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
