import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const faqs = [
  {
    q: "Do I really only need one photo?",
    a: "Yes. Upload a single photo of your product — even a phone shot — and Lumora generates full sets of studio, lifestyle, outdoor, and seasonal images with your product preserved pixel-perfect.",
  },
  {
    q: "How does the competitor analysis work?",
    a: "Paste any Shopify store URL. Lumora scrapes the store's product imagery, then a vision model analyzes background style, camera angles, composition, and lighting. You get a breakdown of their weaknesses and a one-click button to generate superior versions of the same product category.",
  },
  {
    q: "Why is a credit card required for the free trial?",
    a: "The trial gives you full Starter access for 7 days. Your card is only charged after the trial ends, and you can cancel any time before then in one click — no emails, no calls.",
  },
  {
    q: "How does the Shopify export work?",
    a: "Connect your store once with a private app token. After that, every generated photo exports directly to your Shopify media library through the Admin API — no downloading and re-uploading.",
  },
  {
    q: "Who owns the generated images and videos?",
    a: "You do, fully. Every asset generated on your account is yours to use anywhere — your store, ads, social, marketplaces — forever, even if you cancel.",
  },
  {
    q: "What happens if I hit my monthly limit?",
    a: "Generation pauses and we show exactly where you stand. You can upgrade to Pro instantly or wait for the next cycle — we never silently charge for overages.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="hairline absolute inset-x-8 top-0" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              The questions everyone{" "}
              <em className="text-gradient-iris font-light italic">asks first.</em>
            </>
          }
        />

        <div className="mt-14 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <details className="group glass rounded-2xl transition-colors duration-200 open:bg-white/[0.05] hover:border-white/[0.14]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </summary>
                <p className="px-6 pb-6 text-sm leading-body text-muted">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
