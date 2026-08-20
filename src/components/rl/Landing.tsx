import { Camera, ClipboardList, ArrowRight } from "lucide-react";

interface Props {
  onChoose: (path: "photo" | "quiz") => void;
}

export function Landing({ onChoose }: Props) {
  return (
    <section className="rl-enter mx-auto max-w-5xl px-5 pt-12 md:pt-20">
      <p className="text-xs uppercase tracking-[0.22em] text-highlight">Rosaleigh Skin Studio</p>
      <h1 className="mt-4 max-w-2xl text-4xl leading-[1.1] md:text-6xl">
        Let's find the routine <span className="text-highlight italic">your skin</span> has been
        asking for.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
        A short, considered analysis — no jargon, no pressure. In under two minutes we'll suggest a
        morning and evening routine built entirely from Rosaleigh products.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <ChoiceCard
          icon={<Camera className="h-5 w-5" />}
          title="AI Photo Analysis"
          body="Upload a clear, front-facing photo and we'll guide you through a tailored analysis in moments."
          cta="Upload a photo"
          onClick={() => onChoose("photo")}
        />
        <ChoiceCard
          icon={<ClipboardList className="h-5 w-5" />}
          title="Skin Quiz"
          body="Prefer not to share a photo? Answer six quick questions and we'll reach the same result."
          cta="Take the quiz"
          onClick={() => onChoose("quiz")}
        />
      </div>
    </section>
  );
}

function ChoiceCard({
  icon,
  title,
  body,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rl-card group flex flex-col items-start gap-3 p-7 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow-soft)"
    >
      <span className="rounded-full bg-surface p-3 text-heading">{icon}</span>
      <h2 className="text-2xl">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-link">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
