export type ResidentLocale = "es" | "en";

export const RESIDENT_LOCALE_COOKIE = "resident-locale";

export function parseResidentLocale(_value: string | undefined | null): ResidentLocale {
  return "es";
}
