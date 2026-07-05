import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/marketing/Logo";

export default function NotFound() {
  return (
    <div className="glow-hero grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <Logo />
      <p className="mt-10 font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
        404
      </p>
      <h1 className="mt-4 font-display text-5xl tracking-display text-ink sm:text-6xl">
        This shot doesn&apos;t <em className="text-gradient-iris font-light italic">exist.</em>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-body text-muted">
        The page you&apos;re looking for was never generated. Let&apos;s get you
        back to something photogenic.
      </p>
      <div className="mt-8">
        <Button href="/">← Back home</Button>
      </div>
    </div>
  );
}
