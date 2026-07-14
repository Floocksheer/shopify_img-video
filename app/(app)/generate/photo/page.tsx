"use client";

import Image from "next/image";
import { useState } from "react";
import { MultiUploadDropzone } from "@/components/app/MultiUploadDropzone";
import { OptionPicker } from "@/components/app/OptionPicker";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { addToHistory } from "@/lib/history";

const ASPECTS = [
  { id: "1:1", label: "Square", hint: "1:1 · grid" },
  { id: "4:3", label: "Landscape", hint: "4:3 · banner" },
  { id: "3:4", label: "Portrait", hint: "3:4 · mobile" },
  { id: "16:9", label: "Wide", hint: "16:9 · hero" },
  { id: "9:16", label: "Story", hint: "9:16 · reels" },
];

// Tailwind aspect class per ratio, so previews match the generated shape.
const ASPECT_CLASS: Record<string, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:4": "aspect-[3/4]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
};

const QUALITIES = [
  { id: "standard", label: "Standard", hint: "~1080p · faster" },
  { id: "high", label: "High", hint: "~2K · sharper" },
];

const COUNTS = [
  { id: "1", label: "1", hint: "Single" },
  { id: "2", label: "2", hint: "Pair" },
  { id: "4", label: "4", hint: "Set" },
  { id: "6", label: "6", hint: "Full set" },
];

type ExportState = "idle" | "exporting" | "done" | "error";

export default function PhotoGeneratorPage() {
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("1:1");
  const [quality, setQuality] = useState("standard");
  const [count, setCount] = useState("4");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [geminiError, setGeminiError] = useState(false);
  const [exports, setExports] = useState<Record<number, ExportState>>({});

  const n = Number(count);

  async function generate() {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setGeminiError(false);
    setExports({});
    try {
      const res = await fetch("/api/generate/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, prompt, aspectRatio: aspect, quality, count: n }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      setResults(json.images);
      setDemo(!!json.demo);
      setGeminiError(!!json.geminiError);
      const label = prompt.trim().slice(0, 40) || "Product photo";
      addToHistory(
        (json.images as string[]).map((url, i) => ({
          id: `${Date.now()}-${i}`,
          type: "photo" as const,
          url,
          theme: label,
          createdAt: new Date().toISOString(),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function exportToShopify(url: string, index: number) {
    setExports((s) => ({ ...s, [index]: "exporting" }));
    try {
      const res = await fetch("/api/shopify/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, filename: `lumora-photo-${index + 1}.jpg` }),
      });
      if (!res.ok) throw new Error();
      setExports((s) => ({ ...s, [index]: "done" }));
    } catch {
      setExports((s) => ({ ...s, [index]: "error" }));
    }
  }

  return (
    <div className="animate-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
            Photo Studio
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-display text-ink">
            One photo in, <em className="text-gradient-iris font-light italic">a set out.</em>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {geminiError && <Badge tone="warning">⚠ Gemini hatası</Badge>}
          {demo && <Badge tone="warning">Demo output</Badge>}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* controls */}
        <div className="space-y-7">
          <MultiUploadDropzone
            images={images}
            onChange={setImages}
            max={10}
            hint="add more angles of the same product"
          />
          <Textarea
            label="Prompt"
            hint="Describe the scene you want. Leave blank for a clean studio shot."
            placeholder="e.g. perfume bottle on a marble table beside fresh flowers, soft morning light"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <OptionPicker label="Aspect ratio" options={ASPECTS} value={aspect} onChange={setAspect} columns={3} />
          <OptionPicker label="Resolution" options={QUALITIES} value={quality} onChange={setQuality} columns={2} />
          <OptionPicker label="How many photos" options={COUNTS} value={count} onChange={setCount} columns={4} />
          <Button className="w-full" size="lg" disabled={images.length === 0 || loading} onClick={generate}>
            {loading ? "Generating…" : `Generate ${n} photo${n > 1 ? "s" : ""}`}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M8 1.5l1.7 4.1 4.4.4-3.3 2.9 1 4.3L8 10.9l-3.8 2.3 1-4.3-3.3-2.9 4.4-.4L8 1.5z" strokeLinejoin="round" />
              </svg>
            )}
          </Button>
          {error && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        {/* results */}
        <div>
          {loading && (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: n }).map((_, i) => (
                <Skeleton key={i} className={ASPECT_CLASS[aspect] ?? "aspect-square"} />
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {results.map((url, i) => (
                <figure
                  key={url + i}
                  className="group relative animate-fade-up overflow-hidden rounded-2xl border border-line shadow-card"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <Image
                    src={url}
                    alt={`Generated product photo ${i + 1}`}
                    width={480}
                    height={600}
                    className={`${ASPECT_CLASS[aspect] ?? "aspect-square"} w-full object-cover`}
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-night/85 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    <a
                      href={url}
                      download={`lumora-photo-${i + 1}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/10 text-xs font-medium text-ink backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"
                    >
                      ↓ Download
                    </a>
                    <button
                      onClick={() => exportToShopify(url, i)}
                      disabled={exports[i] === "exporting" || exports[i] === "done"}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-iris text-xs font-medium text-night transition-colors duration-200 hover:bg-iris-bright disabled:opacity-60"
                    >
                      {exports[i] === "exporting" && "Exporting…"}
                      {exports[i] === "done" && "✓ In Shopify"}
                      {exports[i] === "error" && "Retry export"}
                      {!exports[i] && "→ Shopify"}
                    </button>
                  </div>
                </figure>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="glass flex h-full min-h-[320px] flex-col items-center justify-center rounded-card p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-iris/10 text-2xl ring-1 ring-iris/20" aria-hidden>
                ✦
              </span>
              <p className="mt-5 font-display text-2xl tracking-display text-muted">
                Your set will appear here
              </p>
              <p className="mt-2 max-w-xs text-sm leading-body text-dim">
                Upload a product photo, describe the scene you want, and generate
                studio-grade variations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
