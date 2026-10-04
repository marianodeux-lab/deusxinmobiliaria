import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionales de Tailwind resolviendo colisiones
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea importes en pesos argentinos (ARS) o dólares estadounidenses (USD)
 * con separador de miles '.' y decimales ','
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: "ARS" | "USD" = "ARS"
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return currency === "ARS" ? "$ 0,00" : "USD 0,00";
  }

  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === "ARS" ? `$ ${formatted}` : `USD ${formatted}`;
}

/**
 * Formatea fechas al formato estándar argentino DD/MM/AA (ej. 12/10/26)
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  
  // Si viene en formato string YYYY-MM-DD simple, parsear directamente para evitar desfasaje de timezones UTC
  if (typeof dateInput === "string") {
    const clean = dateInput.trim();
    const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year.slice(2)}`;
    }
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Formatea porcentajes con hasta 2 decimales
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0%";
  return `${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

/**
 * Calcula el progreso temporal de vigencia de un contrato
 * Devuelve porcentaje transcurrido (0 a 100), días restantes y categoría semántica de estado
 */
export function calculateContractProgress(startDateStr: string, endDateStr: string) {
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const now = new Date().getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return { percent: 0, daysRemaining: 0, status: "normal" as const };
  }

  const totalDuration = end - start;
  const elapsed = Math.max(0, now - start);
  const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  let status: "normal" | "warning" | "danger" = "normal";
  if (daysRemaining <= 0) {
    status = "danger";
  } else if (daysRemaining <= 90) {
    // Últimos 3 meses: alerta para renovación
    status = "warning";
  }

  return { percent, daysRemaining, status };
}
