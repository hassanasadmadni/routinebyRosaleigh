import { jsPDF } from "jspdf";
import logo from "@/assets/logo.png";
import { DISCLAIMER } from "@/components/rl/Chrome";
import { BUNDLES } from "@/data/catalogue";
import { metricsFor, type SkinResult } from "./analysis";
import { buildPlan } from "./plan";

// Light-theme brand colours, used regardless of the on-screen theme.
const HEADING: [number, number, number] = [58, 74, 64];
const BODY: [number, number, number] = [42, 52, 46];
const MUTED: [number, number, number] = [74, 86, 77];
const GOLD: [number, number, number] = [183, 146, 103];
const LINE: [number, number, number] = [225, 231, 220];

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadRoutinePdf(result: SkinResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensure = (needed: number) => {
    if (y + needed > pageH - M) {
      doc.addPage();
      y = M;
    }
  };

  const text = (
    value: string,
    opts: { size?: number; color?: [number, number, number]; style?: string; gap?: number } = {},
  ) => {
    const { size = 10, color = BODY, style = "normal", gap = 4 } = opts;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(value, pageW - M * 2);
    ensure(lines.length * (size + 3));
    doc.text(lines, M, y);
    y += lines.length * (size + 3) + gap;
  };

  const logoData = await toDataUrl(logo);
  if (logoData) {
    const w = 120;
    doc.addImage(logoData, "PNG", M, y, w, w / 2);
    y += w / 2 + 10;
  } else {
    text("ROSALEIGH COSMETICS", { size: 16, color: HEADING, style: "bold" });
  }

  text("Your 30-Day Skin Routine", { size: 22, color: HEADING, style: "bold", gap: 2 });
  text(new Date(result.createdAt).toLocaleDateString("en-GB"), { size: 9, color: MUTED, gap: 14 });

  const m = metricsFor(result);
  text("Skin Analysis Summary", { size: 14, color: HEADING, style: "bold", gap: 6 });
  text(`Skin Score: ${m.score}/100 — ${m.band}`, { color: GOLD, style: "bold" });
  text(`Skin Type: ${m.skinType}`);
  text(`Hydration Level: ${m.hydration}`);
  text(`Primary Concern: ${m.concern}`, { gap: 14 });

  for (const phase of buildPlan(result)) {
    ensure(60);
    doc.setDrawColor(...LINE);
    doc.line(M, y - 6, pageW - M, y - 6);
    y += 8;
    text(`${phase.title} — ${phase.subtitle}`, {
      size: 14,
      color: HEADING,
      style: "bold",
      gap: 4,
    });
    text(phase.note, { size: 9, color: MUTED, gap: 10 });

    phase.steps.forEach((step, i) => {
      ensure(70);
      text(`${i + 1}. ${step.productName}`, { size: 11, color: HEADING, style: "bold", gap: 3 });
      text(`When: ${step.when}   |   Quantity: ${step.quantity}`, { size: 9, color: MUTED });
      text(`How to apply: ${step.how}`, { size: 9, color: MUTED });
      text(`Frequency: ${step.frequency}`, { size: 9, color: MUTED });
      text(`Caution: ${step.caution}`, { size: 9, color: MUTED, gap: 10 });
    });
  }

  ensure(60);
  doc.setDrawColor(...LINE);
  doc.line(M, y - 6, pageW - M, y - 6);
  y += 8;
  text("Recommended Package", { size: 14, color: HEADING, style: "bold", gap: 4 });
  const bundle = BUNDLES[result.bundleId];
  text(bundle.name, { size: 11, color: GOLD, style: "bold" });
  text(bundle.tagline, { size: 9, color: MUTED, gap: 14 });

  text(DISCLAIMER, { size: 7.5, color: MUTED });

  doc.save("rosaleigh-30-day-routine.pdf");
}
