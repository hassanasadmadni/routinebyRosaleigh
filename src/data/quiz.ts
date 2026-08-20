export interface QuizQuestion {
  id: keyof QuizAnswers;
  title: string;
  subtitle?: string;
  options: { value: string; label: string }[];
}

export interface QuizAnswers {
  age: string;
  skinType: string;
  hydration: string;
  concern: string;
  routine: string;
  spf: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "age",
    title: "Which age range describes you?",
    subtitle: "This helps us judge how much support your skin barrier needs.",
    options: [
      { value: "18-24", label: "18–24" },
      { value: "25-34", label: "25–34" },
      { value: "35-44", label: "35–44" },
      { value: "45-54", label: "45–54" },
      { value: "55+", label: "55+" },
    ],
  },
  {
    id: "skinType",
    title: "How would you describe your skin type?",
    options: [
      { value: "dry", label: "Dry" },
      { value: "oily", label: "Oily" },
      { value: "combination", label: "Combination" },
      { value: "normal", label: "Normal" },
      { value: "sensitive", label: "Sensitive" },
    ],
  },
  {
    id: "hydration",
    title: "How does your skin usually feel?",
    subtitle: "Think of an ordinary afternoon, a few hours after cleansing.",
    options: [
      { value: "tight", label: "Tight & dry" },
      { value: "balanced", label: "Balanced" },
      { value: "oily", label: "Oily & shiny" },
    ],
  },
  {
    id: "concern",
    title: "What would you most like to improve?",
    options: [
      { value: "lines", label: "Fine lines & wrinkles" },
      { value: "dullness", label: "Dullness" },
      { value: "dryness", label: "Dryness" },
      { value: "texture", label: "Uneven texture" },
      { value: "firmness", label: "Loss of firmness" },
    ],
  },
  {
    id: "routine",
    title: "What does your current routine look like?",
    options: [
      { value: "none", label: "None to speak of" },
      { value: "basic", label: "Basic — cleanse and moisturise" },
      { value: "full", label: "Full multi-step" },
    ],
  },
  {
    id: "spf",
    title: "How often do you wear SPF?",
    options: [
      { value: "daily", label: "Daily, without fail" },
      { value: "sometimes", label: "Sometimes" },
      { value: "rarely", label: "Rarely" },
    ],
  },
];
