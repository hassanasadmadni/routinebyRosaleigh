import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/rl/Chrome";
import { Landing } from "@/components/rl/Landing";
import { PhotoUpload } from "@/components/rl/PhotoUpload";
import { Quiz } from "@/components/rl/Quiz";
import { Results } from "@/components/rl/Results";
import {
  analyzeSkin,
  answersFromSeed,
  clearResult,
  loadResult,
  saveResult,
  type SkinResult,
} from "@/lib/analysis";

import type { QuizAnswers } from "@/data/quiz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skin Analysis | Rosaleigh Cosmetics" },
      {
        name: "description",
        content:
          "Take the Rosaleigh Cosmetics skin analysis — a photo or a short quiz — for a personalised AM/PM tallow skincare routine and matched bundle.",
      },
      { property: "og:title", content: "Skin Analysis | Rosaleigh Cosmetics" },
      {
        property: "og:description",
        content:
          "A calm, two-minute skin analysis with a personalised Rosaleigh routine and recommended package.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkinAnalysisPage,
});

type Stage = "landing" | "photo" | "quiz" | "analysing" | "results";

function SkinAnalysisPage() {
  const [stage, setStage] = useState<Stage>("landing");
  const [source, setSource] = useState<"photo" | "quiz">("quiz");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [result, setResult] = useState<SkinResult | null>(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const saved = loadResult();
    if (saved) {
      setResult(saved);
      setReturning(true);
      setStage("results");
    }
  }, []);

  const start = (path: "photo" | "quiz") => {
    const saved = loadResult();
    if (saved) {
      // Repeat visit: never recompute, show the stored routine instantly.
      setResult(saved);
      setReturning(true);
      setStage("results");
      return;
    }
    setSource(path);
    setStage(path === "photo" ? "photo" : "quiz");
  };

  const complete = (answers: QuizAnswers) => {
    setStage("analysing");
    setTimeout(() => {
      const computed = analyzeSkin({ answers, source, imageDataUrl });
      saveResult(computed);
      setResult(computed);
      setReturning(false);
      setStage("results");
    }, 5500);
  };

  const completeFromPhoto = (seed: string, dataUrl?: string) => {
    setImageDataUrl(dataUrl);
    setStage("analysing");
    setTimeout(() => {
      const computed = analyzeSkin({
        answers: answersFromSeed(seed),
        source: "photo",
        seed,
        imageDataUrl: dataUrl,
      });
      saveResult(computed);
      setResult(computed);
      setReturning(false);
      setStage("results");
    }, 5500);
  };

  const restart = () => {
    clearResult();
    setResult(null);
    setReturning(false);
    setImageDataUrl(undefined);
    setStage("landing");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16">
        {stage === "landing" && <Landing onChoose={start} />}
        {stage === "photo" && (
          <PhotoUpload onBack={() => setStage("landing")} onValid={completeFromPhoto} />
        )}
        {stage === "quiz" && (
          <Quiz intro={undefined} onExit={() => setStage("landing")} onComplete={complete} />
        )}

        {stage === "analysing" && <AnalysingScreen />}

        {stage === "results" && result && (
          <Results result={result} returning={returning} onRestart={restart} />
        )}
      </main>
      <Footer />
    </div>
  );
}

const ANALYSIS_STEPS = [
  "Reading your skin profile…",
  "Mapping concern areas…",
  "Checking hydration indicators…",
  "Matching product formulations…",
  "Building your 30-day routine…",
];

