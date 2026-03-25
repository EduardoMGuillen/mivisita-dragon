/** QRs creados por la Posta de Seguridad (guardia) quedan marcados con este prefijo en `description`. */
export const GUARD_POSTA_DESCRIPTION_PREFIX = "GUARD_GENERATED:";

export function buildGuardPostaDescription(creatorGuardId: string, creatorFullName: string) {
  return `${GUARD_POSTA_DESCRIPTION_PREFIX}${creatorGuardId}|Entrada registrada por Posta de Seguridad (${creatorFullName}). QR un solo uso.`;
}

/** Devuelve el id del guardia creador si el formato incluye `creatorId|` (flujo nuevo). */
export function parseGuardPostaCreatorId(description: string | null | undefined): string | null {
  if (!description?.startsWith(GUARD_POSTA_DESCRIPTION_PREFIX)) return null;
  const rest = description.slice(GUARD_POSTA_DESCRIPTION_PREFIX.length);
  const idx = rest.indexOf("|");
  if (idx <= 0) return null;
  const id = rest.slice(0, idx).trim();
  return id.length > 0 ? id : null;
}

export function isGuardPostaQr(description: string | null | undefined): boolean {
  return Boolean(description?.startsWith(GUARD_POSTA_DESCRIPTION_PREFIX));
}
