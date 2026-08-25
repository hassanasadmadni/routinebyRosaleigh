import type { ProductId } from "./catalogue";

export interface ProductGuide {
  quantity: string;
  how: string;
  caution: string;
  benefits: string;
}

export const PRODUCT_GUIDE: Record<ProductId, ProductGuide> = {
  strips: {
    quantity: "1 strip",
    how: "Take 30 minutes after breakfast. Place one strip under the tongue and allow it to dissolve completely (around 30 seconds). Do not eat or drink for 5 minutes after.",
    caution: "For adults only. Do not exceed one strip per day. Consult your doctor if pregnant, breastfeeding, or taking medication.",
    benefits: "Supports collagen production for firmer skin, reduces the appearance of fine lines, boosts skin brightness and radiance, and promotes overnight skin renewal from within.",
  },
  "day-cream": {
    quantity: "Two-finger length",
    how: "Smooth evenly over face and neck as the final morning step.",
    caution: "Morning only. Must be the last product applied for SPF to work effectively.",
    benefits: "Broad-spectrum SPF50 shields against UV-induced ageing, hydrates throughout the day, smooths the appearance of fine lines, and supports a firm, even complexion.",
  },
  cleanser: {
    quantity: "2–3 pumps",
    how: "Massage over damp skin for 30 seconds to remove makeup, SPF and daily buildup. Rinse with lukewarm water and pat dry.",
    caution: "Avoid the eye area. Skip if skin is broken or actively inflamed.",
    benefits: "Gently removes makeup, SPF and impurities without stripping the skin barrier, leaving skin clean, calm, and ready to absorb your night treatment.",
  },
  "night-cream": {
    quantity: "Pea-sized amount",
    how: "Apply after cleansing. Press upwards and outwards over face and neck before sleeping.",
    caution: "Evening only. Do not use together with Day Cream SPF50.",
    benefits: "Repairs and renews skin overnight, visibly reduces fine lines and wrinkles, restores moisture levels, and supports firmness and elasticity while you sleep.",
  },
};
