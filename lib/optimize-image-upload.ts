import {
  EVIDENCE_PHOTO_INITIAL_QUALITY,
  EVIDENCE_PHOTO_MAX_ATTEMPTS,
  EVIDENCE_PHOTO_MAX_LONGEST_SIDE,
  EVIDENCE_PHOTO_MIN_QUALITY,
  EVIDENCE_PHOTO_QUALITY_STEP_HIGH,
  EVIDENCE_PHOTO_QUALITY_STEP_LOW,
  EVIDENCE_PHOTO_SCALE_STEP,
  EVIDENCE_PHOTO_TARGET_BYTES,
  SELFIE_PHOTO_MAX_LONGEST_SIDE,
  SELFIE_PHOTO_TARGET_BYTES,
} from "@/lib/image-upload-policy";

type OptimizeImageOptions = {
  maxBytes: number;
  maxLongestSide: number;
  initialQuality?: number;
};

function fileNameToJpeg(name: string) {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return `${name}.jpg`;
  return `${name.slice(0, lastDot)}.jpg`;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("No se pudo leer la imagen."));
    };
    image.src = imageUrl;
  });
}

async function canvasToJpegBlob(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la compresion de imagen.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", quality);
  });
  if (!blob) throw new Error("No se pudo convertir la imagen.");
  return blob;
}

function resolveOptions(input?: number | OptimizeImageOptions): OptimizeImageOptions {
  if (typeof input === "number") {
    return {
      maxBytes: input,
      maxLongestSide: SELFIE_PHOTO_MAX_LONGEST_SIDE,
      initialQuality: 0.78,
    };
  }
  return {
    maxBytes: input?.maxBytes ?? SELFIE_PHOTO_TARGET_BYTES,
    maxLongestSide: input?.maxLongestSide ?? SELFIE_PHOTO_MAX_LONGEST_SIDE,
    initialQuality: input?.initialQuality ?? 0.78,
  };
}

/** Bucle generico para selfies (politica aparte, mas agresiva). */
async function optimizeImageForUpload(file: File, options?: number | OptimizeImageOptions): Promise<File> {
  const { maxBytes, maxLongestSide, initialQuality } = resolveOptions(options);

  if (file.size > 0 && file.size <= maxBytes && file.type === "image/jpeg") {
    return file;
  }

  const image = await loadImageElement(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const initialScale = longestSide > maxLongestSide ? maxLongestSide / longestSide : 1;
  let scale = initialScale;
  let quality = initialQuality ?? 0.78;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const candidateBlob = await canvasToJpegBlob(image, width, height, quality);
    bestBlob = candidateBlob;
    if (candidateBlob.size <= maxBytes) {
      return new File([candidateBlob], fileNameToJpeg(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }

    if (quality > 0.42) {
      quality -= 0.1;
    } else {
      scale *= 0.78;
      quality = Math.max(0.38, quality - 0.04);
    }
  }

  if (!bestBlob) {
    throw new Error("No se pudo optimizar la imagen.");
  }

  return new File([bestBlob], fileNameToJpeg(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/**
 * ID y placa: alineado con MiVisita (2 MB / 1920px) pero objetivo 1 MB en Dragon.
 * JPG, PNG, WEBP -> JPEG; sin recomprimir si ya es JPEG <= objetivo.
 */
export async function optimizeEvidencePhoto(file: File): Promise<File> {
  const maxBytes = EVIDENCE_PHOTO_TARGET_BYTES;
  const maxLongestSide = EVIDENCE_PHOTO_MAX_LONGEST_SIDE;

  if (file.size > 0 && file.size <= maxBytes && file.type === "image/jpeg") {
    return file;
  }

  const image = await loadImageElement(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  let scale = longestSide > maxLongestSide ? maxLongestSide / longestSide : 1;
  let quality = EVIDENCE_PHOTO_INITIAL_QUALITY;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < EVIDENCE_PHOTO_MAX_ATTEMPTS; attempt += 1) {
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const candidateBlob = await canvasToJpegBlob(image, width, height, quality);
    bestBlob = candidateBlob;
    if (candidateBlob.size <= maxBytes) {
      return new File([candidateBlob], fileNameToJpeg(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }

    if (quality > 0.5) {
      quality -= EVIDENCE_PHOTO_QUALITY_STEP_HIGH;
    } else {
      scale *= EVIDENCE_PHOTO_SCALE_STEP;
      quality = Math.max(EVIDENCE_PHOTO_MIN_QUALITY, quality - EVIDENCE_PHOTO_QUALITY_STEP_LOW);
    }
  }

  if (!bestBlob) {
    throw new Error("No se pudo optimizar la imagen.");
  }

  return new File([bestBlob], fileNameToJpeg(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** Selfies de turno: ~320 KB, 960px max. */
export function optimizeSelfiePhoto(file: File) {
  return optimizeImageForUpload(file, {
    maxBytes: SELFIE_PHOTO_TARGET_BYTES,
    maxLongestSide: SELFIE_PHOTO_MAX_LONGEST_SIDE,
    initialQuality: 0.78,
  });
}
