import { BUNDLES, PRODUCTS, type BundleId, type ProductId } from "@/data/catalogue";
import type { QuizAnswers } from "@/data/quiz";

export interface RoutineStep {
  productId: ProductId;
  reason: string;
}

export interface SkinResult {
  createdAt: number;
  answers: QuizAnswers;
  source: "photo" | "quiz";
  summary: string[];
  am: RoutineStep[];
  pm: RoutineStep[];
  bundleId: BundleId;
  seed?: string;
}

export interface AnalyzeInput {
  answers: QuizAnswers;
  source: "photo" | "quiz";
  seed?: string | undefined;
  /** Reserved for a future vision-model call. Not used in phase 1. */
  imageDataUrl?: string | undefined;
}

/** Stable 32-bit string hash — same input always yields the same output. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simulated photo analysis: deterministic answers derived from the uploaded
 * file's signature, so the same photo always produces the same result.
 */
export function answersFromSeed(seed: string): QuizAnswers {
  const rand = mulberry(hashString(seed));
  const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)]!;
  return {
    age: pick(["25-34", "25-34", "35-44", "35-44", "45-54", "18-24", "55+"]),
    skinType: pick(["dry", "oily", "combination", "combination", "normal", "sensitive"]),
    hydration: pick(["tight", "balanced", "balanced", "oily"]),
    concern: pick(["lines", "dullness", "dryness", "texture", "firmness"]),
    routine: pick(["none", "basic", "basic", "full"]),
    spf: pick(["daily", "sometimes", "sometimes", "rarely"]),
  };
}

export interface SkinMetrics {
  score: number;
  band: "Needs care" | "Fair" | "Good" | "Excellent";
  tone: "error" | "highlight" | "success";
  skinType: string;
  hydration: "Low" | "Balanced" | "High";
  concern: string;
}

const TYPE_TITLE: Record<string, string> = {
  dry: "Dry",
  oily: "Oily",
  combination: "Combination",
  normal: "Normal",
  sensitive: "Sensitive",
};

const CONCERN_TITLE: Record<string, string> = {
  lines: "Fine lines",
  dullness: "Dullness",
  dryness: "Dryness",
  texture: "Uneven texture",
  firmness: "Loss of firmness",
};

export function metricsFor(result: SkinResult): SkinMetrics {
  const a = result.answers;
  let score = 74;
  if (a.spf === "daily") score += 8;
  else if (a.spf === "rarely") score -= 8;
  if (a.routine === "full") score += 4;
  else if (a.routine === "none") score -= 6;
  if (a.hydration === "balanced") score += 5;
  else if (a.hydration === "tight") score -= 6;
  if (a.skinType === "normal") score += 3;
  else if (a.skinType === "sensitive" || a.skinType === "dry") score -= 4;
  if (a.concern === "lines" || a.concern === "firmness") score -= 4;
  if (a.age === "45-54") score -= 2;
  else if (a.age === "55+") score -= 4;
  else if (a.age === "18-24") score += 3;
  score += Math.floor(mulberry(hashString(result.seed ?? JSON.stringify(a)))() * 5) - 2;
  score = Math.max(38, Math.min(96, score));

  const band: SkinMetrics["band"] =
    score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Fair" : "Needs care";
  const tone: SkinMetrics["tone"] =
    score >= 70 ? "success" : score >= 55 ? "highlight" : "error";

  return {
    score,
    band,
    tone,
    skinType: TYPE_TITLE[a.skinType] ?? "Balanced",
    hydration: a.hydration === "tight" ? "Low" : a.hydration === "oily" ? "High" : "Balanced",
    concern: CONCERN_TITLE[a.concern] ?? "Overall skin health",
  };
}

const SKIN_TYPE_LABEL: Record<string, string> = {
  dry: "dry",
  oily: "oily",
  combination: "combination",
  normal: "normal",
  sensitive: "sensitive",
};

const CONCERN_LABEL: Record<string, string> = {
  lines: "fine lines and early creasing",
  dullness: "a lack of natural radiance",
  dryness: "persistent dryness",
  texture: "uneven texture",
  firmness: "a softening of firmness",
};

function pickBundle(a: QuizAnswers): BundleId {
  // Dry / sensitive / dryness concern → Heritage Tallow Balm (deep nourishment)
  if (a.skinType === "dry" || a.skinType === "sensitive" || a.concern === "dryness") {
    return "tallow-age-defence";
  }

  // Fine lines / firmness concern → Whipped Tallow (lightweight anti-ageing)
  if (a.concern === "lines" || a.concern === "firmness") {
    return "whipped-age-defence";
  }

  // Oily / combination / texture / dullness → Cleanse & Renew (lotion-led)
  if (
    a.skinType === "oily" ||
    a.skinType === "combination" ||
    a.concern === "texture" ||
    a.concern === "dullness"
  ) {
    return "cleanse-renew";
  }

  // Balanced skin or body-focused needs → Foot & Leg Ritual
  return "foot-leg-ritual";
}

