"use client";

import Image from "next/image";
import { useState } from "react";
import { UploadDropzone } from "@/components/app/UploadDropzone";
import { OptionPicker } from "@/components/app/OptionPicker";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { addToHistory } from "@/lib/history";

const THEMES = [
  { id: "studio", label: "Studio", hint: "Clean white, softbox light" },
  { id: "lifestyle", label: "Lifestyle", hint: "Styled interiors" },
  { id: "outdoor", label: "Outdoor", hint: "Golden hour, nature" },
  { id: "seasonal", label: "Seasonal", hint: "Holiday campaigns" },
];

const STYLES = [
  { id: "minimal", label: "Minimal", hint: "Negative space" },
  { id: "vibrant", label: "Vibrant", hint: "Bold color" },
  { id: "moody", label: "Moody", hint: "Deep shadows" },
  { id: "soft", label: "Soft", hint: "Airy pastels" },
];

type ExportState = "idle" | "exporting" | "done" | "error";

export default function PhotoGeneratorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("studio");
  const [style, setStyle] = useState("minimal");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [exports, setExports] = useState<Record<number, ExportState>>({});

  async function generate() {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setExports({});
    try {
      const res = await fetch("/api/generate/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, theme, style, prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      setResults(json.images);
      setDemo(!!json.demo);
      const themeLabel = THEMES.find((t) => t.id === theme)?.label ?? theme;
      addToHistory(
        (json.images as string[]).map((url, i) => ({
          id: `${Date.now()}-${i}`,
          type: "photo" as const,
          url,
          theme: themeLabel,
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
        body: JSON.stringify({ imageUrl: url, filename: `lumora-${theme}-${index + 1}.jpg` }),
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
            One photo in, <em className="text-gradient-iris font-light italic">four out.</em>
          </h1>
        </div>
        {demo && <Badge tone="warning">Demo output</Badge>}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* controls */}
        <div className="space-y-7">
          <UploadDropzone image={image} onImage={setImage} />
          <Textarea
            label="Prompt (optional)"
            hint="Describe the scene you want. Leave blank to use the theme & style below."
            placeholder="e.g. perfume bottle on a marble table beside fresh flowers, soft morning light"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <OptionPicker label="Background theme" options={THEMES} value={theme} onChange={setTheme} columns={2} />
          <OptionPicker label="Style" options={STYLES} value={style} onChange={setStyle} columns={2} />
          <Button className="w-full" size="lg" disabled={!image || loading} onClick={generate}>
            {loading ? "Generating…" : "Generate 4 photos"}
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
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-[4/5]" />
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
                    className="aspect-[4/5] w-full object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-night/85 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    <a
                      href={url}
                      download={`lumora-${theme}-${i + 1}.jpg`}
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
                Upload a product photo, pick a theme and style, and generate
                four studio-grade variations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
