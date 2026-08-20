/**
 * Lightweight client-side gate for bad uploads.
 * Uses native FaceDetector where available (Chrome),
 * otherwise falls back to stricter pixel heuristics.
 * This never performs skin diagnostics.
 */
export interface FaceCheckResult {
  ok: boolean;
  dataUrl?: string;
}

async function loadImage(file: File): Promise<{ img: HTMLImageElement; dataUrl: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("decode-failed"));
    el.src = dataUrl;
  });
  return { img, dataUrl };
}

export async function checkFace(file: File): Promise<FaceCheckResult> {
  let img: HTMLImageElement;
  let dataUrl: string;
  try {
    ({ img, dataUrl } = await loadImage(file));
  } catch {
    return { ok: false };
  }

  if (img.naturalWidth < 200 || img.naturalHeight < 200) return { ok: false };

  // 1. Native face detection when the browser supports it (Chrome).
  const FD = (
    window as unknown as {
      FaceDetector?: new (o?: unknown) => { detect: (i: unknown) => Promise<unknown[]> };
    }
  ).FaceDetector;
  if (FD) {
    try {
      const detector = new FD({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(img);
      return { ok: faces.length > 0, dataUrl };
    } catch {
      /* fall through to heuristics */
    }
  }

  // 2. Stricter heuristic fallback.
  const size = 192;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { ok: false };
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let sum = 0;
  let skinPixels = 0;
  let colorVariance = 0;
  const lum: number[] = [];
  const rValues: number[] = [];
  const gValues: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lum.push(l);
    sum += l;
    rValues.push(r);
    gValues.push(g);

    // Strict skin tone: warm, desaturated tones across all ethnicities.
    // Must satisfy ALL: warm (r>g>b), within lightness range, limited saturation.
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const isSkinTone =
      r > 80 &&          // not too dark
      r < 250 &&         // not blown out
      g > 40 &&
      b > 20 &&
      r > g &&           // warm: red channel dominant
      g > b &&           // warm: green > blue
      r - b > 15 &&      // clear warm bias
      saturation > 0.08 && // some colour (rules out grey/white paper)
      saturation < 0.65 && // not overly saturated (rules out colourful objects)
      l > 50 && l < 230;   // not too dark or washed out

    if (isSkinTone) skinPixels++;

    // Track colour variance to detect flat/uniform images (paper, walls).
    colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
  }

  const totalPixels = lum.length;
  const mean = sum / totalPixels;

  // Reject too dark or too bright (bad lighting / not a photo).
  if (mean < 45 || mean > 235) return { ok: false, dataUrl };

  // Skin tone ratio — must be significant portion of the image.
  const skinRatio = skinPixels / totalPixels;
  if (skinRatio < 0.18) return { ok: false, dataUrl }; // raised from 0.12

  // Reject flat/uniform images: paper, white walls, plain objects.
  const avgColorVariance = colorVariance / totalPixels;
  if (avgColorVariance < 12) return { ok: false, dataUrl };

  // Luminance variance — reject near-uniform brightness (plain paper, solid backgrounds).
  let lumVariance = 0;
  for (const l of lum) lumVariance += (l - mean) ** 2;
  const lumStdDev = Math.sqrt(lumVariance / totalPixels);
  if (lumStdDev < 18) return { ok: false, dataUrl }; // flat image

  // Sharpness check — blurry or empty images fail.
  let edge = 0;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = y * size + x;
      const v =
        4 * (lum[i] ?? 0) -
        (lum[i - 1] ?? 0) -
        (lum[i + 1] ?? 0) -
        (lum[i - size] ?? 0) -
        (lum[i + size] ?? 0);
      edge += v * v;
    }
  }
  const sharpness = edge / ((size - 2) * (size - 2));
  if (sharpness < 40) return { ok: false, dataUrl }; // raised from 25

  // Spatial skin distribution — skin pixels should be in the central region
  // (faces are usually centred), not just scattered randomly.
  const cx = Math.floor(size / 2);
  const cy = Math.floor(size / 2);
  const centralRadius = size * 0.4;
  let centralSkin = 0;
  let centralTotal = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= centralRadius) {
        centralTotal++;
        const i = (y * size + x) * 4;
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        const isSkin =
          r > 80 && r < 250 && g > 40 && b > 20 &&
          r > g && g > b && r - b > 15 &&
          saturation > 0.08 && saturation < 0.65 &&
          l > 50 && l < 230;
        if (isSkin) centralSkin++;
      }
    }
  }
  const centralSkinRatio = centralSkin / centralTotal;
  if (centralSkinRatio < 0.20) return { ok: false, dataUrl };

  return { ok: true, dataUrl };
}
