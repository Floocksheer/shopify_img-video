"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const collage = [
  {
    src: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=640&q=80",
    label: "Studio · Perfume",
    rotate: -6,
    y: 26,
    z: 10,
  },
  {
    src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=640&q=80",
    label: "Lifestyle · Skincare",
    rotate: 3,
    y: -10,
    z: 20,
  },
  {
    src: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=640&q=80",
    label: "10s Orbit · Sneaker",
    rotate: -2,
    y: 12,
    z: 30,
    video: true,
  },
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&q=80",
    label: "Studio · Watch",
    rotate: 5,
    y: -18,
    z: 20,
  },
  {
    src: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=640&q=80",
    label: "Seasonal · Fragrance",
    rotate: 8,
    y: 30,
    z: 10,
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  // duration/delay helpers: collapse to 0 under prefers-reduced-motion so
  // SSR'd hidden styles are always overwritten on hydration
  const dur = (d: number) => (reduce ? 0 : d);

  return (
    <section className="glow-hero grain relative overflow-hidden pb-20 pt-36 sm:pt-44">
      {/* faint orbit ring decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-320px] h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-iris/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[600px] w-[600px] -translate-x-1/2 rounded-full border border-iris/10"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: dur(0.12) } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: dur(0.7), ease } } }}
          >
            <Badge tone="iris">
              <span className="h-1.5 w-1.5 rounded-full bg-iris-bright" />
              Built for Shopify sellers
            </Badge>
          </motion.div>

          <motion.h1
            className="mt-6 font-display text-5xl leading-[1.04] tracking-display text-ink sm:text-6xl md:text-7xl"
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: dur(0.8), ease } } }}
          >
            Product photos that sell.
            <br />
            <em className="text-gradient-iris font-light italic">
              Videos that stop the scroll.
            </em>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-base leading-body text-muted sm:text-lg"
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: dur(0.7), ease } } }}
          >
            Upload one product photo. Lumora generates studio-grade images and
            10-second videos, analyzes what your competitors are doing — and
            exports everything straight into your Shopify store.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: dur(0.7), ease } } }}
          >
            <Button size="lg" href="/signup">
              Start free trial
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Button>
            <Button variant="secondary" size="lg" href="/#how-it-works">
              See how it works
            </Button>
          </motion.div>

          <motion.p
            className="mt-5 font-mono text-xs tracking-wide text-dim"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: dur(0.7) } } }}
          >
            7-day free trial · then €19/mo · cancel anytime
          </motion.p>
        </motion.div>

        {/* overlapping collage */}
        <div className="mt-16 flex items-center justify-center sm:mt-20">
          <div className="flex w-full max-w-4xl items-center justify-center -space-x-8 sm:-space-x-6">
            {collage.map((card, i) => (
              <motion.figure
                key={card.label}
                className="group relative w-[30%] min-w-[150px] shrink-0 sm:w-[21%]"
                style={{ zIndex: card.z, rotate: card.rotate, y: card.y }}
                initial={{ opacity: 0, y: card.y + 40 }}
                animate={{ opacity: 1, y: card.y }}
                transition={{ duration: dur(0.9), delay: dur(0.5 + i * 0.09), ease }}
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lift transition-transform duration-300 ease-out group-hover:-translate-y-2">
                  <Image
                    src={card.src}
                    alt={card.label}
                    width={320}
                    height={400}
                    className="aspect-[4/5] w-full object-cover"
                    priority={i < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-iris/15 mix-blend-multiply" />
                  {card.video && (
                    <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 backdrop-blur-sm">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="#F2F1F7" aria-hidden>
                        <path d="M4 2.5v9l7-4.5-7-4.5z" />
                      </svg>
                    </span>
                  )}
                  <figcaption className="absolute bottom-2.5 left-3 font-mono text-[10px] uppercase tracking-widest text-ink/90">
                    {card.label}
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
