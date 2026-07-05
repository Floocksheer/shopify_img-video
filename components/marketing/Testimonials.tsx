import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const testimonials = [
  {
    quote:
      "I replaced a €400/shoot photographer with Lumora. My conversion rate went up 22% after swapping in the AI studio shots.",
    name: "Elif K.",
    role: "Founder, jewelry store · Istanbul",
    initials: "EK",
  },
  {
    quote:
      "The competitor analysis is unfair. I pasted my biggest rival's store, saw exactly how they light their products, and generated better versions the same afternoon.",
    name: "Marco B.",
    role: "Owner, skincare brand · Milan",
    initials: "MB",
  },
  {
    quote:
      "The 10-second orbit videos doubled the watch time on my product pages. Export to Shopify is genuinely one click — no downloads.",
    name: "Sarah L.",
    role: "E-commerce manager · Berlin",
    initials: "SL",
  },
  {
    quote:
      "We shoot nothing anymore. Every hero image on our store is Lumora-generated and nobody can tell — except our margins.",
    name: "Deniz A.",
    role: "Co-founder, home goods · Izmir",
    initials: "DA",
  },
  {
    quote:
      "Set up on Monday, full catalog refreshed by Wednesday. The seasonal themes alone paid for the year during the holiday rush.",
    name: "Tom H.",
    role: "Shopify Plus merchant · Amsterdam",
    initials: "TH",
  },
  {
    quote:
      "As an agency we manage nine stores. Pro plan API access lets us batch-generate for all of them. Nothing else comes close at €49.",
    name: "Ana R.",
    role: "Agency lead · Lisbon",
    initials: "AR",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="hairline absolute inset-x-8 top-0" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Loved by sellers"
          title={
            <>
              Stores that stopped booking{" "}
              <em className="text-gradient-iris font-light italic">photo shoots.</em>
            </>
          }
        />

        <div className="mt-16 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08} className="break-inside-avoid">
              <Card hover>
                <svg className="h-6 w-6 text-iris/50" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M10 8c-3 .5-5 2.5-5 6v2h5v-6H7.5C8 9 9 8.5 10 8.3V8zm9 0c-3 .5-5 2.5-5 6v2h5v-6h-2.5c.5-1 1.5-1.5 2.5-1.7V8z" />
                </svg>
                <p className="mt-4 text-sm leading-body text-ink/90">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-iris-faint font-mono text-xs text-iris-bright">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-dim">{t.role}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
