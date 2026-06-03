import { SERVER_EVIDENCE_PHOTO_MAX_BYTES } from "@/lib/image-upload-policy";

const ALLOWED_ID_PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateIdPhotoFile(file: File) {
  if (!ALLOWED_ID_PHOTO_MIME_TYPES.has(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, PNG o WEBP.");
  }
  if (file.size <= 0) {
    throw new Error("La foto del ID esta vacia.");
  }
  if (file.size > SERVER_EVIDENCE_PHOTO_MAX_BYTES) {
    throw new Error(
      `La foto supera el limite de ${Math.round(SERVER_EVIDENCE_PHOTO_MAX_BYTES / 1024)} KB. Intenta de nuevo; se optimiza automaticamente al capturar.`,
    );
  }
}

export async function idPhotoFileToBytes(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
