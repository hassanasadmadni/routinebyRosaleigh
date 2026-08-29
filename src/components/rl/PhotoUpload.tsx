import { useEffect, useRef, useState } from "react";
import { Camera, Lock, Trash2, ScanFace, ArrowLeft, Loader2, Check, Video, X } from "lucide-react";
import { checkFace } from "@/lib/face-check";

interface Props {
  onBack: () => void;
  onValid: (seed: string, dataUrl?: string) => void;
}

const ERROR_MESSAGE =
  "We couldn't clearly detect a face in this photo. Please upload a clear, well-lit, front-facing photo with your face fully visible.";

const CAMERA_ERROR_MESSAGE =
  "We couldn't access your camera. Check your browser permissions, or upload a photo instead.";

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
  const [state, setState] = useState<"idle" | "camera" | "checking" | "analyzing">("idle");
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const pending = useRef<{ seed: string; dataUrl?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Always release the camera when we leave camera mode or unmount.
  useEffect(() => {
    if (state !== "camera") {
      stopStream();
    }
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const readyPollRef = useRef<number | null>(null);

  const stopStream = () => {
    if (readyPollRef.current !== null) {
      window.clearInterval(readyPollRef.current);
      readyPollRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onloadeddata = null;
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const openCamera = async () => {
    setError(null);
    setCameraReady(false);
    setState("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      console.log(
        "Camera stream acquired:",
        stream.getVideoTracks().map((t) => ({ label: t.label, state: t.readyState, settings: t.getSettings() }))
      );

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setState("idle");
        setError(CAMERA_ERROR_MESSAGE);
        return;
      }

      video.srcObject = stream;

      // Different browsers fire different combinations of these events reliably,
      // so we listen for all of them and also poll actual frame dimensions as
      // a last-resort fallback — whichever signal arrives first wins.
      const markReady = () => setCameraReady(true);
      video.onloadedmetadata = markReady;
      video.onloadeddata = markReady;
      video.oncanplay = markReady;
      video.onplaying = markReady;

      video.play().catch((err) => {
        // Autoplay can reject even though the stream is healthy;
        // the events above (or the poll below) still resolve readiness.
        console.warn("video.play() rejected (usually harmless):", err);
      });

      // Immediate check in case metadata already loaded before handlers attached.
      if (video.readyState >= 1 && video.videoWidth > 0) markReady();

      // Polling fallback: some browsers never fire the events above reliably
      // when the element is attached right as the stream starts. Poll for
      // actual decoded frame dimensions and flip ready as soon as we have them.
      readyPollRef.current = window.setInterval(() => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          markReady();
          if (readyPollRef.current !== null) {
            window.clearInterval(readyPollRef.current);
            readyPollRef.current = null;
          }
        }
      }, 200);
    } catch (err) {
      console.error("Camera access failed:", err);
      stopStream();
      setState("idle");
      setError(CAMERA_ERROR_MESSAGE);
    }
  };

  const closeCamera = () => {
    stopStream();
    setState("idle");
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    if (!size) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Center-crop to a square so the capture matches the circular guide.
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1); // un-mirror the selfie view
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    stopStream();

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setState("idle");
          setError(ERROR_MESSAGE);
          return;
        }
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        await handleFile(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) {
      setState("idle");
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

  if (state === "camera") {
    return (
      <section className="rl-enter mx-auto max-w-md px-5 pt-10 md:pt-16">
        <BackLink onClick={closeCamera} />
        <h1 className="mt-6 text-3xl md:text-4xl">Position your face</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Center your face in the frame, in good light, and hold still.
        </p>

        <div className="relative mx-auto mt-7 aspect-square w-full max-w-sm overflow-hidden rounded-full border border-border bg-surface">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full scale-x-[-1] object-cover"
          />

          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface">
              <Loader2 className="h-7 w-7 animate-spin text-highlight" />
            </div>
          )}

          {cameraReady && (
            <>
              {/* face guide ring */}
              <div className="pointer-events-none absolute inset-4 rounded-full border-2 border-highlight/60" />
              {/* scanning line */}
              <div className="pointer-events-none absolute inset-x-4 top-4 bottom-4 overflow-hidden rounded-full">
                <div className="rl-scan-line h-10 w-full bg-gradient-to-b from-transparent via-highlight/70 to-transparent" />
              </div>
              {/* corner brackets */}
              <CornerBrackets />
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={closeCamera}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-heading"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!cameraReady}
            className="inline-flex items-center gap-2 rounded-full bg-highlight px-6 py-2.5 text-sm font-medium text-highlight-foreground transition-opacity disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Capture
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm leading-relaxed text-error">
            {error}
          </p>
        )}

        <style>{`
          @keyframes rl-scan-line {
            0% { transform: translateY(0%); opacity: 0; }
            12% { opacity: 1; }
            88% { opacity: 1; }
            100% { transform: translateY(calc(100% + 2.5rem)); opacity: 0; }
          }
          .rl-scan-line {
            animation: rl-scan-line 2.4s ease-in-out infinite;
          }
        `}</style>
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

      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={openCamera}
        disabled={state === "checking"}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium text-heading transition-colors hover:bg-surface/80 disabled:opacity-50"
      >
        <Video className="h-4 w-4" />
        Take a photo now
      </button>

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

function CornerBrackets() {
  const common = "absolute h-6 w-6 border-highlight";
  return (
    <>
      <span className={`${common} left-6 top-6 border-l-2 border-t-2 rounded-tl-lg`} />
      <span className={`${common} right-6 top-6 border-r-2 border-t-2 rounded-tr-lg`} />
      <span className={`${common} left-6 bottom-6 border-l-2 border-b-2 rounded-bl-lg`} />
      <span className={`${common} right-6 bottom-6 border-r-2 border-b-2 rounded-br-lg`} />
    </>
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
