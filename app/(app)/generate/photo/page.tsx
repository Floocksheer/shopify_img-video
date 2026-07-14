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

// Two selection modes toggled in the same slot. Both hold 6 options laid out
// as 3 columns × 2 rows, so switching between them never shifts the layout.
const RATIOS = [
  { id: "1:1", label: "1:1", hint: "Square" },
  { id: "4:5", label: "4:5", hint: "Portrait" },
  { id: "4:3", label: "4:3", hint: "Landscape" },
  { id: "3:4", label: "3:4", hint: "Tall" },
  { id: "16:9", label: "16:9", hint: "Wide" },
  { id: "9:16", label: "9:16", hint: "Story" },
];

const RESOLUTIONS = [
  { id: "2000x2000", label: "2000×2000", hint: "Square 2K" },
  { id: "1920x1080", label: "1920×1080", hint: "Full HD" },
  { id: "1080x1920", label: "1080×1920", hint: "Vertical HD" },
  { id: "1080x1080", label: "1080×1080", hint: "Square HD" },
  { id: "2048x1152", label: "2048×1152", hint: "16:9 · 2K" },
  { id: "1600x1200", label: "1600×1200", hint: "4:3" },
];

// Ratio → pixel size at a 2K long edge, rounded to a multiple of 16 (mirrors
// the server's pixelsFor). Used both to preview the shape and to send exact px.
function ratioToDims(id: string): { w: number; h: number } {
  const [rw, rh] = id.split(":").map(Number);
  const scale = 2048 / Math.max(rw, rh);
  const r16 = (n: number) => Math.max(256, Math.round((n * scale) / 16) * 16);
  return { w: r16(rw), h: r16(rh) };
}

const parseRes = (id: string): { w: number; h: number } => {
  const [w, h] = id.split("x").map(Number);
  return { w, h };
};

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
  const [sizeMode, setSizeMode] = useState<"ratio" | "resolution">("ratio");
  const [ratioId, setRatioId] = useState("1:1");
  const [resId, setResId] = useState("1920x1080");
  const [count, setCount] = useState("4");

  // Pixel dimensions of the current selection, in either mode.
  const dims = sizeMode === "ratio" ? ratioToDims(ratioId) : parseRes(resId);
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
        body: JSON.stringify({
          images,
          prompt,
          count: n,
          width: dims.w,
          height: dims.h,
          aspectRatio: sizeMode === "ratio" ? ratioId : undefined,
        }),
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
            hint="Describe the scene and any exact background colour. No need to list angles — the set automatically varies them. Leave blank for a clean studio shot."
            placeholder="e.g. perfume bottle on a marble table beside fresh flowers, soft morning light"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {/* Toggle the same slot between aspect-ratio and exact-resolution
              pickers. Both hold 6 options (3×2), so toggling never shifts. */}
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
                Output size
              </span>
              {/* Sliding segmented switch: the pill slides left/right. */}
              <div
                role="tablist"
                aria-label="Choose output size mode"
                className="relative grid grid-cols-2 rounded-full border border-line bg-elevated/50 p-0.5"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-iris/90 shadow-[0_0_0_3px_rgba(124,108,255,0.12)] transition-transform duration-200 ease-out"
                  style={{ transform: sizeMode === "resolution" ? "translateX(100%)" : "translateX(0)" }}
                />
                {(["ratio", "resolution"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={sizeMode === m}
                    onClick={() => setSizeMode(m)}
                    className={
                      "relative z-10 rounded-full px-3.5 py-1 text-[11px] font-medium transition-colors duration-200 " +
                      (sizeMode === m ? "text-night" : "text-muted hover:text-ink")
                    }
                  >
                    {m === "ratio" ? "Aspect ratio" : "Resolution"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {(sizeMode === "ratio" ? RATIOS : RESOLUTIONS).map((opt) => {
                const active = (sizeMode === "ratio" ? ratioId : resId) === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => (sizeMode === "ratio" ? setRatioId(opt.id) : setResId(opt.id))}
                    aria-pressed={active}
                    className={
                      "rounded-xl border px-3 py-3 text-left transition-[border-color,background-color,transform] duration-200 active:scale-[0.98] " +
                      (active
                        ? "border-iris/60 bg-iris/[0.1] shadow-[0_0_0_3px_rgba(124,108,255,0.12)]"
                        : "border-line bg-elevated/50 hover:border-white/[0.18] hover:bg-elevated")
                    }
                  >
                    <span className={"block text-sm font-medium " + (active ? "text-iris-bright" : "text-ink")}>
                      {opt.label}
                    </span>
                    {opt.hint && <span className="mt-0.5 block text-[11px] text-dim">{opt.hint}</span>}
                  </button>
                );
              })}
            </div>
          </div>
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
                <Skeleton key={i} style={{ aspectRatio: `${dims.w} / ${dims.h}` }} />
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
                    style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
                    className="w-full object-cover"
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
