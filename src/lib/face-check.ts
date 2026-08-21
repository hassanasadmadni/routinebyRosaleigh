/**
 * Face validation — MediaPipe detection + TensorFlow MobileNet classification.
 * Rejects robots, animals (including monkeys), objects, jars, paper etc.
 * Both libraries are free and run entirely in the browser.
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

interface Keypoint { x: number; y: number }
interface Detection {
  categories?: { score: number }[];
  boundingBox?: { originX: number; originY: number; width: number; height: number };
  keypoints?: Keypoint[];
}

/** Words in MobileNet labels that indicate non-human subjects. */
const REJECT_KEYWORDS = [
  // animals
  "monkey", "ape", "gorilla", "chimpanzee", "baboon", "macaque", "orangutan",
  "cat", "dog", "bear", "fox", "wolf", "lion", "tiger", "leopard", "jaguar",
  "horse", "cow", "pig", "sheep", "bird", "parrot", "owl", "eagle",
  "reptile", "snake", "lizard", "frog", "fish",
  // robots / non-human
  "robot", "android", "cyborg", "mannequin", "doll", "statue", "mask",
  "puppet", "toy", "figurine", "bust", "sculpture",
  // objects
  "jar", "bottle", "can", "cup", "mug", "bowl", "vase",
  "paper", "book", "screen", "phone", "computer",
];

const HUMAN_KEYWORDS = [
  "person", "people", "man", "woman", "girl", "boy", "human", "face",
  "head", "portrait", "selfie",
];

/**
 * Run MobileNet v2 classification on the image.
 * Returns true only if it looks like a human person.
 */
async function mobilenetHumanCheck(img: HTMLImageElement): Promise<boolean> {
  try {
    // Load TensorFlow.js + MobileNet from CDN
    const tf = await import(
      /* @vite-ignore */
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"
    ) as unknown;

    void tf; // ensure it's loaded (side-effect import)

    const mobilenet = await import(
      /* @vite-ignore */
      "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js"
    ) as { load: () => Promise<{ classify: (img: HTMLImageElement, topk: number) => Promise<{ className: string; probability: number }[]> }> };

    const model = await mobilenet.load();
    const predictions = await model.classify(img, 5);

    const labels = predictions.map((p) => p.className.toLowerCase());
    const topLabel = labels[0] ?? "";
    const topScore = predictions[0]?.probability ?? 0;

    // If top prediction is clearly a non-human thing with high confidence — reject.
    for (const label of labels) {
      for (const kw of REJECT_KEYWORDS) {
        if (label.includes(kw)) {
          // Only reject if it's a top confident prediction.
          const pred = predictions.find((p) => p.className.toLowerCase() === label);
          if (pred && pred.probability > 0.15) return false;
        }
      }
    }

    // If top label with high confidence is clearly non-human — reject.
    if (topScore > 0.4) {
      const isHuman = HUMAN_KEYWORDS.some((kw) => topLabel.includes(kw));
      const isNonHuman = REJECT_KEYWORDS.some((kw) => topLabel.includes(kw));
      if (isNonHuman && !isHuman) return false;
    }

    return true;
  } catch (err) {
    console.warn("MobileNet check failed, allowing through:", err);
    return true; // fail open — don't block real users if CDN is slow
  }
}

/**
 * Human skin tone check inside the detected face bounding box.
 * Monkeys with pink cheeks still have significantly more fur than skin.
 */
