/** Politica unificada de fotos de evidencia (ID, placa, selfies de guardia). */

/** Objetivo de compresion en cliente para ID/placa (~400 KB). */
export const EVIDENCE_PHOTO_TARGET_BYTES = 400 * 1024;

/** Objetivo de compresion en cliente para selfies de turno (~320 KB). */
export const SELFIE_PHOTO_TARGET_BYTES = 320 * 1024;

/** Tope duro en servidor tras optimizar (rechaza si llega mas grande). */
export const SERVER_EVIDENCE_PHOTO_MAX_BYTES = 512 * 1024;

/** Lado mas largo maximo al redimensionar evidencia ID/placa. */
export const EVIDENCE_PHOTO_MAX_LONGEST_SIDE = 1280;

/** Lado mas largo maximo al redimensionar selfies. */
export const SELFIE_PHOTO_MAX_LONGEST_SIDE = 960;
