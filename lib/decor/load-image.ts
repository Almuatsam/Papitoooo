/**
 * Shared image loader for canvas/Fabric consumers (strip renderer, sticker
 * layer). Waits for `decode()` in addition to `load` so the bitmap is fully
 * rasterised before anything reads its pixels or dimensions — SVG data URLs
 * in particular can fire `load` a tick before they're actually decodable,
 * which otherwise risks Fabric caching a blank/zero-size image.
 */
export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(
          () => resolve(img),
          () => resolve(img), // decode() can reject in odd cases even though the image is usable
        );
      } else {
        resolve(img);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 48)}`));
    img.src = src;
  });
}