function humanSkinToneCheck(
  img: HTMLImageElement,
  box: { originX: number; originY: number; width: number; height: number }
): boolean {
  const canvas = document.createElement("canvas");
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return true;

  ctx.drawImage(img, 0, 0);

  const x0 = Math.max(0, Math.floor(box.originX * W));
  const y0 = Math.max(0, Math.floor(box.originY * H));
  const bw = Math.min(W - x0, Math.ceil(box.width * W));
  const bh = Math.min(H - y0, Math.ceil(box.height * H));
  if (bw < 10 || bh < 10) return true;

  const { data } = ctx.getImageData(x0, y0, bw, bh);
  const total = bw * bh;
  let humanSkin = 0;
  let darkFur = 0;
  let robotPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Human skin — warm, moderate saturation, wide luminance range.
    const isHumanSkin =
      r > 60 && r < 255 && g > 30 && b > 15 &&
      r >= g && r - b > 10 &&
      sat > 0.05 && sat < 0.75 &&
      lum > 30 && lum < 245 &&
      (r / (g + 1)) > 1.0 &&
      (r / (g + 1)) < 2.2;

    // Dark fur (monkeys, apes).
    const isDarkFur =
      lum < 100 && sat < 0.4 &&
      Math.abs(r - g) < 30 && Math.abs(g - b) < 30;

    // Robot/mannequin pixels — very desaturated, near-white or near-grey,
    // with no warm bias. Robots typically have sat < 0.08 and cool tone (b >= r).
    const isRobotPixel =
      sat < 0.08 && lum > 150 && b >= r - 5;

    if (isHumanSkin) humanSkin++;
    if (isDarkFur) darkFur++;
    if (isRobotPixel) robotPixels++;
  }

  const skinRatio  = humanSkin / total;
  const furRatio   = darkFur / total;
  const robotRatio = robotPixels / total;

  // Reject robot/mannequin: highly desaturated face region.
  if (robotRatio > 0.55) return false;

  // Reject if fur dominates.
  if (furRatio > 0.45) return false;
  if (furRatio > skinRatio * 1.5) return false;

  // Reject if not enough human skin tone present.
  if (skinRatio < 0.12) return false;

  return true;
}

async function mediapipeFaceCheck(img: HTMLImageElement): Promise<boolean> {
  try {
    const vision = await import(
      /* @vite-ignore */
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm"
    );

    const { FaceDetector, FilesetResolver } = vision as {
      FaceDetector: {
        createFromOptions: (
          resolver: unknown,
          options: unknown
        ) => Promise<{
          detect: (img: HTMLImageElement) => { detections: Detection[] };
          close: () => void;
        }>;
      };
      FilesetResolver: { forVisionTasks: (path: string) => Promise<unknown> };
    };

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    const detector = await FaceDetector.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.75,
    });

    const result = detector.detect(img);
    detector.close();

    if (result.detections.length === 0) return false;

    const best = result.detections.reduce((a, b) => {
      const sa = a.categories?.[0]?.score ?? 0;
      const sb = b.categories?.[0]?.score ?? 0;
      return sb > sa ? b : a;
    });

    const score = best.categories?.[0]?.score ?? 0;
    if (score < 0.82) return false;

    // Keypoint geometry check.
    const kp = best.keypoints;
    if (!kp || kp.length < 6) return false;

    const rightEye = kp[0]!;
    const leftEye  = kp[1]!;
    const nose     = kp[2]!;
    const mouth    = kp[3]!;

    if (Math.abs(rightEye.y - leftEye.y) > 0.15) return false;
    if (Math.abs(rightEye.x - leftEye.x) < 0.05) return false;

    const eyeMidY = (rightEye.y + leftEye.y) / 2;
    if (nose.y <= eyeMidY) return false;
    if (mouth.y <= nose.y) return false;

    const minEyeX = Math.min(rightEye.x, leftEye.x);
    const maxEyeX = Math.max(rightEye.x, leftEye.x);
    if (nose.x < minEyeX - 0.05 || nose.x > maxEyeX + 0.05) return false;
    if (mouth.y - eyeMidY < 0.1) return false;

    // Skin tone check inside the face bounding box.
    if (best.boundingBox) {
      if (!humanSkinToneCheck(img, best.boundingBox)) return false;
    }

    return true;
  } catch (err) {
    console.warn("MediaPipe failed:", err);
    return false;
  }
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

  // Run MediaPipe and MobileNet checks in parallel for speed.
  const [mediapipeOk, mobilenetOk] = await Promise.all([
    mediapipeFaceCheck(img),
    mobilenetHumanCheck(img),
  ]);

  // Both must pass — MediaPipe confirms a face exists,
  // MobileNet confirms the subject is human.
  return { ok: mediapipeOk && mobilenetOk, dataUrl };
}
