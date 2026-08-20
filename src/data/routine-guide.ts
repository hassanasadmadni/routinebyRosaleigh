import type { ProductId } from "./catalogue";

export interface ProductGuide {
  quantity: string;
  how: string;
  caution: string;
}

export const PRODUCT_GUIDE: Record<ProductId, ProductGuide> = {
  cleanser: {
    quantity: "2–3 pumps",
    how: "Massage over damp skin for thirty seconds, then rinse with lukewarm water and pat dry.",
    caution: "Avoid the eye area; skip if skin is broken or actively inflamed.",
  },
  "whipped-tallow": {
    quantity: "Pea-sized amount",
    how: "Warm between fingertips and press into skin — no tugging or dragging.",
    caution: "Patch test first if you are new to tallow-based skincare.",
  },
  "heritage-balm": {
    quantity: "Small dab",
    how: "Melt between fingers and layer last, over drier areas, to seal everything in.",
    caution: "Use sparingly if you are prone to congestion; avoid on broken skin.",
  },
  "day-cream": {
    quantity: "Two-finger length",
    how: "Smooth evenly over face, neck and ears as your final morning step.",
    caution: "Morning only — do not layer with the Night Cream at the same time.",
  },
  "night-cream": {
    quantity: "Pea-sized amount",
    how: "Press upwards and outwards over cleansed skin before any balm layer.",
    caution: "Evening only — do not use together with the Day Cream SPF50.",
  },
  "foot-leg": {
    quantity: "Ten-pence sized amount per limb",
    how: "Massage into legs, heels and feet after showering while skin is still slightly damp.",
    caution: "Avoid on cracked, bleeding or infected skin.",
  },
};
