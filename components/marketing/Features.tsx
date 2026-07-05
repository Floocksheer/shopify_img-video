import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

const features = [
  {
    eyebrow: "01 · AI Photos",
    title: "Studio-grade photos from a single upload",
    body: "Drop in one phone photo. Get back a full set of professional shots — studio white, lifestyle scenes, outdoor light, seasonal campaigns — with your product perfectly preserved.",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
    tags: ["Studio", "Lifestyle", "Outdoor", "Seasonal"],
    wide: true,
  },
  {
    eyebrow: "02 · AI Video",
    title: "10-second clips that stop the scroll",
    body: "Turn any product photo into a cinematic clip — slow orbit, dolly-in, or a smooth pan. Made for reels, ads, and product pages.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    tags: ["Slow orbit", "Dolly-in", "Pan"],
    video: true,
  },
  {
    eyebrow: "03 · Competitor X-Ray",
    title: "See exactly how rivals shoot — then beat them",
    body: "Paste any Shopify store URL. Lumora scrapes their product imagery, runs a vision analysis of angles, lighting, and composition — and generates superior versions for you.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    tags: ["Apify scrape", "Claude Vision", "One-click counter"],
  },
  {
    eyebrow: "04 · Shopify Native",
    title: "One click, straight into your store",
    body: "No downloads, no re-uploads. Every generated asset exports directly to your Shopify media library through the Admin API.",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
    tags: ["Admin API", "Media library", "Zero friction"],
    wide: true,
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="What Lumora does"
          title={
            <>
              Two generators. One spy.{" "}
              <em className="text-gradient-iris font-light italic">Zero photographers.</em>
            </>
          }
          description="Lumora does exactly four things, and does them exceptionally well. No feature bloat — just the visuals your store needs to convert."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-5">
          {features.map((f, i) => (
            <Reveal
              key={f.eyebrow}
              delay={i * 0.08}
              className={f.wide ? "md:col-span-3" : "md:col-span-2"}
            >
              <Card hover className="group flex h-full flex-col overflow-hidden p-0">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={f.image}
                    alt={f.title}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-night/30 to-transparent" />
                  <div className="absolute inset-0 bg-iris/10 mix-blend-multiply" />
                  {f.video && (
                    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <svg width="15" height="15" viewBox="0 0 14 14" fill="#F2F1F7" aria-hidden>
                        <path d="M4 2.5v9l7-4.5-7-4.5z" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iris-bright">
                    {f.eyebrow}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-snug tracking-display text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-body text-muted">{f.body}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {f.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
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
