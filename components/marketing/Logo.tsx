import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-7 w-7", className)} aria-hidden>
      <defs>
        <linearGradient id="lumora-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9284FF" />
          <stop offset="1" stopColor="#5847E8" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="28" r="16" fill="none" stroke="url(#lumora-g)" strokeWidth="4" />
      <circle cx="32" cy="28" r="6.5" fill="url(#lumora-g)" />
      <path d="M18 52h28" stroke="url(#lumora-g)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Lumora home"
    >
      <LogoMark className="transition-transform duration-300 ease-out group-hover:-rotate-12" />
      <span className="font-display text-[22px] tracking-display text-ink">
        Lumora
      </span>
    </Link>
  );
}
