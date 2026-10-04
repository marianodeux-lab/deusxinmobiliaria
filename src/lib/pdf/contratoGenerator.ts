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
