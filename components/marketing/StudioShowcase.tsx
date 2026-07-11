"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Lumora Studio hero — implemented from the claude.ai/design screen
 * "Lumora Studio.dc.html": left intro copy, right an auto-playing cinematic
 * product slideshow (Ken Burns), pause on hover, thumbnail selector.
 */

type Transition = "cinematic" | "slide" | "zoom";

interface StudioShowcaseProps {
  /** Seconds between slides. */
  autoplaySeconds?: number;
  transition?: Transition;
  showThumbnails?: boolean;
  /**
   * Internal mini header (wordmark + tagline). Turn off when the screen sits
   * under the site Navbar (e.g. as the homepage hero).
   */
  showHeader?: boolean;
}

const PRODUCTS = [
  {
    name: "Aurea Eau de Parfum",
    cat: "Parfüm",
    url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Meridian Chronograph",
    cat: "Saat",
    url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Nocturne ANC",
    cat: "Kulaklık",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Solis Aviator",
    cat: "Güneş Gözlüğü",
    url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Velo Runner",
    cat: "Sneaker",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop",
  },
];

const EASE = "cubic-bezier(0.22,1,0.36,1)";

const hiddenByMode: Record<Transition, React.CSSProperties> = {
  slide: { opacity: 0, transform: "translateX(8%)" },
  zoom: { opacity: 0, transform: "scale(0.9)" },
  cinematic: { opacity: 0, transform: "scale(1.06)" },
};

function riseIn(delayMs: number): React.CSSProperties {
  return { animation: `fade-up 0.7s ${EASE} ${delayMs}ms both` };
}

export function StudioShowcase({
  autoplaySeconds = 4,
  transition = "cinematic",
  showThumbnails = true,
  showHeader = true,
}: StudioShowcaseProps) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const schedule = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(function tick() {
      if (!pausedRef.current) {
        setIndex((i) => (i + 1) % PRODUCTS.length);
      }
      timerRef.current = setTimeout(tick, autoplaySeconds * 1000);
    }, autoplaySeconds * 1000);
  }, [autoplaySeconds]);

  useEffect(() => {
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [schedule]);

  const select = (i: number) => {
    setIndex(i);
    schedule();
  };

  return (
    <section className="grain relative min-h-screen overflow-hidden bg-night text-ink">
      <div className="glow-hero pointer-events-none absolute inset-0" />

      {showHeader && (
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <span className="font-display text-2xl tracking-display text-ink">
            Lumora
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
            AI Ürün Stüdyosu
          </span>
        </header>
      )}

      <main
        className={cn(
          "relative mx-auto grid max-w-6xl items-center gap-16 px-8 pb-20 md:grid-cols-2",
          showHeader ? "pt-10" : "pt-32",
        )}
      >
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.2em] text-iris-bright"
            style={riseIn(0)}
          >
            Lumora Studio
          </p>
          <h1
            className="mt-4 font-display text-5xl tracking-display text-ink md:text-6xl"
            style={riseIn(120)}
          >
            Her ürün,{" "}
            <em className="text-gradient-iris font-light italic">
              kusursuz bir sahnede
            </em>
          </h1>
          <p
            className="mt-6 max-w-md text-lg leading-body text-muted"
            style={riseIn(240)}
          >
            Parfümden saate — ürünün piksel piksel sabit kalır, sahne saniyeler
            içinde değişir.
          </p>
          <div className="mt-8 flex items-center gap-3" style={riseIn(360)}>
            <Button href="/generate/photo">12 fotoğraf üret</Button>
            <Button variant="ghost" href="/#features">
              Örnekleri incele
            </Button>
          </div>
        </div>

        <div style={{ animation: `fade-up 0.9s ${EASE} 200ms both` }}>
          <div className="animate-floaty">
            <div
              className="relative overflow-hidden rounded-card border border-line shadow-glow"
              style={{ aspectRatio: "4 / 5" }}
              onMouseEnter={() => (pausedRef.current = true)}
              onMouseLeave={() => (pausedRef.current = false)}
            >
              {PRODUCTS.map((p, i) => {
                const active = i === index;
                return (
                  <div
                    key={p.name}
                    className="absolute inset-0"
                    style={{
                      transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                      zIndex: active ? 2 : 1,
                      ...(active
                        ? { opacity: 1, transform: "none" }
                        : hiddenByMode[transition]),
                    }}
                  >
                    <div
                      role="img"
                      aria-label={p.name}
                      className={cn(
                        "h-full w-full bg-cover bg-center",
                        active && transition === "cinematic"
                          ? "animate-kenburns"
                          : "scale-[1.03]",
                      )}
                      style={{ backgroundImage: `url("${p.url}")` }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(6,6,14,0.88), rgba(6,6,14,0) 48%)",
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-iris-bright">
                          {p.cat}
                        </p>
                        <h3 className="mt-1 font-display text-2xl text-ink">
                          {p.name}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-dim">
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(PRODUCTS.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="glass animate-pulse-soft absolute right-4 top-4 z-[3] rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink">
                AI ile üretildi
              </div>
            </div>
          </div>

          {showThumbnails && (
            <div className="mt-6 flex justify-center gap-3">
              {PRODUCTS.map((p, i) => {
                const active = i === index;
                return (
                  <button
                    key={p.name}
                    onClick={() => select(i)}
                    aria-label={p.name}
                    aria-current={active}
                    className={cn(
                      "h-16 w-16 cursor-pointer overflow-hidden rounded-[14px] border-2 p-0 transition-all duration-300",
                      active
                        ? "-translate-y-[3px] border-iris opacity-100 shadow-[0_0_18px_rgba(139,92,246,0.45)]"
                        : "border-white/[0.12] opacity-55 hover:opacity-80",
                    )}
                  >
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${p.url}")` }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </section>
  );
}
