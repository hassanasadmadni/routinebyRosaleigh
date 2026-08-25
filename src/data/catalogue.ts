// ---------------------------------------------------------------------------
// Rosaleigh Cosmetics — editable product & bundle configuration.
// ---------------------------------------------------------------------------
import cleanserImg from "@/assets/p-cleanser.png";
import dayCreamImg from "@/assets/p-day-cream.png";
import nightCreamImg from "@/assets/p-night-cream.png";
import stripsImg from "@/assets/p-strips.png";

export type ProductId =
  | "cleanser"
  | "day-cream"
  | "night-cream"
  | "strips";

export interface Product {
  id: ProductId;
  name: string;
  image: string;
  shortName: string;
  url: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  cleanser: {
    id: "cleanser",
    name: "Cleansing Tallow Base Lotion",
    shortName: "Cleansing Lotion",
    image: cleanserImg,
    url: "https://www.rosaleigh.co.uk",
  },
  "day-cream": {
    id: "day-cream",
    name: "Anti-Wrinkle Day Cream SPF50",
    shortName: "Day Cream SPF50",
    image: dayCreamImg,
    url: "https://www.rosaleigh.co.uk",
  },
  "night-cream": {
    id: "night-cream",
    name: "Anti-Wrinkle Night Cream",
    shortName: "Night Cream",
    image: nightCreamImg,
    url: "https://www.rosaleigh.co.uk",
  },
  strips: {
    id: "strips",
    name: "Anti-Wrinkle Sublingual Strips",
    shortName: "Sublingual Strips",
    image: stripsImg,
    url: "https://www.rosaleigh.co.uk",
  },
};

export type BundleId = "complete-routine";

export interface Bundle {
  id: BundleId;
  name: string;
  tagline: string;
  items: ProductId[];
  url: string;
}

export const BUNDLES: Record<BundleId, Bundle> = {
  "complete-routine": {
    id: "complete-routine",
    name: "The Complete Rosaleigh Routine",
    tagline:
      "Everything you need in one simple routine — Sublingual Strips and Day Cream SPF50 in the morning, Cleansing Lotion and Night Cream in the evening. Consistent, effective, effortless.",
    items: ["strips", "day-cream", "cleanser", "night-cream"],
    url: "https://www.rosaleigh.co.uk",
  },
};
