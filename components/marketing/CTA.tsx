import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CTA() {
  return (
    <section className="relative px-4 pb-28 pt-4 sm:px-6">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glow-hero grain relative overflow-hidden rounded-[2rem] border border-iris/25 bg-elevated px-6 py-20 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-380px] h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-iris/20"
          />
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-[1.08] tracking-display text-ink sm:text-6xl">
            Your next bestseller deserves{" "}
            <em className="text-gradient-iris font-light italic">better photos.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-body text-muted">
            Start your 7-day free trial. Generate your first studio set in the
            next five minutes.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" href="/signup">
              Start free trial
            </Button>
            <Button variant="secondary" size="lg" href="/pricing">
              View pricing
            </Button>
          </div>
          <p className="mt-5 font-mono text-xs text-dim">
            No commitment · cancel in one click
          </p>
        </div>
      </Reveal>
    </section>
  );
}
