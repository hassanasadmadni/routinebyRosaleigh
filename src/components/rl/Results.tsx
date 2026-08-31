import { useState, useEffect, useRef } from "react";
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
  FlaskConical,
  Dna,
} from "lucide-react";
import { BUNDLES, PRODUCTS } from "@/data/catalogue";
import { metricsFor, type SkinResult } from "@/lib/analysis";
import { buildPlan, type PlanPhase, type PlanStep } from "@/lib/plan";
import { downloadRoutinePdf } from "@/lib/pdf";
import sublingualMicro from "@/assets/sublingual micro.png";
import spfDayMicro from "@/assets/spf day micro.png";
import cleansingMicro from "@/assets/cleansing micro.png";
import nightMicro from "@/assets/night micro.png";
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

      {/* ── 1. SKIN SCORE GAUGE ── */}
      <ScoreGauge metrics={metrics} />

      {/* Summary stat cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Skin Type" value={metrics.skinType} />
        <Stat label="Hydration Level" value={metrics.hydration} />
        <Stat label="Primary Concern" value={metrics.concern} />
      </div>

      {/* ── 2. SKIN RADAR CHART ── */}
      <RadarChart result={result} metrics={metrics} />

      <ul className="mt-7 space-y-3">
        {result.summary.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <RoutineTimeline result={result} />

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

      {/* ── 4. 30-DAY IMPROVEMENT GRAPH ── */}
      <ImprovementGraph metrics={metrics} />

      {/* ── 5. PRODUCT ABSORPTION DIAGRAM ── */}
      <AbsorptionDiagram />

      <ScienceSection />

      <h2 className="mt-14 text-3xl">Recommended Package</h2>
      <article className="rl-card mt-6 overflow-hidden">
        <div className="border-b border-border bg-surface px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-highlight">Chosen for you</p>
          <h3 className="mt-1.5 text-2xl">{bundle.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bundle.tagline}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 px-6 py-6 sm:grid-cols-4">
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
        className="mt-6 mb-16 inline-flex items-center gap-2 text-sm text-link underline underline-offset-4"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Start Fresh Analysis
      </button>
    </section>
  );
}

