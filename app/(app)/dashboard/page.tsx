import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { createClient } from "@/lib/supabase/server";
import { DEMO_RECENT_GENERATIONS } from "@/lib/demo";
import type { GenerationRecord } from "@/lib/history";
import { StatCard } from "@/components/app/StatCard";
import { GenerationGrid } from "@/components/app/GenerationGrid";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Dashboard" };

const quickActions = [
  {
    href: "/generate/photo",
    title: "Generate photos",
    body: "Studio, lifestyle, outdoor & seasonal sets",
    accent: "📸",
  },
  {
    href: "/generate/video",
    title: "Generate a video",
    body: "10-second orbit, dolly-in, or pan clips",
    accent: "🎬",
  },
  {
    href: "/competitors",
    title: "X-ray a competitor",
    body: "Scrape & analyze any Shopify store",
    accent: "🔍",
  },
];

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const usage = await getUsage(user);

  let recent: GenerationRecord[] = [];
  if (user.isDemo) {
    recent = DEMO_RECENT_GENERATIONS;
  } else {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("generations")
        .select("id, type, output_url, prompt_meta, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      recent = (data ?? []).map((g) => ({
        id: g.id,
        type: g.type,
        url: g.output_url,
        theme: (g.prompt_meta as { theme?: string })?.theme ?? "Custom",
        createdAt: g.created_at,
      }));
    }
  }

  return (
    <div className="animate-fade-up">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-display text-ink">
          Good to see you<em className="text-gradient-iris font-light italic">.</em>
        </h1>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Photos this month"
          value={`${usage.photosUsed}`}
          sub={`of ${usage.photosLimit} included`}
          progress={usage.photosUsed / usage.photosLimit}
        />
        <StatCard
          label="Videos this month"
          value={`${usage.videosUsed}`}
          sub={`of ${usage.videosLimit} included`}
          progress={usage.videosUsed / usage.videosLimit}
        />
        <StatCard
          label="Trial remaining"
          value={usage.trialDaysLeft !== null ? `${usage.trialDaysLeft}d` : "—"}
          sub={
            usage.trialDaysLeft !== null
              ? "then Starter · €19/mo"
              : `${user.plan} plan active`
          }
          progress={usage.trialDaysLeft !== null ? usage.trialDaysLeft / 7 : undefined}
          tone="warning"
        />
      </div>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="group">
              <Card hover className="flex h-full items-start gap-4 p-5">
                <span className="text-2xl" aria-hidden>
                  {a.accent}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink transition-colors duration-200 group-hover:text-iris-bright">
                    {a.title} →
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {a.body}
                  </span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
          Recent generations
        </h2>
        <div className="mt-4">
          <GenerationGrid initial={recent} />
        </div>
      </section>
    </div>
  );
}
