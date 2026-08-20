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

type Stage = "landing" | "photo" | "quiz" | "results";

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
    const computed = analyzeSkin({ answers, source, imageDataUrl });
    saveResult(computed);
    setResult(computed);
    setReturning(false);
    setStage("results");
  };

  const completeFromPhoto = (seed: string, dataUrl?: string) => {
    setImageDataUrl(dataUrl);
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

        {stage === "results" && result && (
          <Results result={result} returning={returning} onRestart={restart} />
        )}
      </main>
      <Footer />
    </div>
  );
}