function buildRoutine(a: QuizAnswers, bundleId: BundleId) {
  const dryish = a.skinType === "dry" || a.skinType === "sensitive" || a.hydration === "tight";
  let am: RoutineStep[] = [];
  let pm: RoutineStep[] = [];

  if (bundleId === "foot-leg-ritual") {
    am = [
      {
        productId: "day-cream",
        reason: "Starts your day with SPF50 protection and anti-ageing support in one step.",
      },
    ];
    pm = [
      {
        productId: "strips",
        reason: "Take one strip before bed — dissolves under the tongue in seconds, delivering Vitamin C directly into the bloodstream to support overnight skin renewal.",
      },
      {
        productId: "night-cream",
        reason: "Works overnight to renew and restore while you sleep.",
      },
      {
        productId: "foot-leg",
        reason: "Apply generously to legs, heels and feet as the last step each evening.",
      },
    ];
  } else if (bundleId === "cleanse-renew") {
    am = [
      {
        productId: "cleanser",
        reason: "A gentle, non-stripping start that respects your skin barrier each morning.",
      },
      {
        productId: "day-cream",
        reason:
          a.spf === "daily"
            ? "Keeps your excellent SPF habit going, with anti-ageing support built in."
            : "Daily SPF50 is the single biggest change you can make — this makes it effortless.",
      },
    ];
    pm = [
      {
        productId: "cleanser",
        reason: "Lifts the day away without leaving skin squeaky or uncomfortable.",
      },
      {
        productId: "strips",
        reason: "Take one strip before bed — dissolves under the tongue in seconds, delivering Vitamin C directly into the bloodstream to support overnight skin renewal.",
      },
      {
        productId: "night-cream",
        reason: "Overnight renewal to wake up looking rested and even.",
      },
    ];
  } else if (bundleId === "tallow-age-defence") {
    am = [
      {
        productId: "heritage-balm",
        reason: dryish
          ? "Rich tallow nourishment to ease morning tightness and comfort reactive skin."
          : "A small dab on drier areas keeps skin comfortable through the day.",
      },
      {
        productId: "day-cream",
        reason: "Layered over balm for SPF50 protection and anti-ageing defence all day.",
      },
    ];
    pm = [
      {
        productId: "strips",
        reason: "Take one strip before bed — dissolves under the tongue in seconds, delivering Vitamin C directly into the bloodstream to support overnight skin renewal.",
      },
      {
        productId: "heritage-balm",
        reason: "Applied first to deliver deep nourishment before the night cream seals it in.",
      },
      {
        productId: "night-cream",
        reason:
          a.concern === "lines" || a.concern === "firmness"
            ? "Works overnight on the lines and slackening you told us about."
            : "Overnight renewal to wake up looking rested and even.",
      },
    ];
  } else {
    // whipped-age-defence
    am = [
      {
        productId: "whipped-tallow",
        reason: "Lightweight whipped texture absorbs quickly — perfect under SPF.",
      },
      {
        productId: "day-cream",
        reason: "SPF50 anti-ageing protection layered over Whipped Tallow for all-day defence.",
      },
    ];
    pm = [
      {
        productId: "strips",
        reason: "Take one strip before bed — dissolves under the tongue in seconds, delivering Vitamin C directly into the bloodstream to support overnight skin renewal.",
      },
      {
        productId: "whipped-tallow",
        reason: "A light evening layer to soften and prep skin before the night cream.",
      },
      {
        productId: "night-cream",
        reason:
          a.concern === "lines" || a.concern === "firmness"
            ? "Works overnight on the lines and slackening you told us about."
            : "Overnight renewal so you wake up with visibly smoother skin.",
      },
    ];
  }

  const allowed = new Set<ProductId>(BUNDLES[bundleId].items);
  return {
    am: am.filter((s) => allowed.has(s.productId)),
    pm: pm.filter((s) => allowed.has(s.productId)),
  };
}

function buildSummary(a: QuizAnswers): string[] {
  const type = SKIN_TYPE_LABEL[a.skinType] ?? "balanced";
  const hydration =
    a.hydration === "tight"
      ? "your skin is telling us it's short on moisture"
      : a.hydration === "oily"
        ? "your skin produces plenty of its own oil, though that isn't the same as being hydrated"
        : "your hydration levels look comfortably balanced";

  const lines = [
    `You have ${type} skin, and ${hydration}.`,
    `Your main focus is ${CONCERN_LABEL[a.concern] ?? "overall skin health"} — very manageable with consistency rather than complexity.`,
    a.routine === "none"
      ? "With no routine in place, you'll likely see a difference quickly — we've kept your steps deliberately few."
      : a.routine === "basic"
        ? "You already have the basics in hand; we've simply refined them rather than adding clutter."
        : "You're clearly comfortable with a fuller routine, so we've focused on making each step earn its place.",
  ];

  if (a.spf !== "daily") {
    lines.push(
      "Daily sun protection is the one habit we'd gently encourage — it does more for the concerns above than anything else.",
    );
  } else {
    lines.push("Wearing SPF daily is already doing a great deal of quiet work for you.");
  }

  return lines;
}

/**
 * Single entry point for skin analysis.
 * Phase 1: derived entirely from quiz answers (photo is validated, never diagnosed).
 * Swap the body for a vision-model call later without touching the UI.
 */
export function analyzeSkin(input: AnalyzeInput): SkinResult {
  const bundleId = pickBundle(input.answers);
  const { am, pm } = buildRoutine(input.answers, bundleId);
  return {
    createdAt: Date.now(),
    answers: input.answers,
    source: input.source,
    summary: buildSummary(input.answers),
    am,
    pm,
    bundleId,
    ...(input.seed ? { seed: input.seed } : {}),
  };
}

export const STORAGE_KEY = "rosaleigh.skin-analysis.v1";

export function loadResult(): SkinResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SkinResult;
    return parsed?.bundleId && BUNDLES[parsed.bundleId] ? parsed : null;
  } catch {
    return null;
  }
}

export function saveResult(result: SkinResult) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* storage unavailable — result simply isn't remembered */
  }
}

export function clearResult() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

export { BUNDLES, PRODUCTS };
