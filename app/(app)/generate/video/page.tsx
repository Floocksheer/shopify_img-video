"use client";

import { useState } from "react";
import { MultiUploadDropzone } from "@/components/app/MultiUploadDropzone";
import { OptionPicker } from "@/components/app/OptionPicker";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { addToHistory } from "@/lib/history";

const DURATIONS = [
  { id: "5", label: "5 seconds", hint: "Quick loop" },
  { id: "10", label: "10 seconds", hint: "Fuller reveal" },
];

export default function VideoGeneratorPage() {
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5");
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [geminiError, setGeminiError] = useState(false);

  async function generate() {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    setVideo(null);
    setGeminiError(false);
    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, prompt, duration: Number(duration) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      const url: string | null = json.url ?? (json.urls?.[0] ?? null);
      setVideo(url);
      setDemo(!!json.demo);
      setGeminiError(!!json.geminiError);
      const label = prompt.trim().slice(0, 40) || "Product video";
      addToHistory([
        {
          id: `${Date.now()}`,
          type: "video",
          url: images[0], // thumbnail = first source photo
          theme: label,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
            Video Studio
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-display text-ink">
            Your photos, <em className="text-gradient-iris font-light italic">one video.</em>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {geminiError && <Badge tone="warning">⚠ Gemini hatası</Badge>}
          {demo && <Badge tone="warning">Demo output</Badge>}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-7">
          <MultiUploadDropzone
            images={images}
            onChange={setImages}
            max={4}
            hint="upload one or more clear photos of the same product"
          />
          <Textarea
            label="Prompt"
            hint="Describe the scene and the camera motion. The product is placed into that scene first, so the video starts already there — no fade-in from your original photo. Leave blank for a smooth studio move."
            placeholder="e.g. product on a modern office desk, camera slowly pushes in, soft daylight, gentle reflections"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <OptionPicker label="Duration" options={DURATIONS} value={duration} onChange={setDuration} columns={2} />
          <Button className="w-full" size="lg" disabled={images.length === 0 || loading} onClick={generate}>
            {loading ? "Rendering… (~1 min)" : `Generate ${duration}s video`}
            {!loading && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <path d="M4 2.5v9l7-4.5-7-4.5z" />
              </svg>
            )}
          </Button>
          {error && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <div>
          {loading && (
            <div className="skeleton flex aspect-video items-center justify-center rounded-card">
              <p className="relative z-10 animate-pulse-soft font-mono text-xs uppercase tracking-[0.24em] text-muted">
                Rendering your video…
              </p>
            </div>
          )}

          {!loading && video && (
            <figure className="animate-fade-up">
              <video
                src={video}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="aspect-video w-full rounded-card border border-line object-cover shadow-lift"
              />
              <div className="mt-4 flex gap-3">
                <a
                  href={video}
                  download="lumora-product-video.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-iris text-sm font-medium text-night shadow-button transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-iris-bright active:scale-[0.97]"
                >
                  ↓ Download MP4
                </a>
                <Button variant="secondary" className="flex-1" onClick={() => setVideo(null)}>
                  Generate another
                </Button>
              </div>
            </figure>
          )}

          {!loading && !video && (
            <div className="glass flex h-full min-h-[320px] flex-col items-center justify-center rounded-card p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-iris/10 text-2xl ring-1 ring-iris/20" aria-hidden>
                🎬
              </span>
              <p className="mt-5 font-display text-2xl tracking-display text-muted">
                Your video will play here
              </p>
              <p className="mt-2 max-w-xs text-sm leading-body text-dim">
                Upload a clear product photo and describe the camera motion —
                Lumora animates it into a faithful 1080p clip, ready for reels
                and product pages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
