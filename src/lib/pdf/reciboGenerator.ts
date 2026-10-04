import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReciboPdfData {
  numeroRecibo: string;
  fechaEmision: string;
  carpetaNumero: string;
  inmobiliaria: {
    nombre: string;
    cuit: string;
    domicilio: string;
    localidad: string;
    telefono: string;
    matricula: string;
    condicionIva: string;
  };
  inquilino: {
    nombre: string;
    documento: string;
    telefono?: string;
  };
  propietario: {
    nombre: string;
    documento: string;
  };
  inmueble: {
    direccion: string;
    localidad: string;
  };
  periodoMesAnio: string;
  conceptos: {
    detalle: string;
    importe: number;
  }[];
  total: number;
  moneda: "ARS" | "USD";
  medioPago: string;
  observaciones?: string;
}

export function generarReciboPdf(data: ReciboPdfData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Marco exterior elegante
  doc.setDrawColor(200, 210, 215);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, 268, "S");

  // 2. Encabezado - Cuadro X Central (RG AFIP 4004-E)
  const boxX = pageWidth / 2 - 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(boxX, margin, 16, 14, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 77, 64); // #004d40
  doc.text("X", pageWidth / 2, margin + 9, { align: "center" });

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 110, 120);
  doc.text("DOC. NO VÁLIDO", pageWidth / 2, margin + 12.5, { align: "center" });

  // 3. Encabezado Izquierdo: Inmobiliaria
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(data.inmobiliaria.nombre, margin + 5, margin + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Domicilio: ${data.inmobiliaria.domicilio} - ${data.inmobiliaria.localidad}`, margin + 5, margin + 14);
  doc.text(`Tel: ${data.inmobiliaria.telefono} | Matrícula: ${data.inmobiliaria.matricula}`, margin + 5, margin + 18);
  doc.text(`IVA: ${data.inmobiliaria.condicionIva} | CUIT: ${data.inmobiliaria.cuit}`, margin + 5, margin + 22);

  // 4. Encabezado Derecho: Datos del Recibo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 77, 64);
  doc.text("RECIBO DE COBRO", pageWidth - margin - 5, margin + 8, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nº ${data.numeroRecibo}`, pageWidth - margin - 5, margin + 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha: ${data.fechaEmision}`, pageWidth - margin - 5, margin + 18, { align: "right" });
  doc.text(`Carpeta Locación: #${data.carpetaNumero}`, pageWidth - margin - 5, margin + 22, { align: "right" });

  // Línea divisoria de encabezado
  doc.setDrawColor(200, 210, 215);
  doc.line(margin, margin + 26, pageWidth - margin, margin + 26);

  // 5. Bloque de Datos del Inquilino y Propietario
  let y = margin + 32;

  // Leyenda RG 4004-E
  doc.setFillColor(241, 248, 245);
  doc.rect(margin + 2, y - 4, contentWidth - 4, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 77, 64);
  doc.text(
    "COBRANZA POR CUENTA Y ORDEN DE TERCEROS - LOCACIÓN DE INMUEBLE (RG AFIP Nº 4004-E)",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 8;

  // Inquilino (Locatario)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("RECIBIMOS DE (Locatario):", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.inquilino.nombre} (${data.inquilino.documento})`, margin + 48, y);

  y += 5.5;

  // Inmueble
  doc.setFont("helvetica", "bold");
  doc.text("INMUEBLE ARRENDADO:", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.inmueble.direccion} - ${data.inmueble.localidad}`, margin + 48, y);

  y += 5.5;

  // Propietario (Locador)
  doc.setFont("helvetica", "bold");
  doc.text("POR CUENTA Y ORDEN DE (Locador):", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.propietario.nombre} (${data.propietario.documento})`, margin + 60, y);

  y += 5.5;

  // Período
  doc.setFont("helvetica", "bold");
  doc.text("PERÍODO IMPUTADO:", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.periodoMesAnio}`, margin + 48, y);

  y += 5;

  // 6. Tabla de Conceptos Detallados con autoTable
  const tableData = data.conceptos.map((c) => [
    c.detalle,
    data.moneda === "USD" ? `USD ${c.importe.toFixed(2)}` : `$ ${c.importe.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin + 2, right: margin + 2 },
    theme: "striped",
    headStyles: {
      fillColor: [0, 77, 64],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 45, fontSize: 8 },
      1: { cellWidth: 41, halign: "right", fontStyle: "bold", fontSize: 8 },
    },
    head: [["DETALLE / CONCEPTO DEVENGADO", "IMPORTE PERCIBIDO"]],
    body: tableData,
    styles: {
      cellPadding: 2.5,
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // 7. Totalizador
  doc.setFillColor(241, 245, 249);
  doc.rect(pageWidth - margin - 65, finalY, 63, 12, "F");
  doc.setDrawColor(200, 210, 215);
  doc.rect(pageWidth - margin - 65, finalY, 63, 12, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL PERCIBIDO:", pageWidth - margin - 62, finalY + 7);

  doc.setFontSize(10.5);
  doc.setTextColor(0, 77, 64);
  const totalStr =
    data.moneda === "USD"
      ? `USD ${data.total.toFixed(2)}`
      : `$ ${data.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
  doc.text(totalStr, pageWidth - margin - 4, finalY + 7.5, { align: "right" });

  // 8. Forma de pago y aclaraciones
  let noteY = finalY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("FORMA DE PAGO:", margin + 5, noteY);
  doc.setFont("helvetica", "normal");
  doc.text(data.medioPago, margin + 35, noteY);

  if (data.observaciones) {
    noteY += 5;
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVACIONES:", margin + 5, noteY);
    doc.setFont("helvetica", "normal");
    doc.text(data.observaciones, margin + 35, noteY);
  }

  // 9. Leyenda de validez y firma digitalizada
  const footerY = 250;
  doc.setDrawColor(200, 210, 215);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  // Espacio para firma a la derecha
  doc.line(pageWidth - margin - 60, footerY + 18, pageWidth - margin - 10, footerY + 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("POR LA INMOBILIARIA ADMINISTRADORA", pageWidth - margin - 35, footerY + 22, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(data.inmobiliaria.matricula, pageWidth - margin - 35, footerY + 25.5, { align: "center" });

  // Leyenda al pie
  doc.setFontSize(7);
  doc.text(
    "El presente recibo es constancia fehaciente de cancelación del período indicado según las condiciones pactadas en el contrato de locación.",
    margin + 5,
    footerY + 12
  );
  doc.text(
    "Generado digitalmente por DeusX Inmobiliarias ERP PropTech. La validez legal está sujeta a la acreditación efectiva de los fondos.",
    margin + 5,
    footerY + 16
  );

  // Descargar archivo PDF con nombre sanitizado (sin '#' ni caracteres que rompan la descarga en Chrome)
  const cleanCarpeta = (data.carpetaNumero || "Locacion").replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanPeriodo = (data.periodoMesAnio || "Periodo").replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanNumero = (data.numeroRecibo || "0001").replace(/[^a-zA-Z0-9_-]/g, "-");
  const filename = `Recibo_X_Oficial_Nro_${cleanNumero}_Carpeta_${cleanCarpeta}_${cleanPeriodo}.pdf`;

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
