import type { Metadata } from "next";
import { PricingTiers } from "@/components/marketing/PricingTiers";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for AI product photos and videos. 7-day free trial, then €19/month. Cancel anytime.",
};

export default function PricingPage() {
  return (
    <>
      <section className="glow-hero grain relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Badge tone="iris">
            <span className="h-1.5 w-1.5 rounded-full bg-iris-bright" />
            7-day free trial on every plan
          </Badge>
          <h1 className="mx-auto mt-6 max-w-2xl font-display text-5xl leading-[1.04] tracking-display text-ink sm:text-6xl">
            Pricing that costs less than{" "}
            <em className="text-gradient-iris font-light italic">one photo shoot.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-body text-muted">
            Every plan starts with a full-featured 7-day trial. Card required,
            charged only when the trial ends — cancel in one click before that.
          </p>
        </div>
        <div className="relative mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <PricingTiers />
        </div>
        <p className="relative mt-10 text-center font-mono text-xs text-dim">
          Prices in EUR, VAT excluded · Secured by Stripe · Cancel anytime
        </p>
      </section>
      <FAQ />
      <CTA />
    </>
  );
}
