/**
 * Helper para generación de enlaces y mensajes oficiales de WhatsApp
 * para Inquilinos y Propietarios (RG AFIP 4004-E & Recordatorios).
 */

export function sanitizarTelefono(telefono?: string): string {
  if (!telefono) return "";
  const cleaned = telefono.replace(/[^0-9]/g, "");
  // Si empieza con 0, reemplazar por 549 (ej: 02317... -> 5492317...)
  if (cleaned.startsWith("0")) {
    return `549${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("15")) {
    return `54911${cleaned.slice(2)}`;
  }
  if (!cleaned.startsWith("54")) {
    return `549${cleaned}`;
  }
  return cleaned;
}

export function buildWhatsAppLink(telefono: string, mensaje: string): string {
  const cel = sanitizarTelefono(telefono);
  const text = encodeURIComponent(mensaje);
  return `https://wa.me/${cel}?text=${text}`;
}

export function crearMensajeReciboAlquiler(params: {
  inquilinoNombre: string;
  carpetaNumero: string;
  direccion: string;
  periodo: string;
  montoTotal: string;
  reciboNumero: string;
}): string {
  return `*DEUSX INMOBILIARIAS - COMPROBANTE OFICIAL DE PAGO*\n\n` +
    `Estimado/a *${params.inquilinoNombre}*,\n` +
    `Confirmamos la recepción del pago del alquiler de *${params.direccion}* (Carpeta #${params.carpetaNumero}).\n\n` +
    `📄 *Recibo Oficial:* Nº ${params.reciboNumero} (RG AFIP 4004-E)\n` +
    `🗓 *Período:* ${params.periodo}\n` +
    `💰 *Importe Percibido:* ${params.montoTotal}\n` +
    `✅ *Estado:* Totalmente Cancelado\n\n` +
    `El recibo oficial en formato digital PDF ya se encuentra registrado y disponible en administración.\n` +
    `¡Muchas gracias por su puntualidad!`;
}

export function crearMensajeAvisoVencimiento(params: {
  inquilinoNombre: string;
  carpetaNumero: string;
  direccion: string;
  monto: string;
  fechaVencimiento: string;
  cbuAlias?: string;
}): string {
  return `*DEUSX INMOBILIARIAS - AVISO DE VENCIMIENTO DE ALQUILER*\n\n` +
    `Estimado/a *${params.inquilinoNombre}*,\n` +
    `Le recordamos que el próximo *${params.fechaVencimiento}* opera el vencimiento del canon locativo correspondiente a *${params.direccion}* (Carpeta #${params.carpetaNumero}).\n\n` +
    `💵 *Monto a abonar:* ${params.monto}\n` +
    (params.cbuAlias ? `🏦 *CBU / Alias para transferencia:* ${params.cbuAlias}\n\n` : `\n`) +
    `Una vez realizada la transferencia, solicitamos remitir el comprobante por este medio para la emisión inmediata de su Recibo X Oficial.\n\n` +
    `Saludos cordiales,\n*Administración de Alquileres*`;
}

export function crearMensajeLiquidacionPropietario(params: {
  propietarioNombre: string;
  carpetaNumero: string;
  direccion: string;
  montoNeto: string;
  periodo: string;
}): string {
  return `*DEUSX INMOBILIARIAS - LIQUIDACIÓN DE ALQUILER PERCIBIDO*\n\n` +
    `Estimado/a *${params.propietarioNombre}*,\n` +
    `Le informamos que el inquilino ha cancelado el canon de *${params.direccion}* (Carpeta #${params.carpetaNumero}) correspondiente a *${params.periodo}*.\n\n` +
    `💵 *Monto Neto Liquidado:* ${params.montoNeto}\n` +
    `🏦 *Destino:* Transferido a su cuenta bancaria declarada.\n\n` +
    `La rendición de cuentas y constancia se encuentra archivada en administración.\n` +
    `Saludos cordiales,\n*Deus Inmobiliaria*`;
}
