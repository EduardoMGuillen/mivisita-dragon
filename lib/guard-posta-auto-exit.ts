import { prisma } from "@/lib/prisma";
import { GUARD_POSTA_DESCRIPTION_PREFIX } from "@/lib/guard-posta";

/** Tras este tiempo sin salida manual, el sistema cierra la visita Posta. */
export const POSTA_AUTO_EXIT_AFTER_MS = 2 * 24 * 60 * 60 * 1000;

/** Cuántas entradas Posta recientes muestra el panel del guardia. */
export const POSTA_RECENT_ENTRIES_LIMIT = 8;

/** Ventana de días para el listado "Entradas generadas por Posta (recientes)". */
export const POSTA_RECENT_ENTRIES_DAYS = 3;

export const POSTA_AUTO_EXIT_NOTE =
  "Salida automatica por sistema (48h sin registro manual en Posta).";

export function postaRecentEntriesCutoff(now = new Date()) {
  return new Date(now.getTime() - POSTA_RECENT_ENTRIES_DAYS * 24 * 60 * 60 * 1000);
}

/** Cierra visitas Posta abiertas hace mas de 48h. Idempotente. */
export async function autoCloseStalePostaVisits(options?: { residentialId?: string }) {
  const cutoff = new Date(Date.now() - POSTA_AUTO_EXIT_AFTER_MS);

  const result = await prisma.qrScan.updateMany({
    where: {
      isValid: true,
      exitedAt: null,
      scannedAt: { lte: cutoff },
      code: {
        description: { startsWith: GUARD_POSTA_DESCRIPTION_PREFIX },
        ...(options?.residentialId ? { residentialId: options.residentialId } : {}),
      },
    },
    data: {
      exitedAt: new Date(),
      exitNote: POSTA_AUTO_EXIT_NOTE,
    },
  });

  return result.count;
}
