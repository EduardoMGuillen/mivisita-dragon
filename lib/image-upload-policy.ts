/** Politica unificada de fotos de evidencia (ID, placa). Alineada con MiVisita; Dragon usa 1 MB en lugar de 2 MB. */

/** Objetivo de compresion en cliente para ID/placa (~1 MB). MiVisita usa 2 MB. */
export const EVIDENCE_PHOTO_TARGET_BYTES = 1 * 1024 * 1024;

/** Tope duro en servidor para ID/placa (2.5× objetivo 1 MB = 2.5 MB; MiVisita usa 5 MB con objetivo 2 MB). */
export const SERVER_EVIDENCE_PHOTO_MAX_BYTES = Math.round(2.5 * EVIDENCE_PHOTO_TARGET_BYTES);

/** Lado mas largo maximo al redimensionar evidencia ID/placa (igual que MiVisita). */
export const EVIDENCE_PHOTO_MAX_LONGEST_SIDE = 1920;

/** Calidad JPEG inicial y parametros del bucle (igual que MiVisita). */
export const EVIDENCE_PHOTO_INITIAL_QUALITY = 0.86;
export const EVIDENCE_PHOTO_MIN_QUALITY = 0.44;
export const EVIDENCE_PHOTO_QUALITY_STEP_HIGH = 0.12;
export const EVIDENCE_PHOTO_QUALITY_STEP_LOW = 0.04;
export const EVIDENCE_PHOTO_SCALE_STEP = 0.82;
export const EVIDENCE_PHOTO_MAX_ATTEMPTS = 10;

/** Objetivo de compresion en cliente para selfies de turno (~320 KB). */
export const SELFIE_PHOTO_TARGET_BYTES = 320 * 1024;

/** Lado mas largo maximo al redimensionar selfies. */
export const SELFIE_PHOTO_MAX_LONGEST_SIDE = 960;
