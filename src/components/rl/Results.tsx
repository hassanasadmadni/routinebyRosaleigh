import { useState } from "react";
import {
  Check,
  RotateCcw,
  ChevronDown,
  Droplet,
  Hand,
  CalendarDays,
  AlertTriangle,
  Download,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { BUNDLES, PRODUCTS } from "@/data/catalogue";
import { metricsFor, type SkinResult } from "@/lib/analysis";
import { buildPlan, type PlanPhase, type PlanStep } from "@/lib/plan";
import { downloadRoutinePdf } from "@/lib/pdf";
import { useIsMobile } from "@/hooks/use-mobile";
import { DISCLAIMER } from "./Chrome";

interface Props {
  result: SkinResult;
  returning: boolean;
  onRestart: () => void;
}

export function Results({ result, returning, onRestart }: Props) {
  const bundle = BUNDLES[result.bundleId];
  const metrics = metricsFor(result);
  const phases = buildPlan(result);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState<string | null>(phases[0]?.id ?? null);
  const [downloading, setDownloading] = useState(false);

  const toneClass =
    metrics.tone === "success"
      ? "text-success"
      : metrics.tone === "error"
        ? "text-error"
        : "text-highlight";
  const barClass =
    metrics.tone === "success"
      ? "bg-success"
      : metrics.tone === "error"
        ? "bg-error"
        : "bg-highlight";

  const download = async () => {
    setDownloading(true);
    try {
      await downloadRoutinePdf(result);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="rl-enter mx-auto max-w-3xl px-5 pt-10 md:pt-16">
      {returning && (
        <p className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          Welcome back — here's the routine we recommended for you.
        </p>
      )}

      <p className="text-xs uppercase tracking-[0.22em] text-highlight">Your Skin Analysis</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Here's what we see.</h1>

      {/* Summary stat cards */}
      <div className="rl-card mt-7 p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-heading">Skin Score</p>
          <p className={`text-lg font-medium ${toneClass}`}>
            {metrics.score}/100 — {metrics.band}
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
            style={{ width: `${metrics.score}%` }}
          />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Skin Type" value={metrics.skinType} />
          <Stat label="Hydration Level" value={metrics.hydration} />
          <Stat label="Primary Concern" value={metrics.concern} />
        </div>
      </div>

      <ul className="mt-7 space-y-3">
        {result.summary.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-3xl">Your 30-Day Routine</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Built in three phases, so your skin has time to settle into each step.
      </p>

      <div className="mt-6 space-y-4">
        {phases.map((phase, i) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            expanded={isMobile ? open === phase.id : open === phase.id || (open === null && i === 0)}
            onToggle={() => setOpen(open === phase.id ? null : phase.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => void download()}
        disabled={downloading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-medium text-heading transition-colors hover:bg-surface disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {downloading ? "Preparing your PDF…" : "Download Your 30-Day Routine (PDF)"}
      </button>

      <h2 className="mt-14 text-3xl">Recommended Package</h2>
      <article className="rl-card mt-6 overflow-hidden">
        <div className="border-b border-border bg-surface px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-highlight">Chosen for you</p>
          <h3 className="mt-1.5 text-2xl">{bundle.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bundle.tagline}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 px-6 py-6">
          {bundle.items.map((id) => (
            <div key={id} className="text-center">
              <img
                src={PRODUCTS[id].image}
                alt={PRODUCTS[id].name}
                loading="lazy"
                width={768}
                height={768}
                className="aspect-square w-full rounded-xl bg-surface object-contain p-2"
              />
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                {PRODUCTS[id].shortName}
              </p>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <a
            href={bundle.url}
            className="inline-flex w-full items-center justify-center rounded-xl bg-btn px-6 py-3.5 text-sm font-medium text-btn-foreground transition-colors hover:bg-btn-hover"
          >
            Shop This Routine
          </a>
        </div>
      </article>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 inline-flex items-center gap-2 text-sm text-link underline underline-offset-4"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Start Fresh Analysis
      </button>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-heading">{value}</p>
    </div>
  );
}

function PhaseCard({
  phase,
  expanded,
  onToggle,
}: {
  phase: PlanPhase;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rl-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span>
          <span className="block text-xl text-heading">{phase.title}</span>
          <span className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-highlight">
            {phase.subtitle}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="rl-enter border-t border-border px-6 py-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{phase.note}</p>
          <ol className="mt-5 space-y-5">
            {phase.steps.map((step, i) => (
              <StepRow key={`${phase.id}-${step.productId}-${step.when}-${i}`} step={step} />
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

function StepRow({ step }: { step: PlanStep }) {
  const isStrips = step.productId === "strips";
  return (
    <>
      <li className="flex gap-4 border-b border-border pb-5 last:border-0 last:pb-0">
        <img
          src={step.image}
          alt={step.productName}
          loading="lazy"
          width={768}
          height={768}
          className="h-16 w-16 shrink-0 rounded-xl bg-surface object-contain p-1"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-heading">{step.productName}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.reason}</p>
          <dl className="mt-3 space-y-1.5">
            <Line
              icon={step.when === "AM" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              label="When"
              value={step.when}
            />
            <Line icon={<Droplet className="h-3.5 w-3.5" />} label="Quantity" value={step.quantity} />
            <Line icon={<Hand className="h-3.5 w-3.5" />} label="How to apply" value={step.how} />
            <Line
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Frequency"
              value={step.frequency}
            />
            <Line
              icon={<AlertTriangle className="h-3.5 w-3.5 text-error" />}
              label="When not to use"
              value={step.caution}
            />
            <Line
              icon={<Sparkles className="h-3.5 w-3.5 text-highlight" />}
              label="Key benefits"
              value={step.benefits}
            />
          </dl>
        </div>
      </li>
      {isStrips && (
        <li className="rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-heading">Dietary Supplement Disclaimer</p>
          <p>
            Rosaleigh Anti-Wrinkle Sublingual Strips are a food supplement and are not
            intended to diagnose, treat, cure, or prevent any disease or medical condition. This
            product is not a substitute for a varied and balanced diet or a healthy lifestyle.
            Results may vary between individuals. Do not exceed the recommended daily intake. Keep
            out of reach of children. Store in a cool, dry place away from direct sunlight. If you
            are pregnant, breastfeeding, taking medication, or have an underlying health condition,
            consult your doctor or pharmacist before use.
          </p>
        </li>
      )}
    </>
  );
}

function Line({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 text-xs leading-relaxed">
      <span className="mt-0.5 shrink-0 text-highlight">{icon}</span>
      <span className="text-muted-foreground">
        <span className="font-medium text-heading">{label}:</span> {value}
      </span>
    </div>
  );
}