// ─────────────────────────────────────────────
// 1. SCORE GAUGE
// ─────────────────────────────────────────────
function ScoreGauge({ metrics }: { metrics: ReturnType<typeof metricsFor> }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const score = metrics.score;
  const R = 70;
  const stroke = 10;
  const cx = 90;
  const cy = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (animated ? (score / 100) * totalAngle : 0);

  function polar(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arc(start: number, end: number, r: number) {
    const s = polar(start, r);
    const e = polar(end, r);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const strokeColor =
    metrics.tone === "success" ? "#5c7a52" : metrics.tone === "error" ? "#b4472c" : "#b79267";

  return (
    <div className="rl-card mt-7 overflow-hidden p-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-8">
        <div className="relative shrink-0">
          <svg width="180" height="105" viewBox="0 0 180 105">
            {/* Track */}
            <path d={arc(startAngle, endAngle, R)} fill="none" stroke="#e1e7dc" strokeWidth={stroke} strokeLinecap="round" />
            {/* Fill */}
            <path
              d={arc(startAngle, scoreAngle, R)}
              fill="none"
              stroke={strokeColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{ transition: "all 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((v) => {
              const a = startAngle + (v / 100) * totalAngle;
              const inner = polar(a, R - 8);
              const outer = polar(a, R + 3);
              return (
                <line key={v} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  stroke="#e1e7dc" strokeWidth="1.5" />
              );
            })}
            {/* Score text */}
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="32" fontWeight="600"
              fill="#3a4a40" fontFamily="Cormorant Garamond, Georgia, serif">
              {animated ? score : 0}
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" fontSize="10" fill="#4a564d"
              fontFamily="Karla, sans-serif" letterSpacing="0.12em">
              OUT OF 100
            </text>
          </svg>
        </div>
        <div className="mt-2 sm:mt-0 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-highlight">Skin Score</p>
          <p className="mt-1 text-2xl font-medium text-heading">{metrics.band}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your score reflects your current skin condition across hydration, protection habits, concern severity, and overall skin health markers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. RADAR / SPIDER CHART
// ─────────────────────────────────────────────
function RadarChart({ result, metrics }: { result: SkinResult; metrics: ReturnType<typeof metricsFor> }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 300); }, []);

  const a = result.answers;
  const raw = {
    Hydration: a.hydration === "balanced" ? 78 : a.hydration === "oily" ? 60 : 42,
    Firmness: a.concern === "firmness" ? 38 : a.concern === "lines" ? 52 : 72,
    Clarity: a.concern === "dullness" || a.concern === "texture" ? 48 : 74,
    Protection: a.spf === "daily" ? 88 : a.spf === "sometimes" ? 58 : 32,
    Renewal: a.routine === "full" ? 82 : a.routine === "basic" ? 62 : 42,
  };

  const axes = Object.keys(raw) as (keyof typeof raw)[];
  const values = axes.map((k) => raw[k] / 100);
  const cx = 130; const cy = 130; const r = 85;
  const n = axes.length;

  function point(i: number, val: number) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + val * r * Math.cos(angle),
      y: cy + val * r * Math.sin(angle),
    };
  }

  function labelPoint(i: number) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + (r + 28) * Math.cos(angle),
      y: cy + (r + 28) * Math.sin(angle),
    };
  }

  const rings = [0.25, 0.5, 0.75, 1];
  const animatedValues = animated ? values : values.map(() => 0);
  const polyPoints = axes.map((_, i) => point(i, animatedValues[i] ?? 0));
  const polygonPath = polyPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="rl-card mt-6 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-highlight">Skin Profile</p>
      <h3 className="mt-1 text-xl text-heading">Your Skin Dimensions</h3>
      <p className="mt-1 text-xs text-muted-foreground">Based on your quiz responses across five key skin health markers.</p>
      <div className="mt-4 flex justify-center">
        <svg width="260" height="240" viewBox="10 20 240 220">
          {/* Grid rings */}
          {rings.map((rv) =>
            axes.map((_, i) => {
              const p1 = point(i, rv);
              const p2 = point((i + 1) % n, rv);
              return <line key={`${rv}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#e1e7dc" strokeWidth="0.8" />;
            })
          )}
          {/* Spokes */}
          {axes.map((_, i) => {
            const outer = point(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e1e7dc" strokeWidth="0.8" />;
          })}
          {/* Fill polygon */}
          <path
            d={polygonPath}
            fill="#b79267"
            fillOpacity="0.18"
            stroke="#b79267"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ transition: "all 1.2s cubic-bezier(0.34,1.2,0.64,1)" }}
          />
          {/* Dots */}
          {polyPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#b79267"
              style={{ transition: "all 1.2s cubic-bezier(0.34,1.2,0.64,1)" }} />
          ))}
          {/* Labels */}
          {axes.map((label, i) => {
            const lp = labelPoint(i);
            return (
              <text key={label} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill="#4a564d" fontFamily="Karla, sans-serif" letterSpacing="0.08em">
                {label.toUpperCase()}
              </text>
            );
          })}
        </svg>
      </div>
      {/* Legend */}
      <div className="mt-3 grid grid-cols-5 gap-1">
        {axes.map((k) => (
          <div key={k} className="text-center">
            <p className="text-xs font-medium text-heading">{raw[k]}</p>
            <p className="text-[9px] text-muted-foreground">/100</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. AM/PM ROUTINE TIMELINE
// ─────────────────────────────────────────────
function RoutineTimeline({ result }: { result: SkinResult }) {
  const AM_STEPS = [
    { id: "strips", label: "Sublingual Strips", note: "30 min after breakfast", icon: "💊", time: "8:30 AM" },
    { id: "day-cream", label: "Day Cream SPF50", note: "Final morning step", icon: "☀️", time: "9:00 AM" },
  ];
  const PM_STEPS = [
    { id: "cleanser", label: "Cleansing Lotion", note: "Remove makeup & SPF", icon: "💧", time: "9:00 PM" },
    { id: "night-cream", label: "Night Cream", note: "Before sleeping", icon: "🌙", time: "10:00 PM" },
  ];

  const amIds = result.am.map((s) => s.productId);
  const pmIds = result.pm.map((s) => s.productId);
  const amSteps = AM_STEPS.filter((s) => amIds.includes(s.id as never));
  const pmSteps = PM_STEPS.filter((s) => pmIds.includes(s.id as never));

  return (
    <div className="mt-10">
      <p className="text-xs uppercase tracking-[0.2em] text-highlight">Daily Schedule</p>
      <h2 className="mt-1 text-3xl">Your Daily Routine</h2>
      <p className="mt-1 text-sm text-muted-foreground">A visual overview of when each product fits into your day.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* AM */}
        <div className="rl-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sun className="h-4 w-4 text-highlight" />
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-highlight">Morning</p>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {amSteps.map((step, i) => (
              <div key={i} className="relative mb-5 last:mb-0">
                <div className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full border-2 border-highlight bg-background" />
                <p className="text-sm font-medium text-heading">{step.icon} {step.label}</p>
                <p className="text-xs text-muted-foreground">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
        {/* PM */}
        <div className="rl-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Moon className="h-4 w-4 text-highlight" />
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-highlight">Evening</p>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {pmSteps.map((step, i) => (
              <div key={i} className="relative mb-5 last:mb-0">
                <div className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full border-2 border-highlight bg-background" />
                <p className="text-sm font-medium text-heading">{step.icon} {step.label}</p>
                <p className="text-xs text-muted-foreground">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. 30-DAY IMPROVEMENT GRAPH
// ─────────────────────────────────────────────
function ImprovementGraph({ metrics }: { metrics: ReturnType<typeof metricsFor> }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const base = metrics.score;
  const data = [
    { label: "Now", value: base, week: "Start" },
    { label: "Wk 1", value: Math.min(base + 4, 100), week: "Week 1" },
    { label: "Wk 2", value: Math.min(base + 9, 100), week: "Week 2" },
    { label: "Wk 3", value: Math.min(base + 14, 100), week: "Week 3" },
    { label: "Wk 4", value: Math.min(base + 18, 100), week: "Week 4" },
  ];

  const W = 280; const H = 120; const pad = { t: 10, r: 10, b: 30, l: 30 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const minV = Math.max(0, base - 5);
  const maxV = Math.min(100, base + 22);
  const range = maxV - minV;

  function px(i: number) { return pad.l + (i / (data.length - 1)) * chartW; }
  function py(v: number) { return pad.t + chartH - ((v - minV) / range) * chartH; }

  const points = data.map((d, i) => ({ x: px(i), y: animated ? py(d.value) : py(base) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1]!.x} ${pad.t + chartH} L ${pad.l} ${pad.t + chartH} Z`;

  return (
    <div className="rl-card mt-6 p-6" ref={ref}>
      <p className="text-xs uppercase tracking-[0.2em] text-highlight">Projected Progress</p>
      <h3 className="mt-1 text-xl text-heading">Expected Skin Improvement</h3>
      <p className="mt-1 text-xs text-muted-foreground mb-4">
        Projected improvement over your 30-day routine based on your skin profile. Individual results may vary.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={pad.l} y1={pad.t + chartH * (1 - t)} x2={W - pad.r} y2={pad.t + chartH * (1 - t)}
            stroke="#e1e7dc" strokeWidth="0.6" />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="#b79267" fillOpacity="0.08"
          style={{ transition: "all 1.4s cubic-bezier(0.34,1.1,0.64,1)" }} />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#b79267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "all 1.4s cubic-bezier(0.34,1.1,0.64,1)" }} />
        {/* Dots + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#b79267"
              style={{ transition: "all 1.4s cubic-bezier(0.34,1.1,0.64,1)" }} />
            <text x={p.x} y={pad.t + chartH + 16} textAnchor="middle" fontSize="8"
              fill="#4a564d" fontFamily="Karla, sans-serif">{data[i]!.label}</text>
            {animated && (
              <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="#b79267"
                fontFamily="Karla, sans-serif" style={{ transition: "all 1.4s ease" }}>
                {data[i]!.value}
              </text>
            )}
          </g>
        ))}
        {/* Y axis label */}
        <text x={pad.l - 4} y={pad.t + chartH / 2} textAnchor="middle" fontSize="7"
          fill="#4a564d" fontFamily="Karla, sans-serif" transform={`rotate(-90, ${pad.l - 14}, ${pad.t + chartH / 2})`}>
          SCORE
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. PRODUCT ABSORPTION DIAGRAM
// ─────────────────────────────────────────────
function AbsorptionDiagram() {
  const [active, setActive] = useState<number | null>(null);

  const layers = [
    {
      label: "Surface",
      sublabel: "Stratum Corneum",
      color: "#f5ede0",
      borderColor: "#e8d5b7",
      products: ["Day Cream SPF50", "Cleansing Lotion"],
      description: "The outermost skin layer. Day Cream SPF50 sits here forming a protective UV shield. Cleansing Lotion dissolves surface impurities and makeup without penetrating deeper.",
      depth: "0–20μm",
    },
    {
      label: "Epidermis",
      sublabel: "Living Skin Cells",
      color: "#e8d5c0",
      borderColor: "#d4b78c",
      products: ["Night Cream"],
      description: "Where active peptides in Night Cream signal keratinocyte renewal and begin building new, healthy skin cells to replace aged ones.",
      depth: "20–100μm",
    },
    {
      label: "Dermis",
      sublabel: "Collagen & Elastin",
      color: "#d4c4b0",
      borderColor: "#b79267",
      products: ["Night Cream peptides"],
      description: "The deepest layer reached topically. Night Cream peptides penetrate here to activate fibroblasts — the cells that produce collagen and elastin for firmness and structure.",
      depth: "100–2000μm",
    },
    {
      label: "Bloodstream",
      sublabel: "Systemic Circulation",
      color: "#3a4a40",
      borderColor: "#2a342e",
      textColor: "#f9faf8",
      products: ["Sublingual Strips"],
      description: "Sublingual Strips bypass the digestive system entirely, delivering active compounds directly into systemic circulation — reaching the dermis from within at up to 90% bioavailability.",
      depth: "Systemic",
    },
  ];

  return (
    <div className="mt-10">
      <p className="text-xs uppercase tracking-[0.2em] text-highlight">How It Works</p>
      <h2 className="mt-1 text-3xl">Where Each Product Works</h2>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Tap a layer to see how each product reaches it. Your routine covers every depth — surface to bloodstream.
      </p>
      <div className="rl-card overflow-hidden">
        {layers.map((layer, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(active === i ? null : i)}
            className="w-full border-b border-border last:border-0 text-left transition-colors"
            style={{ background: active === i ? layer.borderColor + "33" : "transparent" }}
          >
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Depth indicator bar */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div
                  className="w-3 rounded-sm"
                  style={{
                    height: `${20 + i * 10}px`,
                    background: layer.color,
                    border: `1.5px solid ${layer.borderColor}`,
                  }}
                />
                <p className="text-[8px] text-muted-foreground" style={{ fontSize: "7px" }}>{layer.depth}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium text-heading">{layer.label}</p>
                  <p className="text-[10px] text-muted-foreground">{layer.sublabel}</p>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {layer.products.map((p) => (
                    <span key={p} className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: layer.borderColor + "44", color: i === 3 ? "#3a4a40" : "#4a564d" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${active === i ? "rotate-180" : ""}`} />
            </div>
            {active === i && (
              <div className="px-5 pb-4 pt-0">
                <p className="text-xs leading-relaxed text-muted-foreground">{layer.description}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCIENCE SECTION
// ─────────────────────────────────────────────
const SCIENCE_CARDS = [
  {
    icon: <Dna className="h-5 w-5" />,
    product: "Anti-Wrinkle Sublingual Strips",
    title: "Precision Delivery for Cellular Renewal",
    image: sublingualMicro,
    body: "Most oral supplements lose the majority of their potency in transit — stomach acid, digestive enzymes, and first-pass liver metabolism can reduce absorption to as little as 20%. Sublingual delivery works differently. Placed beneath the tongue, the strip dissolves against the sublingual mucosa, a thin membrane richly supplied with capillaries, allowing active compounds to pass directly into systemic circulation within seconds. Bioavailability reaches up to 90%, meaning the skin receives a far more concentrated and consistent dose. Once absorbed, these compounds reach the dermal fibroblasts — the cells responsible for producing collagen and elastin, the proteins that give skin its structure, bounce, and resistance to creasing. Collagen production declines by roughly 1% each year from the mid-twenties onward; this targeted delivery mechanism is designed to intervene at precisely that cellular level.",
  },
  {
    icon: <FlaskConical className="h-5 w-5" />,
    product: "Anti-Wrinkle Day Cream SPF50",
    title: "Arresting Photoageing at the Source",
    image: spfDayMicro,
    body: "Dermatological research consistently attributes up to 80% of visible facial ageing not to the passage of time, but to cumulative UV exposure — a distinct biological process known as photoageing. UV-A radiation, which penetrates cloud cover and glass, reaches deep into the dermis where it generates reactive oxygen species that attack collagen fibre networks and cross-link elastin, producing the sagging and fine lines associated with ageing skin. UV-B radiation, meanwhile, causes direct pyrimidine dimer formation in epidermal DNA, disrupting controlled cell turnover and driving uneven pigmentation. Broad-spectrum SPF50 addresses both pathways — blocking 98% of UV-B and significantly attenuating UV-A — while the cream's humectant and emollient complex replenishes the skin's Natural Moisturising Factor, maintaining stratum corneum integrity and reducing transepidermal water loss throughout the day.",
  },
  {
    icon: <Droplet className="h-5 w-5" />,
    product: "Rosaleigh Cleansing Balm",
    title: "Cleansing Without Compromising the Barrier",
    image: cleansingMicro,
    body: "The skin's acid mantle — a finely balanced film sitting at approximately pH 4.5 to 5.5 — is the body's first line of defence against environmental aggressors, pathogenic bacteria, and moisture loss. Conventional surfactant-based cleansers are formulated at a higher pH and remove not only makeup and SPF but also the sebum, ceramides, and natural moisturising factors that hold the barrier together. The result is a compromised stratum corneum: tighter junctions between corneocytes break down, transepidermal water loss increases, and the skin becomes more susceptible to inflammation and accelerated ageing. The tallow base of this lotion is structurally similar to human sebum, allowing it to emulsify and lift oil-soluble products — including SPF and cosmetics — without altering surface pH or disrupting the lipid bilayer that underpins healthy, resilient skin.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    product: "Anti-Wrinkle Night Cream",
    title: "Active Repair While You Rest",
    image: nightMicro,
    body: "The night cream delivers a concentrated complex of peptides and occlusives that work through the hours you are asleep — the longest uninterrupted window in any day for a topical formula to remain on the skin undisturbed. Peptide sequences penetrate the epidermis and signal dermal fibroblasts to upregulate procollagen synthesis, directly rebuilding the structural framework that gives skin its firmness and resistance to creasing. Simultaneously, the occlusive layer reduces transepidermal water loss by up to 50%, sustaining the optimal hydration environment that allows active ingredients to remain soluble, mobile, and effective throughout the night. Applied consistently over 30 days, the cumulative effect is a measurable reduction in line depth, a visible improvement in surface texture, and noticeably firmer, denser-feeling skin by morning.",
  },
];

function ScienceSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-14">
      <h2 className="text-3xl">The Science Behind Your Routine</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        How each product works at a biological level to deliver visible results.
      </p>
      <ul className="mt-6 space-y-3">
        {SCIENCE_CARDS.map((card, i) => (
          <li key={i} className="rl-card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span className="shrink-0 text-highlight">{card.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.15em] text-highlight">{card.product}</p>
                <p className="mt-0.5 text-sm font-medium text-heading">{card.title}</p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="border-t border-border">
                {/* Image at full 3:2 ratio */}
                <div className="relative w-full" style={{ aspectRatio: "3/2" }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* Subtle gradient overlay at bottom for text legibility */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.15em] text-white/80">
                    Microscopy Illustration
                  </span>
                  <span className="absolute bottom-3 right-3 text-[8px] text-white/50 tracking-wide">
                    AI Reference Image
                  </span>
                </div>
                <div className="px-5 pb-5 pt-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">{card.body}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-heading">{value}</p>
    </div>
  );
}

function PhaseCard({ phase, expanded, onToggle }: { phase: PlanPhase; expanded: boolean; onToggle: () => void }) {
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
          <span className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-highlight">{phase.subtitle}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
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
        <img src={step.image} alt={step.productName} loading="lazy" width={768} height={768}
          className="h-16 w-16 shrink-0 rounded-xl bg-surface object-contain p-1" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-heading">{step.productName}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.reason}</p>
          <dl className="mt-3 space-y-1.5">
            <Line icon={step.when === "AM" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />} label="When" value={step.when} />
            <Line icon={<Droplet className="h-3.5 w-3.5" />} label="Quantity" value={step.quantity} />
            <Line icon={<Hand className="h-3.5 w-3.5" />} label="How to apply" value={step.how} />
            <Line icon={<CalendarDays className="h-3.5 w-3.5" />} label="Frequency" value={step.frequency} />
            <Line icon={<AlertTriangle className="h-3.5 w-3.5 text-error" />} label="When not to use" value={step.caution} />
            <Line icon={<Sparkles className="h-3.5 w-3.5 text-highlight" />} label="Key benefits" value={step.benefits} />
          </dl>
        </div>
      </li>
      {isStrips && (
        <li className="rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-heading">Dietary Supplement Disclaimer</p>
          <p>Rosaleigh Anti-Wrinkle Sublingual Strips are a food supplement and are not intended to diagnose, treat, cure, or prevent any disease or medical condition. This product is not a substitute for a varied and balanced diet or a healthy lifestyle. Results may vary between individuals. Do not exceed the recommended daily intake. Keep out of reach of children. Store in a cool, dry place away from direct sunlight. If you are pregnant, breastfeeding, taking medication, or have an underlying health condition, consult your doctor or pharmacist before use.</p>
        </li>
      )}
    </>
  );
}

function Line({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs leading-relaxed">
      <span className="mt-0.5 shrink-0 text-highlight">{icon}</span>
      <span className="text-muted-foreground">
        <span className="font-medium text-heading">{label}:</span> {value}
      </span>
    </div>
  );
}
