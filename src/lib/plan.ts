import { PRODUCTS, type ProductId } from "@/data/catalogue";
import { PRODUCT_GUIDE } from "@/data/routine-guide";
import type { SkinResult } from "./analysis";

export interface PlanStep {
  productId: ProductId;
  productName: string;
  image: string;
  when: "AM" | "PM";
  quantity: string;
  how: string;
  frequency: string;
  caution: string;
  reason: string;
}

export interface PlanPhase {
  id: string;
  title: string;
  subtitle: string;
  note: string;
  steps: PlanStep[];
}

const GENTLE_INTRO: ProductId[] = ["whipped-tallow", "heritage-balm", "night-cream", "foot-leg"];

function frequencyFor(productId: ProductId, phase: 1 | 2 | 3): string {
  if (productId === "foot-leg") return "As needed, after showering";
  if (phase === 1 && GENTLE_INTRO.includes(productId)) return "Every other day";
  return "Daily";
}

function stepsFor(result: SkinResult, phase: 1 | 2 | 3): PlanStep[] {
  const build = (when: "AM" | "PM") =>
    (when === "AM" ? result.am : result.pm).map((step) => {
      const product = PRODUCTS[step.productId];
      const guide = PRODUCT_GUIDE[step.productId];
      return {
        productId: step.productId,
        productName: product.name,
        image: product.image,
        when,
        quantity: guide.quantity,
        how: guide.how,
        frequency: frequencyFor(step.productId, phase),
        caution:
          phase === 1 &&
          GENTLE_INTRO.includes(step.productId) &&
          !guide.caution.toLowerCase().includes("patch test")
            ? `Patch test on the inner forearm first. ${guide.caution}`
            : guide.caution,
        reason: step.reason,
      } satisfies PlanStep;
    });
  return [...build("AM"), ...build("PM")];
}

export function buildPlan(result: SkinResult): PlanPhase[] {
  return [
    {
      id: "days-1-7",
      title: "Days 1–7",
      subtitle: "Introduction Phase",
      note: "Start gently. Patch test anything new on the inner forearm for 24 hours, and use richer tallow steps every other evening so your skin can adjust without overwhelm.",
      steps: stepsFor(result, 1),
    },
    {
      id: "days-8-21",
      title: "Days 8–21",
      subtitle: "Building Phase",
      note: "Your skin has settled, so move to the full morning and evening routine at normal frequency. Consistency matters far more than quantity here.",
      steps: stepsFor(result, 2),
    },
    {
      id: "days-22-30",
      title: "Days 22–30",
      subtitle: "Established Routine",
      note: "By now you should notice softer texture, steadier comfort and a more even tone. Beyond day 30, simply continue — adjust the balm layer up in colder months and down in warmer ones.",
      steps: stepsFor(result, 3),
    },
  ];
}
