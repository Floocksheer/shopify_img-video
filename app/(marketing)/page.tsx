import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PricingTiers } from "@/components/marketing/PricingTiers";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { SectionHeading } from "@/components/ui/SectionHeading";

const stats = [
  { value: "1 photo", label: "is all you upload" },
  { value: "~40s", label: "average generation time" },
  { value: "15+", label: "background themes" },
  { value: "1 click", label: "to your Shopify store" },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* stats strip */}
      <section className="relative border-y border-line bg-surface/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-4 sm:px-6 md:grid-cols-4 md:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-8 text-center">
              <p className="font-display text-3xl tracking-display text-ink">{s.value}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Features />
      <HowItWorks />

      {/* pricing preview */}
      <section className="relative py-24 sm:py-32">
        <div className="hairline absolute inset-x-8 top-0" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Pricing"
            title={
              <>
                One product photo budget,{" "}
                <em className="text-gradient-iris font-light italic">retired.</em>
              </>
            }
            description="Less than the cost of a single studio hour. Try everything free for 7 days."
          />
          <div className="mt-16">
            <PricingTiers />
          </div>
        </div>
      </section>

      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
