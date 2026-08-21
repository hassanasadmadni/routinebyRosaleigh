// ---------------------------------------------------------------------------
// Rosaleigh Cosmetics — editable product & bundle configuration.
// Update names, images, URLs and bundle contents here; layout code reads this.
// ---------------------------------------------------------------------------
import heritageBalmImg from "@/assets/p-heritage-balm.png";
import whippedTallowImg from "@/assets/p-whipped-tallow.png";
import footLegImg from "@/assets/p-foot-leg.png";
import cleanserImg from "@/assets/p-cleanser.png";
import dayCreamImg from "@/assets/p-day-cream.png";
import nightCreamImg from "@/assets/p-night-cream.png";
import stripsImg from "@/assets/p-strips.png";

const heritageBalm = heritageBalmImg;
const whippedTallow = whippedTallowImg;
const footLeg = footLegImg;
const cleanser = cleanserImg;
const dayCream = dayCreamImg;
const nightCream = nightCreamImg;
const strips = stripsImg;

export type ProductId =
  | "heritage-balm"
  | "whipped-tallow"
  | "foot-leg"
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
  "heritage-balm": {
    id: "heritage-balm",
    name: "Heritage Tallow Balm",
    shortName: "Heritage Balm",
    image: heritageBalm,
    url: "#",
  },
  "whipped-tallow": {
    id: "whipped-tallow",
    name: "Whipped Tallow",
    shortName: "Whipped Tallow",
    image: whippedTallow,
    url: "#",
  },
  "foot-leg": {
    id: "foot-leg",
    name: "Foot & Leg Cream",
    shortName: "Foot & Leg Cream",
    image: footLeg,
    url: "#",
  },
  cleanser: {
    id: "cleanser",
    name: "Cleansing Tallow Base Lotion",
    shortName: "Cleansing Lotion",
    image: cleanser,
    url: "#",
  },
  "day-cream": {
    id: "day-cream",
    name: "Anti-Wrinkle Day Cream SPF50",
    shortName: "Day Cream SPF50",
    image: dayCream,
    url: "#",
  },
  "night-cream": {
    id: "night-cream",
    name: "Anti-Wrinkle Night Cream",
    shortName: "Night Cream",
    image: nightCream,
    url: "#",
  },
  strips: {
    id: "strips",
    name: "Anti-Wrinkle Vitamin C Sublingual Strips",
    shortName: "Sublingual Strips",
    image: strips,
    url: "#",
  },
};

export type BundleId =
  | "foot-leg-ritual"
  | "cleanse-renew"
  | "tallow-age-defence"
  | "whipped-age-defence";

export interface Bundle {
  id: BundleId;
  name: string;
  tagline: string;
  items: ProductId[];
  url: string;
}

export const BUNDLES: Record<BundleId, Bundle> = {
  "foot-leg-ritual": {
    id: "foot-leg-ritual",
    name: "Foot & Leg Ritual",
    tagline:
      "Head-to-toe care — soothe and soften with Foot & Leg Cream, protected by Day Cream SPF50, restored overnight with Night Cream, and boosted with Vitamin C Sublingual Strips.",
    items: ["foot-leg", "day-cream", "night-cream", "strips"],
    url: "https://www.rosaleigh.co.uk",
  },
  "cleanse-renew": {
    id: "cleanse-renew",
    name: "Cleanse & Renew",
    tagline:
      "A complete daily routine — purify with Cleansing Lotion, defend with Day Cream SPF50, repair overnight with Night Cream, and nourish from within with Vitamin C Sublingual Strips.",
    items: ["cleanser", "day-cream", "night-cream", "strips"],
    url: "https://www.rosaleigh.co.uk",
  },
  "tallow-age-defence": {
    id: "tallow-age-defence",
    name: "Tallow Age Defence",
    tagline:
      "Deep nourishment meets anti-ageing power — Heritage Tallow Balm with Day Cream SPF50, Night Cream, and Vitamin C Sublingual Strips for inside-out renewal.",
    items: ["heritage-balm", "day-cream", "night-cream", "strips"],
    url: "https://www.rosaleigh.co.uk",
  },
  "whipped-age-defence": {
    id: "whipped-age-defence",
    name: "Whipped Age Defence",
    tagline:
      "Lightweight luxury for lasting results — Whipped Tallow with Day Cream SPF50, Night Cream, and Vitamin C Sublingual Strips for all-day and overnight anti-ageing care.",
    items: ["whipped-tallow", "day-cream", "night-cream", "strips"],
    url: "https://www.rosaleigh.co.uk",
  },
};
