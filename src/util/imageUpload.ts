// P4.2 — image-upload helper for the Bild-auf-Objekt feature.
//
// Why the hard downscale: data URLs live inside the project JSON, which is
// persisted to localStorage (default save slot) and eventually to Supabase
// (cloud save). A single 4000×3000 phone JPEG is ~4 MB; multiply by 5-10
// banners and the save target dies. 1024×1024 @ JPEG 0.85 is visually fine
// on a standard banner-size quad and keeps each image under ~150 KB.
//
// createImageBitmap handles EXIF orientation on modern browsers (Chrome 81+
// / Firefox 114+), which a classic <img> would not — means a phone photo
// shot in landscape-with-rotation flag renders the right way up in 3D.

export interface ProcessUploadResult {
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export async function processUpload(
  file: File,
  maxSize: number = 1024,
): Promise<ProcessUploadResult> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  // PNGs keep alpha; everything else is normalised to JPEG. PNG @ data-URL
  // ignores the quality arg — JPEG uses 0.85 which is the sweet spot for
  // banner/wall imagery without obvious artifacts.
  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mime, 0.85);
  // Rough base64→bytes estimate (4 chars ≈ 3 bytes, minus header). Good enough
  // for the toast size display and the cloud-save confirmation warning.
  const commaIdx = dataUrl.indexOf(',');
  const bytes = Math.round((dataUrl.length - commaIdx - 1) * 0.75);
  return { dataUrl, width: w, height: h, bytes };
}

/** Estimate total bytes consumed by all imageMap data URLs in the given
 *  object array. Used to show a pre-save warning when a project grows large
 *  from many embedded images. */
export function estimateImageMapBytes(objs: Array<{ imageMap?: string }>): number {
  let total = 0;
  for (const o of objs) {
    const url = o.imageMap;
    if (!url) continue;
    const commaIdx = url.indexOf(',');
    if (commaIdx > 0) total += Math.round((url.length - commaIdx - 1) * 0.75);
  }
  return total;
}
