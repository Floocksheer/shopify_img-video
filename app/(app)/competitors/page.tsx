"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface Product {
  title: string;
  image: string;
  price: string;
}

interface Analysis {
  summary: string;
  background_style: string;
  camera_angle: string;
  composition: string;
  lighting: string;
  color_palette: string[];
  weaknesses: string[];
  opportunities: string[];
}

type Phase = "idle" | "scraping" | "analyzing" | "done";

export default function CompetitorsPage() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [products, setProducts] = useState<Product[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setProducts([]);
    setAnalysis(null);
    setPhase("scraping");
    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setProducts(json.products);
      setDemo(!!json.demo);
      setPhase("analyzing");
      // brief beat so the two phases read distinctly
      await new Promise((r) => setTimeout(r, 600));
      setAnalysis(json.analysis);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setPhase("idle");
    }
  }

  const traits: { label: string; value: string }[] = analysis
    ? [
        { label: "Background", value: analysis.background_style },
        { label: "Camera angle", value: analysis.camera_angle },
        { label: "Composition", value: analysis.composition },
        { label: "Lighting", value: analysis.lighting },
      ]
    : [];

  return (
    <div className="animate-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
            Competitor X-Ray
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-display text-ink">
            See how rivals shoot<em className="text-gradient-iris font-light italic">, then beat them.</em>
          </h1>
        </div>
        {demo && <Badge tone="warning">Demo output</Badge>}
      </header>

      <form onSubmit={analyze} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Input
          id="store-url"
          placeholder="rival-store.myshopify.com — or a product keyword"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          aria-label="Competitor store URL or keyword"
        />
        <Button type="submit" disabled={phase === "scraping" || phase === "analyzing" || !query.trim()}>
          {phase === "scraping" ? "Scraping store…" : phase === "analyzing" ? "Analyzing…" : "Run X-Ray"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* scraped products */}
      {(phase === "scraping" || products.length > 0) && (
        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
            Their catalog
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {phase === "scraping"
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
              : products.map((p) => (
                  <figure
                    key={p.title}
                    className="group relative animate-fade-in overflow-hidden rounded-xl border border-line"
                  >
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={300}
                      height={400}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent to-transparent" />
                    <figcaption className="absolute inset-x-2.5 bottom-2">
                      <p className="truncate text-[11px] font-medium text-ink">{p.title}</p>
                      <p className="font-mono text-[10px] text-muted">{p.price}</p>
                    </figcaption>
                  </figure>
                ))}
          </div>
        </section>
      )}

      {/* analysis */}
      {phase === "analyzing" && (
        <section className="mt-10 space-y-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </section>
      )}

      {analysis && phase === "done" && (
        <section className="mt-10 animate-fade-up space-y-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
            Vision analysis
          </h2>

          <Card className="border-iris/25">
            <p className="text-sm leading-body text-ink/90">{analysis.summary}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
                Their palette
              </span>
              {analysis.color_palette.map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full border border-white/20"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {traits.map((t) => (
              <Card key={t.label} className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iris-bright">
                  {t.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-danger">
                Their weaknesses
              </p>
              <ul className="mt-3 space-y-2">
                {analysis.weaknesses.map((w) => (
                  <li key={w} className="flex gap-2 text-sm leading-relaxed text-muted">
                    <span className="text-danger" aria-hidden>×</span>
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-success">
                Your openings
              </p>
              <ul className="mt-3 space-y-2">
                {analysis.opportunities.map((o) => (
                  <li key={o} className="flex gap-2 text-sm leading-relaxed text-muted">
                    <span className="text-success" aria-hidden>✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="glass flex flex-col items-center gap-4 rounded-card border-iris/25 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-display text-2xl tracking-display text-ink">
                Now generate the <em className="text-gradient-iris font-light italic">better version.</em>
              </p>
              <p className="mt-1 text-sm text-muted">
                Take these insights to the Photo Studio and out-shoot them.
              </p>
            </div>
            <Link
              href="/generate/photo"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-iris px-6 text-sm font-medium text-night shadow-button transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-iris-bright active:scale-[0.97]"
            >
              Generate better version →
            </Link>
          </div>
        </section>
      )}

      {phase === "idle" && products.length === 0 && !error && (
        <div className="glass mt-10 flex min-h-[280px] flex-col items-center justify-center rounded-card p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-iris/10 text-2xl ring-1 ring-iris/20" aria-hidden>
            🔍
          </span>
          <p className="mt-5 font-display text-2xl tracking-display text-muted">
            Paste a rival&apos;s store URL
          </p>
          <p className="mt-2 max-w-sm text-sm leading-body text-dim">
            Lumora scrapes their product imagery, breaks down their photography
            style with AI vision, and shows you exactly where to beat them.
          </p>
        </div>
      )}
    </div>
  );
}
