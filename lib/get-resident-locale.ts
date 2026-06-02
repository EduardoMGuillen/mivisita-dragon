import type { ResidentLocale } from "@/lib/resident-locale";

/** MiVisita - Dragon Seguridad: solo español (sin selector de idioma). */
export async function getResidentLocale(): Promise<ResidentLocale> {
  return "es";
}
