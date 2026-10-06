import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ActaCierrePdfData {
  carpetaNumero: string;
  fechaCierre: string;
  inmueble: {
    direccion: string;
    localidad: string;
  };
  locador: {
    nombre: string;
    documento: string;
  };
  locatario: {
    nombre: string;
    documento: string;
  };
  estadoInmueble: "conforme" | "con_observaciones";
  observacionesEstado?: string;
  depositoOriginal: number;
  depositoActualizado: number;
  monedaDeposito: "ARS" | "USD";
  retenciones: {
    concepto: string;
    monto: number;
  }[];
  saldoNetoDevuelto: number;
  inmobiliariaNombre?: string;
}

/**
 * Genera el Acta Oficial de Restitución de Inmueble, Devolución de Llaves y Finiquito de Depósito
 */
export function generarActaCierrePdf(data: ActaCierrePdfData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // 1. Marco Exterior y Encabezado
  doc.setDrawColor(0, 77, 64);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, contentWidth, 265, "S");

  doc.setFillColor(0, 77, 64);
  doc.rect(margin, margin, contentWidth, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("ACTA DE RESTITUCIÓN DE INMUEBLE Y FINIQUITO DE LOCACIÓN", pageWidth / 2, margin + 10, { align: "center" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`ENTREGA FORMAL DE LLAVES & DEVOLUCIÓN DE DEPÓSITO • CARPETA #${data.carpetaNumero}`, pageWidth / 2, margin + 15, { align: "center" });

  let y = margin + 26;

  // 2. Partes Intervinientes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("1. COMPARECIENTES Y OBJETO", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const textoPartes = `En la ciudad de ${data.inmueble.localidad}, a los ${formatDate(data.fechaCierre)}, comparecen ante la administración de ${data.inmobiliariaNombre || "la Inmobiliaria Interviniente"}, por una parte el/la LOCADOR/A Sr./Sra. ${data.locador.nombre.toUpperCase()} (${data.locador.documento}), y por la otra parte el/la LOCATARIO/A Sr./Sra. ${data.locatario.nombre.toUpperCase()} (${data.locatario.documento}), quienes convienen celebrar la presente ACTA DE RESCISIÓN Y ENTREGA DE POSESIÓN del inmueble sito en ${data.inmueble.direccion}, localidad de ${data.inmueble.localidad}.`;
  const lineasPartes = doc.splitTextToSize(textoPartes, contentWidth - 12);
  doc.text(lineasPartes, margin + 6, y);
  y += lineasPartes.length * 4.5 + 4;

  // 3. Restitución de Llaves e Inspección
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("2. RECEPCIÓN DE LLAVES Y ESTADO DEL INMUEBLE", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const estadoDetalle = data.estadoInmueble === "conforme"
    ? "El LOCADOR recibe en este acto la totalidad de los juegos de llaves y declara haber inspeccionado el inmueble, encontrándolo desocupado, limpio, en perfecto estado de conservación y pintura, de plena conformidad."
    : `El LOCADOR recibe las llaves del inmueble dejando constancia de las siguientes observaciones / pendientes: "${data.observacionesEstado || "Se constatan detalles de pintura/reparaciones pendientes detallados en la liquidación inferior"}".`;

  const lineasEstado = doc.splitTextToSize(estadoDetalle, contentWidth - 12);
  doc.text(lineasEstado, margin + 6, y);
  y += lineasEstado.length * 4.5 + 4;

  // 4. Liquidación del Depósito en Garantía
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("3. LIQUIDACIÓN DEL DEPÓSITO EN GARANTÍA (ART. 1196 CCyC)", margin + 6, y);

  y += 4;

  const filasTabla = [
    ["Depósito Original Constituido", formatCurrency(data.depositoOriginal, data.monedaDeposito)],
    ["Depósito Actualizado a Liquidar", formatCurrency(data.depositoActualizado, data.monedaDeposito)],
  ];

  if (data.retenciones && data.retenciones.length > 0) {
    for (const r of data.retenciones) {
      filasTabla.push([`Deducción: ${r.concepto}`, `- ${formatCurrency(r.monto, data.monedaDeposito)}`]);
    }
  }

  filasTabla.push(["SALDO NETO REINTEGRADO AL LOCATARIO", formatCurrency(data.saldoNetoDevuelto, data.monedaDeposito)]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin + 6, right: margin + 6 },
    head: [["Concepto de Liquidación", "Importe Acordado"]],
    body: filasTabla,
    theme: "striped",
    headStyles: {
      fillColor: [0, 77, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 60 },
      1: { cellWidth: 48, halign: "right", fontStyle: "bold" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // 5. Cláusula de Finiquito Mutuo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 77, 64);
  doc.text("4. FINIQUITO MUTUO Y LIBERACIÓN DE FIADORES", margin + 6, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const textoFiniquito = `Con el reintegro del saldo antes liquidado y la entrega pacífica de las llaves, las partes manifiestan que nada más tienen que reclamarse por ningún concepto derivado del contrato de locación que las unió, quedando en consecuencia formalmente desobligados y liberados de toda responsabilidad tanto el LOCATARIO como sus GARANTES / FIADORES.`;
  const lineasFiniquito = doc.splitTextToSize(textoFiniquito, contentWidth - 12);
  doc.text(lineasFiniquito, margin + 6, y);
  y += lineasFiniquito.length * 4.5 + 16;

  // 6. Firmas
  const colWidth = (contentWidth - 24) / 3;
  const firmaY = 248;

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);

  // Firma Locador
  doc.line(margin + 6, firmaY, margin + 6 + colWidth, firmaY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FIRMA LOCADOR", margin + 6 + colWidth / 2, firmaY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(data.locador.nombre, margin + 6 + colWidth / 2, firmaY + 8, { align: "center" });

  // Firma Locatario
  doc.line(margin + 12 + colWidth, firmaY, margin + 12 + colWidth * 2, firmaY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FIRMA LOCATARIO", margin + 12 + colWidth * 1.5, firmaY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(data.locatario.nombre, margin + 12 + colWidth * 1.5, firmaY + 8, { align: "center" });

  // Firma Inmobiliaria
  doc.line(margin + 18 + colWidth * 2, firmaY, margin + 18 + colWidth * 3, firmaY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("POR INMOBILIARIA", margin + 18 + colWidth * 2.5, firmaY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Corredor / Martillero", margin + 18 + colWidth * 2.5, firmaY + 8, { align: "center" });

  // Footer Legal
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Instrumentado a través de DeusX Inmobiliarias ERP PropTech. Fecha de emisión: ${formatDate(new Date().toISOString())}.`,
    pageWidth / 2,
    margin + 261,
    { align: "center" }
  );

  doc.save(`Acta_Restitucion_Carpeta_${data.carpetaNumero}.pdf`);
}
