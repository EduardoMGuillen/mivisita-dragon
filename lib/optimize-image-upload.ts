const DEFAULT_MAX_IMAGE_UPLOAD_BYTES = 1200 * 1024;

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

export async function optimizeImageForUpload(
  file: File,
  maxBytes = DEFAULT_MAX_IMAGE_UPLOAD_BYTES,
): Promise<File> {
  if (file.size > 0 && file.size <= maxBytes && file.type === "image/jpeg") {
    return file;
  }

  const image = await loadImageElement(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const initialScale = longestSide > 1920 ? 1920 / longestSide : 1;
  let scale = initialScale;
  let quality = 0.86;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
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
      quality -= 0.12;
    } else {
      scale *= 0.82;
      quality = Math.max(0.44, quality - 0.04);
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
