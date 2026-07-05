import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    n: "1",
    title: "Upload one photo",
    body: "Any photo works — even one taken on your phone against a messy desk. Lumora isolates your product automatically.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 16V4m0 0L7 9m5-5l5 5" />
        <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
      </svg>
    ),
  },
  {
    n: "2",
    title: "Pick a scene & style",
    body: "Choose from studio, lifestyle, outdoor, or seasonal themes — or generate a 10-second orbit, dolly, or pan video instead.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M17.5 14v7M14 17.5h7" />
      </svg>
    ),
  },
  {
    n: "3",
    title: "Export to Shopify",
    body: "Generated assets land directly in your store's media library. Attach them to products and publish — done in minutes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="hairline absolute inset-x-8 top-0" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From phone photo to storefront,{" "}
              <em className="text-gradient-iris font-light italic">in three steps.</em>
            </>
          }
        />

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          {/* connecting line */}
          <div className="hairline absolute left-[16%] right-[16%] top-7 hidden md:block" />

          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12} className="relative text-center md:px-4">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-iris-bright shadow-card ring-1 ring-iris/30 [&>svg]:h-6 [&>svg]:w-6">
                {s.icon}
              </div>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.24em] text-dim">
                Step {s.n}
              </p>
              <h3 className="mt-2 font-display text-2xl tracking-display text-ink">
                {s.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-body text-muted">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
