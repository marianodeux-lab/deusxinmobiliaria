import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface LiquidacionPdfData {
  numeroLiquidacion: string;
  fechaLiquidacion: string;
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
  propietario: {
    nombre: string;
    documento: string;
    telefono?: string;
    cbu_alias?: string;
    cuentaBancaria?: string;
  };
  inquilino: {
    nombre: string;
    documento: string;
  };
  inmueble: {
    direccion: string;
    localidad: string;
  };
  periodoMesAnio: string;
  reciboReferencia?: string;
  ingresos: {
    detalle: string;
    importe: number;
  }[];
  deducciones: {
    detalle: string;
    importe: number;
  }[];
  totalBruto: number;
  totalDeducciones: number;
  totalNeto: number;
  moneda: "ARS" | "USD";
  medioPago: string;
  cuentaOrigen?: string;
  comprobanteTransferencia?: string;
  observaciones?: string;
}

export function generarLiquidacionPdf(data: LiquidacionPdfData) {
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

  // 2. Encabezado Izquierdo: Datos Inmobiliaria
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

  // 3. Encabezado Derecho: Datos de la Rendición
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 77, 64); // #004d40
  doc.text("RENDICIÓN DE CUENTAS", pageWidth - margin - 5, margin + 8, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nº ${data.numeroLiquidacion}`, pageWidth - margin - 5, margin + 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha Emisión: ${data.fechaLiquidacion}`, pageWidth - margin - 5, margin + 18, { align: "right" });
  doc.text(`Carpeta Locativa: #${data.carpetaNumero}`, pageWidth - margin - 5, margin + 22, { align: "right" });

  // Línea divisoria
  doc.setDrawColor(200, 210, 215);
  doc.line(margin, margin + 26, pageWidth - margin, margin + 26);

  // 4. Banner Institucional
  let y = margin + 32;
  doc.setFillColor(241, 248, 245);
  doc.rect(margin + 2, y - 4, contentWidth - 4, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 77, 64);
  doc.text(
    `LIQUIDACIÓN MENSUAL DE ALQUILER PERCIBIDO - RENDICIÓN DE FONDOS AL PROPIETARIO LOCADOR`,
    pageWidth / 2,
    y + 0.5,
    { align: "center" }
  );

  y += 9;

  // 5. Bloque de Datos Propietario / Inmueble
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("DATOS DEL PROPIETARIO LOCADOR (BENEFICIARIO):", margin + 5, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  y += 5;
  doc.text(`Nombre / Razón Social: ${data.propietario.nombre}`, margin + 5, y);
  doc.text(`Documento / CUIT: ${data.propietario.documento}`, margin + 105, y);

  y += 4.5;
  doc.text(`CBU / Alias Transferencia: ${data.propietario.cbu_alias || "A coordinar / Cuenta bancaria"}`, margin + 5, y);
  doc.text(`Teléfono: ${data.propietario.telefono || "Registrado en administración"}`, margin + 105, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("DATOS DE LA LOCACIÓN & COBRO DE ORIGEN:", margin + 5, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  y += 5;
  doc.text(`Inmueble: ${data.inmueble.direccion} (${data.inmueble.localidad})`, margin + 5, y);
  doc.text(`Período Liquidado: ${data.periodoMesAnio}`, margin + 105, y);

  y += 4.5;
  doc.text(`Inquilino que abonó: ${data.inquilino.nombre} (${data.inquilino.documento})`, margin + 5, y);
  if (data.reciboReferencia) {
    doc.text(`Recibo Cobro Ref: ${data.reciboReferencia}`, margin + 105, y);
  }

  y += 7;

  // 6. Tabla Analítica de Ingresos y Deducciones
  const tableRows: any[] = [];

  // Ingresos
  data.ingresos.forEach((ing) => {
    tableRows.push([
      ing.detalle,
      "Ingreso (+)",
      `$ ${ing.importe.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      "-",
    ]);
  });

  // Deducciones
  data.deducciones.forEach((ded) => {
    tableRows.push([
      ded.detalle,
      "Deducción (-)",
      "-",
      `$ ${ded.importe.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    ]);
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin + 2, right: margin + 2 },
    head: [["Concepto / Detalle", "Tipo", "Ingreso Cobrado", "Deducciones"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [0, 77, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 28, halign: "center" },
      2: { cellWidth: 35, halign: "right", fontStyle: "bold" },
      3: { cellWidth: 34, halign: "right", fontStyle: "bold", textColor: [185, 28, 28] },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // 7. Resumen de Totales y Saldo Neto
  doc.setDrawColor(220, 226, 230);
  doc.line(margin + 2, finalY, pageWidth - margin - 2, finalY);

  let resumenY = finalY + 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text("Subtotal Ingresos Percibidos:", pageWidth - margin - 75, resumenY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    `$ ${data.totalBruto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    pageWidth - margin - 5,
    resumenY,
    { align: "right" }
  );

  resumenY += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal Deducciones (Comisión + Gastos):", pageWidth - margin - 75, resumenY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28);
  doc.text(
    `- $ ${data.totalDeducciones.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    pageWidth - margin - 5,
    resumenY,
    { align: "right" }
  );

  resumenY += 6;
  // Caja Destacada: Neto Liquidado
  doc.setFillColor(0, 77, 64);
  doc.roundedRect(pageWidth - margin - 85, resumenY - 4, 83, 10, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("NETO TRANSFERIDO AL DUEÑO:", pageWidth - margin - 82, resumenY + 2.5);
  doc.setFontSize(10.5);
  doc.text(
    `$ ${data.totalNeto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    pageWidth - margin - 4,
    resumenY + 2.5,
    { align: "right" }
  );

  // 8. Constancia de Pago / Transferencia Bancaria
  let pagoY = resumenY + 14;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + 5, pagoY, contentWidth - 10, 18, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin + 5, pagoY, contentWidth - 10, 18, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("DATOS DE LA OPERACIÓN BANCARIA / TRANSFERENCIA:", margin + 8, pagoY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Medio de Pago: ${data.medioPago}`, margin + 8, pagoY + 10);
  doc.text(`CBU / Alias Destino: ${data.propietario.cbu_alias || "Declarado en legajo"}`, margin + 8, pagoY + 14.5);

  if (data.comprobanteTransferencia) {
    doc.text(`Nº Operación / Ref: ${data.comprobanteTransferencia}`, margin + 95, pagoY + 10);
  }
  doc.text(`Cuenta Origen: ${data.cuentaOrigen || "Cuenta Recaudadora DeusX Inmobiliaria"}`, margin + 95, pagoY + 14.5);

  // 9. Observaciones (si existen)
  if (data.observaciones) {
    pagoY += 21;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Observaciones: ${data.observaciones}`, margin + 5, pagoY);
  }

  // 10. Firmas y Sellos Legales
  const pieY = 250;
  doc.setDrawColor(200, 210, 215);

  // Sello Inmobiliaria Izquierda
  doc.line(margin + 15, pieY, margin + 70, pieY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("POR DEUSX INMOBILIARIA", margin + 42.5, pieY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Administración & Martillero Colegiado`, margin + 42.5, pieY + 8, { align: "center" });
  doc.text(`${data.inmobiliaria.matricula}`, margin + 42.5, pieY + 11.5, { align: "center" });

  // Firma Conformidad Dueño Derecha
  doc.line(pageWidth - margin - 70, pieY, pageWidth - margin - 15, pieY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("CONFORMIDAD DEL LOCADOR", pageWidth - margin - 42.5, pieY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Firma / Aceptación de Rendición`, pageWidth - margin - 42.5, pieY + 8, { align: "center" });
  doc.text(`DNI / CUIT: ${data.propietario.documento}`, pageWidth - margin - 42.5, pieY + 11.5, { align: "center" });

  // Pie legal
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento digital de rendición de cuentas locativas generado por DeusX Inmobiliarias ERP el ${new Date().toLocaleString("es-AR")}.`,
    pageWidth / 2,
    275,
    { align: "center" }
  );

  // Descarga del PDF en el navegador
  doc.save(`Rendicion_${data.numeroLiquidacion}_Carpeta_${data.carpetaNumero}.pdf`);
}
