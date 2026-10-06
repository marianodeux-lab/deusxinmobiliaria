import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ContratoPdfData {
  carpetaNumero: string;
  tipoContrato: string;
  fechaInicio: string;
  fechaFin: string;
  montoActual: number;
  moneda: "ARS" | "USD";
  tipoAjuste: string;
  frecuenciaAjusteMeses: number;
  inmueble: {
    direccion: string;
    localidad: string;
    provincia?: string;
  };
  locador: {
    nombre: string;
    documento?: string;
    cuit?: string;
    telefono?: string;
    email?: string;
  };
  locatario: {
    nombre: string;
    documento?: string;
    cuit?: string;
    telefono?: string;
    email?: string;
  };
}

export function generarContratoPdf(data: ContratoPdfData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // 1. Encabezado Oficial
  doc.setDrawColor(0, 77, 64);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, contentWidth, 265, "S");

  doc.setFillColor(0, 77, 64);
  doc.rect(margin, margin, contentWidth, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTRATO DE LOCACIÓN INMOBILIARIA", pageWidth / 2, margin + 11, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`EXPEDIENTE DE LOCACIÓN Nº ${data.carpetaNumero} | RÉGIMEN DNU 70/2023`, pageWidth / 2, margin + 16, { align: "center" });

  // 2. Partes Intervinientes
  let y = margin + 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("1. PARTES INTERVINIENTES", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const locadorText = `Entre el/la Sr./Sra. ${data.locador.nombre.toUpperCase()}, DNI/CUIT Nº ${data.locador.cuit || data.locador.documento || "Consta en legajo"}, en adelante denominado el "LOCADOR" por una parte; y por la otra parte el/la Sr./Sra. ${data.locatario.nombre.toUpperCase()}, DNI/CUIT Nº ${data.locatario.cuit || data.locatario.documento || "Consta en legajo"}, en adelante denominado el "LOCATARIO", convienen en celebrar el presente Contrato de Locación.`;
  const locadorLines = doc.splitTextToSize(locadorText, contentWidth - 12);
  doc.text(locadorLines, margin + 6, y);
  y += locadorLines.length * 4.5 + 4;

  // 3. Objeto e Inmueble
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("2. OBJETO DE LA LOCACIÓN", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const objetoText = `El LOCADOR cede en locación al LOCATARIO, y éste acepta de plena conformidad, el inmueble ubicado en ${data.inmueble.direccion}, localidad de ${data.inmueble.localidad}, provincia de ${data.inmueble.provincia || "Buenos Aires"}. El inmueble se destinará exclusivamente a ${data.tipoContrato.toUpperCase()}, estándole expresamente prohibido variar dicho destino o subalquilarlo.`;
  const objetoLines = doc.splitTextToSize(objetoText, contentWidth - 12);
  doc.text(objetoLines, margin + 6, y);
  y += objetoLines.length * 4.5 + 4;

  // 4. Plazo de Vigencia
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("3. PLAZO DE VIGENCIA", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const plazoText = `El presente contrato tendrá vigencia formal a partir del día ${formatDate(data.fechaInicio)}, venciendo indefectiblemente de pleno derecho el día ${formatDate(data.fechaFin)}, oportunidad en la cual el LOCATARIO restituirá el inmueble totalmente desocupado y en el mismo estado en que lo recibe.`;
  const plazoLines = doc.splitTextToSize(plazoText, contentWidth - 12);
  doc.text(plazoLines, margin + 6, y);
  y += plazoLines.length * 4.5 + 4;

  // 5. Canon Locativo y Mecanismo de Indexación
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("4. PRECIO DEL ALQUILER E INDEXACIÓN", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const precioText = `El canon locativo actual pactado se fija en la suma de ${formatCurrency(data.montoActual, data.moneda)}, a abonarse por mes adelantado del 1 al 10 de cada mes calendario. Las partes acuerdan libremente que dicho importe se ajustará periódicamente cada ${data.frecuenciaAjusteMeses} meses conforme a la variación oficial del índice ${data.tipoAjuste} (publicado por el BCRA / INDEC).`;
  const precioLines = doc.splitTextToSize(precioText, contentWidth - 12);
  doc.text(precioLines, margin + 6, y);
  y += precioLines.length * 4.5 + 6;

  // 6. Resumen de Cláusulas en Tabla
  autoTable(doc, {
    startY: y,
    margin: { left: margin + 6, right: margin + 6 },
    head: [["Parámetro Contractual", "Detalle Acordado"]],
    body: [
      ["Carpeta de Locación", `#${data.carpetaNumero}`],
      ["Inmueble Locado", `${data.inmueble.direccion} - ${data.inmueble.localidad}`],
      ["Locador / Titular", data.locador.nombre],
      ["Locatario / Inquilino", data.locatario.nombre],
      ["Vigencia Contractual", `${formatDate(data.fechaInicio)} al ${formatDate(data.fechaFin)}`],
      ["Valor Alquiler Vigente", formatCurrency(data.montoActual, data.moneda)],
      ["Fórmula de Indexación", `${data.tipoAjuste} (cada ${data.frecuenciaAjusteMeses} meses)`],
      ["Régimen Legal", "DNU 70/2023 - Código Civil y Comercial de la Nación"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [0, 77, 64],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  // 7. Firmas de Conformidad
  const signY = 240;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Firma Locador
  doc.line(margin + 15, signY, margin + 70, signY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("FIRMA DEL LOCADOR", margin + 42.5, signY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(data.locador.nombre, margin + 42.5, signY + 8, { align: "center" });

  // Firma Locatario
  doc.line(pageWidth - margin - 70, signY, pageWidth - margin - 15, signY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FIRMA DEL LOCATARIO", pageWidth - margin - 42.5, signY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(data.locatario.nombre, pageWidth - margin - 42.5, signY + 8, { align: "center" });

  // Pie legal
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Documento instrumentado a través de DeusX Inmobiliarias ERP PropTech. Fecha de emisión: ${formatDate(new Date())}.`,
    pageWidth / 2,
    signY + 22,
    { align: "center" }
  );

  // Descarga limpia del archivo
  const cleanCarpeta = (data.carpetaNumero || "Locacion").replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `Contrato_Locacion_Carpeta_${cleanCarpeta}.pdf`;

  try {
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    doc.save(filename);
  }
}

export interface CláusulaLegal {
  numero: string;
  titulo: string;
  contenido: string;
}

export interface ContratoLegalCompletoData extends ContratoPdfData {
  depositoMeses?: number;
  depositoMonto?: number;
  garante?: {
    nombre: string;
    documento: string;
    tipoGarantia?: string;
    domicilio?: string;
  };
  jurisdiccion?: string;
  clausulasPersonalizadas?: CláusulaLegal[];
}

/**
 * Genera el Contrato Legal Articulado Completo (12 Cláusulas Oficiales de Colegios de Martilleros post DNU 70/2023)
 */
export function generarContratoLegalCompletoPdf(data: ContratoLegalCompletoData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`EXPEDIENTE DE LOCACIÓN #${data.carpetaNumero} • RÉGIMEN DNU 70/2023 & CCCN`, margin, 10);
    doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, 10, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // Página 1: Título Principal
  drawHeaderFooter();
  y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 77, 64);
  doc.text("CONTRATO DE LOCACIÓN DE INMUEBLE", pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`DESTINO: HABITACIONAL • RÉGIMEN DNU 70/2023 • CARPETA #${data.carpetaNumero}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Cláusulas canónicas
  const clausulasDefault: CláusulaLegal[] = [
    {
      numero: "PRIMERA",
      titulo: "PARTES Y DOMICILIOS ELECTRÓNICOS",
      contenido: `Entre el/la Sr./Sra. ${data.locador.nombre.toUpperCase()}, DNI/CUIT Nº ${data.locador.cuit || data.locador.documento || "S/D"}, con domicilio especial electrónico en ${data.locador.email || "declarado en legajo"}, en adelante el "LOCADOR"; y por la otra parte el/la Sr./Sra. ${data.locatario.nombre.toUpperCase()}, DNI/CUIT Nº ${data.locatario.cuit || data.locatario.documento || "S/D"}, con domicilio especial electrónico en ${data.locatario.email || "declarado en legajo"}, en adelante el "LOCATARIO", convienen en celebrar el presente Contrato de Locación Inmobiliaria.`,
    },
    {
      numero: "SEGUNDA",
      titulo: "OBJETO Y DESTINO",
      contenido: `El LOCADOR cede en locación al LOCATARIO, y éste acepta, el inmueble ubicado en ${data.inmueble.direccion}, localidad de ${data.inmueble.localidad}, provincia de ${data.inmueble.provincia || "Buenos Aires"}. El inmueble se destinará exclusivamente a VIVIENDA UNIFAMILIAR (HABITACIONAL), estándole expresamente prohibido variar dicho destino, ceder, transferir o sublocar total o parcialmente el bien, bajo apercibimiento de resolución contractual y desalojo inmediato.`,
    },
    {
      numero: "TERCERA",
      titulo: "PLAZO DE VIGENCIA",
      contenido: `El plazo de locación se pacta libremente entre las partes (art. 1198 CCyC) en 24 (veinticuatro) meses a partir del día ${formatDate(data.fechaInicio)}, finalizando indefectiblemente de pleno derecho el día ${formatDate(data.fechaFin)}, sin necesidad de notificación o requerimiento judicial o extrajudicial previo.`,
    },
    {
      numero: "CUARTA",
      titulo: "PRECIO DEL ALQUILER Y PAGO",
      contenido: `El precio inicial de la locación se establece en la suma de ${formatCurrency(data.montoActual, data.moneda)} mensuales. El canon locativo se abonará por mes adelantado del 1 al 10 de cada mes calendario mediante transferencia bancaria o en el domicilio de la administración inmobiliaria designada. La mora se operará por el mero vencimiento de los plazos sin necesidad de interpelación alguna.`,
    },
    {
      numero: "QUINTA",
      titulo: "MECANISMO DE INDEXACIÓN",
      contenido: `El canon locativo pactado se ajustará periódicamente cada ${data.frecuenciaAjusteMeses} meses conforme a la variación oficial acumulada del índice ${data.tipoAjuste} (publicado por el Banco Central de la República Argentina o INDEC). En caso de discontinuidad o falta de publicación del índice de referencia, se utilizará en su defecto el Índice de Precios al Consumidor (IPC).`,
    },
    {
      numero: "SEXTA",
      titulo: "INTERESES POR MORA",
      contenido: `En caso de retraso en el pago del canon locativo, el LOCATARIO devengará un interés punitorio compensatorio del 0.15% diario sobre el monto adeudado hasta la fecha de su efectivo pago. La falta de pago de dos mensualidades consecutivas facultará al LOCADOR a demandar el desalojo inmediato del inmueble y el cobro ejecutivo de alquileres.`,
    },
    {
      numero: "SÉPTIMA",
      titulo: "SERVICIOS PÚBLICOS, TASAS Y EXPENSAS",
      contenido: `Serán por cuenta exclusiva del LOCATARIO el pago de los consumos de energía eléctrica, gas natural, provisión de agua corriente y las EXPENSAS ORDINARIAS del inmueble. El LOCADOR asumirá las cargas correspondientes a expensas extraordinarias y tributos sobre el inmueble (Impuesto Inmobiliario ARBA / Tasa Municipal sobre la propiedad).`,
    },
    {
      numero: "OCTAVA",
      titulo: "ESTADO DEL INMUEBLE Y CONSERVACIÓN",
      contenido: `El LOCATARIO declara recibir el inmueble en perfecto estado de conservación, pintura e higiene, con todos sus artefactos, canillas, cerraduras y vidrios sanos y funcionando. Se obliga a mantenerlo y restituirlo en las mismas condiciones, haciéndose cargo de las reparaciones locativas menores debidas al uso ordinario.`,
    },
    {
      numero: "NOVENA",
      titulo: "DEPÓSITO EN GARANTÍA",
      contenido: `En garantía del fiel cumplimiento de las obligaciones asumidas, el LOCATARIO entrega en este acto la suma de ${formatCurrency(data.depositoMonto || data.montoActual, data.moneda)}, sirviendo el presente de eficaz recibo. Dicho depósito no podrá aplicarse al pago de alquileres y será reintegrado al LOCATARIO al momento de la restitución de llaves, una vez deducidas las eventuales deudas de servicios, expensas o deterioros comprobados.`,
    },
    {
      numero: "DÉCIMA",
      titulo: "RESCISIÓN ANTICIPADA (ART. 1221 CCyC)",
      contenido: `El LOCATARIO podrá rescindir el contrato en cualquier momento una vez transcurridos los primeros 6 meses de vigencia, notificando fehacientemente al LOCADOR con al menos un mes de anticipación y abonando en concepto de indemnización el 10% del saldo restante del canon locativo.`,
    },
    {
      numero: "UNDÉCIMA",
      titulo: "GARANTÍA Y FIANZA SOLIDARIA",
      contenido: `Presente en este acto el/la Sr./Sra. ${data.garante?.nombre || "Garante con fianza certificada"}, DNI Nº ${data.garante?.documento || "constante en legajo"}, se constituye en FIADOR PRINCIPAL PAGADOR, liso, llano y solidario de todas las obligaciones asumidas por el LOCATARIO, renunciando expresamente a los beneficios de división y excusión, subsistiendo la fianza hasta la efectiva restitución y desocupación del inmueble.`,
    },
    {
      numero: "DUODÉCIMA",
      titulo: "JURISDICCIÓN JUDICIAL",
      contenido: `Para todos los efectos legales y judiciales emergentes del presente contrato, las partes se someten a la jurisdicción de los Tribunales Ordinarios del Departamento Judicial de ${data.jurisdiccion || "la Provincia de Buenos Aires"}, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponderles.`,
    },
  ];

  const clausulasAFichar = data.clausulasPersonalizadas && data.clausulasPersonalizadas.length > 0
    ? data.clausulasPersonalizadas
    : clausulasDefault;

  // Renderizar cláusulas
  for (const c of clausulasAFichar) {
    const bloqueTitulo = `CLÁUSULA ${c.numero}: ${c.titulo}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 77, 64);

    const lineasTitulo = doc.splitTextToSize(bloqueTitulo, contentWidth);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    const lineasCuerpo = doc.splitTextToSize(c.contenido, contentWidth);

    const espacioNecesario = lineasTitulo.length * 4.5 + lineasCuerpo.length * 4 + 6;
    checkPageBreak(espacioNecesario);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 77, 64);
    doc.text(lineasTitulo, margin, y);
    y += lineasTitulo.length * 4.5 + 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);
    doc.text(lineasCuerpo, margin, y);
    y += lineasCuerpo.length * 4 + 4.5;
  }

  // Firmas
  checkPageBreak(35);
  y += 10;
  const colW = (contentWidth - 12) / 3;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Locador
  doc.line(margin, y, margin + colW, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("FIRMA LOCADOR", margin + colW / 2, y + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(data.locador.nombre, margin + colW / 2, y + 7.5, { align: "center" });

  // Locatario
  doc.line(margin + colW + 6, y, margin + colW * 2 + 6, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("FIRMA LOCATARIO", margin + colW * 1.5 + 6, y + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(data.locatario.nombre, margin + colW * 1.5 + 6, y + 7.5, { align: "center" });

  // Fiador
  doc.line(margin + colW * 2 + 12, y, margin + contentWidth, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("FIRMA FIADOR / GARANTE", margin + colW * 2.5 + 12, y + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(data.garante?.nombre || "Garante Solidario", margin + colW * 2.5 + 12, y + 7.5, { align: "center" });

  const cleanCarpeta = (data.carpetaNumero || "Locacion").replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `Contrato_Legal_Articulado_Carpeta_${cleanCarpeta}.pdf`;

  try {
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    doc.save(filename);
  }
}

