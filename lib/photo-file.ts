import type { Frame } from "@/types";

/** Longest side kept from a phone-camera photo. Plenty for a strip, light enough for older phones. */
const MAX_PHOTO_SIDE = 1600;

interface LoadedPhoto {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

function loadWithImageElement(file: Blob): Promise<LoadedPhoto> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the photo"));
    };
    img.src = url;
  });
}

function loadFromFile(file: Blob): Promise<LoadedPhoto> {
  // createImageBitmap honours EXIF orientation when asked; <img> does in every current browser.
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file, { imageOrientation: "from-image" }).then(
      (bitmap) => ({ source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }),
      () => loadWithImageElement(file),
    );
  }
  return loadWithImageElement(file);
}

/**
 * Turns a photo from the phone camera app into a session Frame (JPEG data
 * URL). Not mirrored: the camera app already saved it the way it wants.
 */
export async function photoFileToFrame(file: Blob): Promise<Frame> {
  const loaded = await loadFromFile(file);
  try {
    if (!loaded.width || !loaded.height) throw new Error("Empty photo");
    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(loaded.width, loaded.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(loaded.width * scale);
    canvas.height = Math.round(loaded.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas");
    ctx.drawImage(loaded.source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    loaded.close();
  }
}
