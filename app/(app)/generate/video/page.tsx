"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/app/UploadDropzone";
import { OptionPicker } from "@/components/app/OptionPicker";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { addToHistory } from "@/lib/history";

const MOTIONS = [
  { id: "orbit", label: "Slow orbit", hint: "360° around the product" },
  { id: "dolly", label: "Dolly-in", hint: "Cinematic push toward it" },
  { id: "pan", label: "Pan", hint: "Smooth lateral glide" },
];

export default function VideoGeneratorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [motion, setMotion] = useState("orbit");
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  async function generate() {
    if (!image) return;
    setLoading(true);
    setError(null);
    setVideo(null);
    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, motion, prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      setVideo(json.url);
      setDemo(!!json.demo);
      addToHistory([
        {
          id: `${Date.now()}`,
          type: "video",
          url: image, // thumbnail = source image
          theme: MOTIONS.find((m) => m.id === motion)?.label ?? motion,
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
            Five seconds of <em className="text-gradient-iris font-light italic">motion.</em>
          </h1>
        </div>
        {demo && <Badge tone="warning">Demo output</Badge>}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-7">
          <UploadDropzone image={image} onImage={setImage} />
          <Textarea
            label="Prompt (optional)"
            hint="Describe the motion or scene you want. Leave blank to use the motion style below."
            placeholder="e.g. slow cinematic zoom, product rotating on a pedestal, soft studio glow"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <OptionPicker label="Motion style" options={MOTIONS} value={motion} onChange={setMotion} columns={3} />
          <Button className="w-full" size="lg" disabled={!image || loading} onClick={generate}>
            {loading ? "Rendering… (~1 min)" : "Generate 5s clip"}
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
                Rendering your clip…
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
                Your clip will play here
              </p>
              <p className="mt-2 max-w-xs text-sm leading-body text-dim">
                Upload a product photo and pick a motion style — Lumora renders
                a 5-second clip ready for reels and product pages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
