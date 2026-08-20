import { useState } from "react";
import { QUIZ, type QuizAnswers } from "@/data/quiz";
import { BackLink } from "./PhotoUpload";

interface Props {
  intro?: string | undefined;
  onExit: () => void;
  onComplete: (answers: QuizAnswers) => void;
}

export function Quiz({ intro, onExit, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const question = QUIZ[step]!;
  const progress = ((step + (answers[question.id] ? 1 : 0)) / QUIZ.length) * 100;

  const choose = (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (step === QUIZ.length - 1) {
      onComplete(next as QuizAnswers);
    } else {
      window.setTimeout(() => setStep(step + 1), 160);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-5 pt-10 md:pt-16">
      <BackLink onClick={() => (step === 0 ? onExit() : setStep(step - 1))} />

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-highlight transition-all duration-500 ease-out"
          style={{ width: `${Math.max(progress, 6)}%` }}
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Question {step + 1} of {QUIZ.length}
      </p>

      {intro && step === 0 && (
        <p className="mt-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          {intro}
        </p>
      )}

      <div key={step} className="rl-enter mt-7">
        <h1 className="text-3xl leading-tight md:text-4xl">{question.title}</h1>
        {question.subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{question.subtitle}</p>
        )}

        <div className="mt-7 grid gap-3">
          {question.options.map((option) => {
            const selected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value)}
                className={`rounded-xl border px-5 py-4 text-left text-sm transition-all duration-200 ${
                  selected
                    ? "border-highlight bg-surface text-heading"
                    : "border-border bg-background text-foreground hover:border-highlight/60 hover:bg-surface"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
