import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="glow-hero grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-320px] h-[680px] w-[680px] -translate-x-1/2 rounded-full border border-iris/15"
      />
      <div className="relative mb-8">
        <Logo />
      </div>
      <div className="glass-strong relative w-full max-w-md rounded-card p-8 shadow-lift">
        {children}
      </div>
      <p className="relative mt-8 text-xs text-dim">
        <Link href="/" className="transition-colors duration-200 hover:text-muted">
          ← Back to lumora.app
        </Link>
      </p>
    </div>
  );
}
