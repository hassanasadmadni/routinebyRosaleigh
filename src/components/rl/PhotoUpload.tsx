import { useEffect, useRef, useState } from "react";
import { Camera, Lock, Trash2, ScanFace, ArrowLeft, Loader2, Check } from "lucide-react";
import { checkFace } from "@/lib/face-check";

interface Props {
  onBack: () => void;
  onValid: (seed: string, dataUrl?: string) => void;
}

const ERROR_MESSAGE =
  "We couldn't clearly detect a face in this photo. Please upload a clear, well-lit, front-facing photo with your face fully visible.";

const ANALYSIS_STAGES = [
  "Mapping facial landmarks",
  "Reading skin tone and evenness",
  "Assessing hydration and surface texture",
  "Checking fine lines and firmness",
  "Matching your Rosaleigh routine",
];

const STAGE_MS = 1400;

export function PhotoUpload({ onBack, onValid }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "checking" | "analyzing">("idle");
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(0);
  const pending = useRef<{ seed: string; dataUrl?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state !== "analyzing") return;
    const id = window.setInterval(() => {
      setStage((s) => {
        const next = s + 1;
        if (next >= ANALYSIS_STAGES.length) {
          window.clearInterval(id);
          const p = pending.current;
          if (p) window.setTimeout(() => onValid(p.seed, p.dataUrl), 600);
          return s;
        }
        return next;
      });
    }, STAGE_MS);
    return () => window.clearInterval(id);
  }, [state, onValid]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) {
      setError(ERROR_MESSAGE);
      return;
    }
    setError(null);
    setState("checking");
    const result = await checkFace(file);
    if (!result.ok) {
      setState("idle");
      setError(ERROR_MESSAGE);
      return;
    }
    // Deterministic signature: the same photo always yields the same analysis.
    pending.current = {
      seed: `${file.name}|${file.size}|${file.lastModified}|${file.type}`,
      ...(result.dataUrl ? { dataUrl: result.dataUrl } : {}),
    };
    setStage(0);
    setState("analyzing");
  };

  if (state === "analyzing") {
    const progress = Math.round(((stage + 1) / ANALYSIS_STAGES.length) * 100);
    return (
      <section className="rl-enter mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-highlight" />
        <h2 className="mt-6 text-3xl">Analysing your skin…</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This takes a few moments — we're working through your photo step by step.
        </p>
        <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-highlight transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="mt-6 w-full space-y-2.5 text-left">
          {ANALYSIS_STAGES.map((label, i) => (
            <li
              key={label}
              className={`flex items-center gap-2.5 text-sm transition-opacity duration-500 ${
                i <= stage ? "opacity-100" : "opacity-40"
              }`}
            >
              {i < stage ? (
                <Check className="h-4 w-4 shrink-0 text-success" />
              ) : i === stage ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-highlight" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-border" />
              )}
              <span className={i <= stage ? "text-heading" : "text-muted-foreground"}>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }


  return (
    <section className="rl-enter mx-auto max-w-2xl px-5 pt-10 md:pt-16">
      <BackLink onClick={onBack} />
      <h1 className="mt-6 text-3xl md:text-4xl">Upload your photo</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Natural daylight, no makeup if possible, and look straight at the camera. JPG or PNG.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`mt-7 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging ? "border-highlight bg-surface" : "border-border bg-surface/60 hover:bg-surface"
        }`}
      >
        {state === "checking" ? (
          <Loader2 className="h-7 w-7 animate-spin text-highlight" />
        ) : (
          <Camera className="h-7 w-7 text-heading" />
        )}
        <p className="text-sm font-medium text-heading">
          {state === "checking" ? "Checking your photo…" : "Drag and drop, or tap to upload"}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG or WEBP — front-facing</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm leading-relaxed text-error">
          {error}
        </p>
      )}

      <ul className="mt-6 flex flex-wrap gap-2.5">
        <Pill icon={<Lock className="h-3.5 w-3.5" />} label="Stays on your device" />
        <Pill icon={<Trash2 className="h-3.5 w-3.5" />} label="Never uploaded" />
        <Pill icon={<ScanFace className="h-3.5 w-3.5" />} label="No facial recognition" />
      </ul>
    </section>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-muted-foreground">
      {icon}
      {label}
    </li>
  );
}

export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-heading"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
