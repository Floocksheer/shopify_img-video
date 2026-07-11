import { Reveal } from "lumora";

export function FadeUpOnScroll() {
  return (
    <Reveal>
      <div className="glass rounded-card max-w-sm p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-iris-bright">
          Scroll reveal
        </p>
        <p className="mt-3 text-sm leading-body text-muted">
          Any content wrapped in Reveal fades up 24px as it scrolls into view —
          once, respecting reduced-motion preferences.
        </p>
      </div>
    </Reveal>
  );
}
