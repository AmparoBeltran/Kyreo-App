import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Lowercase and strip diacritics so "Bloqueo de Qí de Hígado" is findable by
 * typing "higado". Stored on the document as `patronNormalizado` at write time
 * so search never has to download the collection to filter it.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const DATE_FMT = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return DATE_FMT.format(date);
}

/** Short, stable excerpt for list cards. */
export function excerpt(value: string, max = 140): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