function AnalysingScreen() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1));
    }, 1000);
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 98 ? 98 : p + Math.random() * 3.5));
    }, 120);
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <section className="rl-enter mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-5 text-center">

      {/* ── Branded SVG animation ── */}
      <div className="relative mb-8 h-52 w-52">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">

          {/* Outer slow-rotating orbit ring */}
          <circle cx="100" cy="100" r="88" fill="none" stroke="#b79267" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.35">
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="18s" repeatCount="indefinite" />
          </circle>

          {/* Middle orbit ring */}
          <circle cx="100" cy="100" r="68" fill="none" stroke="#3a4a40" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.2">
            <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="12s" repeatCount="indefinite" />
          </circle>

          {/* Gold molecule dot — orbiting */}
          <circle r="4" fill="#b79267" opacity="0.9">
            <animateMotion dur="6s" repeatCount="indefinite">
              <mpath href="#orbit1" />
            </animateMotion>
          </circle>
          <path id="orbit1" d="M 100,12 A 88,88 0 1,1 99.9,12" fill="none" />

          {/* Green molecule dot — orbiting opposite */}
          <circle r="3" fill="#3a4a40" opacity="0.7">
            <animateMotion dur="9s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
              <mpath href="#orbit2" />
            </animateMotion>
          </circle>
          <path id="orbit2" d="M 100,32 A 68,68 0 1,1 99.9,32" fill="none" />

          {/* Small cream dot — inner orbit */}
          <circle r="2.5" fill="#b79267" opacity="0.5">
            <animateMotion dur="4s" repeatCount="indefinite">
              <mpath href="#orbit3" />
            </animateMotion>
          </circle>
          <path id="orbit3" d="M 100,52 A 48,48 0 1,1 99.9,52" fill="none" />

          {/* Centre glow */}
          <circle cx="100" cy="100" r="36" fill="#b79267" opacity="0.06">
            <animate attributeName="r" values="34;38;34" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Centre circle bg */}
          <circle cx="100" cy="100" r="28" fill="#f9faf8" stroke="#b79267" strokeWidth="1" opacity="0.95" />

          {/* Rosaleigh R monogram centre */}
          <text x="100" y="108" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="28" fontWeight="600" fill="#3a4a40" opacity="0.9">R</text>

          {/* Floating leaf top-left */}
          <g opacity="0.55">
            <ellipse cx="38" cy="42" rx="7" ry="13" fill="#3a4a40" transform="rotate(-35 38 42)">
              <animate attributeName="opacity" values="0.55;0.8;0.55" dur="4s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="0,0; 1,-2; 0,0" dur="4s" repeatCount="indefinite" additive="sum" />
            </ellipse>
            <line x1="38" y1="30" x2="38" y2="54" stroke="#f9faf8" strokeWidth="0.8" transform="rotate(-35 38 42)" />
          </g>

          {/* Floating leaf bottom-right */}
          <g opacity="0.45">
            <ellipse cx="162" cy="158" rx="6" ry="11" fill="#b79267" transform="rotate(40 162 158)">
              <animate attributeName="opacity" values="0.45;0.7;0.45" dur="5s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="0,0; -1,2; 0,0" dur="5s" repeatCount="indefinite" additive="sum" />
            </ellipse>
            <line x1="162" y1="148" x2="162" y2="168" stroke="#f9faf8" strokeWidth="0.7" transform="rotate(40 162 158)" />
          </g>

          {/* Small molecule bond top-right */}
          <g opacity="0.5">
            <circle cx="158" cy="44" r="3.5" fill="none" stroke="#b79267" strokeWidth="1">
              <animate attributeName="r" values="3.5;5;3.5" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="148" cy="56" r="2.5" fill="#b79267" opacity="0.6" />
            <line x1="155" y1="48" x2="150" y2="54" stroke="#b79267" strokeWidth="0.8" opacity="0.5" />
          </g>

          {/* Small molecule bond bottom-left */}
          <g opacity="0.4">
            <circle cx="42" cy="158" r="3" fill="none" stroke="#3a4a40" strokeWidth="1">
              <animate attributeName="r" values="3;4.5;3" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="54" cy="150" r="2" fill="#3a4a40" opacity="0.5" />
            <line x1="45" y1="155" x2="52" y2="152" stroke="#3a4a40" strokeWidth="0.8" opacity="0.4" />
          </g>

          {/* Pulse ring from centre */}
          <circle cx="100" cy="100" r="40" fill="none" stroke="#b79267" strokeWidth="1" opacity="0">
            <animate attributeName="r" values="28;90" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.5s" repeatCount="indefinite" />
          </circle>

        </svg>
      </div>

      <h2 className="text-2xl font-medium text-heading">Analysing Your Skin</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please wait while we prepare your personalised routine.
      </p>

      {/* Progress bar */}
      <div className="mt-8 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-1.5 rounded-full bg-highlight transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Cycling step text */}
      <p key={step} className="mt-5 text-xs tracking-wide text-muted-foreground">
        {ANALYSIS_STEPS[step]}
      </p>

    </section>
  );
}
