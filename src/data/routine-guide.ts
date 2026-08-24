import type { ProductId } from "./catalogue";

export interface ProductGuide {
  quantity: string;
  how: string;
  caution: string;
}

export const PRODUCT_GUIDE: Record<ProductId, ProductGuide> = {
  strips: {
    quantity: "1 strip",
    how: "Take 30 minutes after breakfast. Place one strip under the tongue and allow it to dissolve completely (around 30 seconds). Do not eat or drink for 5 minutes after.",
    caution: "For adults only. Do not exceed one strip per day. Consult your doctor if pregnant, breastfeeding, or taking medication.",
  },
  "day-cream": {
    quantity: "Two-finger length",
    how: "Smooth evenly over face and neck as the final morning step, after the strips have been taken.",
    caution: "Morning only. Must be the last product applied for SPF to work effectively.",
  },
  cleanser: {
    quantity: "2–3 pumps",
    how: "Massage over damp skin for 30 seconds to remove makeup, SPF and daily buildup. Rinse with lukewarm water and pat dry.",
    caution: "Avoid the eye area. Skip if skin is broken or actively inflamed.",
  },
  "night-cream": {
    quantity: "Pea-sized amount",
    how: "Apply after cleansing. Press upwards and outwards over face and neck before sleeping.",
    caution: "Evening only. Do not use together with Day Cream SPF50.",
  },
};
