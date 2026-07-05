"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/marketing/Logo";
import { Badge } from "@/components/ui/Badge";

const nav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/generate/photo",
    label: "Photo Studio",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2.5" y="5" width="15" height="12" rx="2" />
        <circle cx="10" cy="11" r="3" />
        <path d="M7 5l1.2-2h3.6L13 5" />
      </svg>
    ),
  },
  {
    href: "/generate/video",
    label: "Video Studio",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2.5" y="4.5" width="11" height="11" rx="2" />
        <path d="M13.5 8.5l4-2.5v8l-4-2.5" />
      </svg>
    ),
  },
  {
    href: "/competitors",
    label: "Competitor X-Ray",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="9" r="5.5" />
        <path d="M13 13l4.5 4.5" />
      </svg>
    ),
  },
];

interface SidebarProps {
  email: string;
  isDemo: boolean;
  logoutAction: () => Promise<void>;
}

export function Sidebar({ email, isDemo, logoutAction }: SidebarProps) {
  const pathname = usePathname();

  const items = nav.map((item) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-200 [&>svg]:h-[18px] [&>svg]:w-[18px]",
          active
            ? "bg-iris/12 text-iris-bright ring-1 ring-iris/25"
            : "text-muted hover:bg-white/[0.05] hover:text-ink",
        )}
      >
        {item.icon}
        <span className="hidden md:inline">{item.label}</span>
      </Link>
    );
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface/70 backdrop-blur-xl md:flex">
        <div className="px-5 pb-2 pt-5">
          <Logo />
          {isDemo && (
            <Badge tone="warning" className="mt-3">
              Demo mode
            </Badge>
          )}
        </div>
        <nav className="flex-1 space-y-1 px-3 pt-4">{items}</nav>
        <div className="border-t border-line p-4">
          <p className="truncate px-1.5 text-xs text-muted" title={email}>
            {email}
          </p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs text-dim transition-colors duration-200 hover:bg-white/[0.05] hover:text-danger"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 14H3.5A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2H6M10.5 11L14 8l-3.5-3M14 8H6" />
              </svg>
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface/80 px-3 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" aria-label="Dashboard">
          <LogoMark className="h-6 w-6" />
        </Link>
        <nav className="flex items-center gap-1">{items}</nav>
        {isDemo ? <Badge tone="warning">Demo</Badge> : <span className="w-6" />}
      </header>
    </>
  );
}
