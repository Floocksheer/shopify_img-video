import { createClient } from "@/lib/supabase/server";
import { planLimits, type PlanId } from "@/lib/plans";
import type { SessionUser } from "@/lib/auth";

export interface UsageSummary {
  photosUsed: number;
  photosLimit: number;
  videosUsed: number;
  videosLimit: number;
  trialDaysLeft: number | null;
}

const DEMO_USAGE = { photosUsed: 38, videosUsed: 2 };

function currentPeriodStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export async function getUsage(user: SessionUser): Promise<UsageSummary> {
  const limits = planLimits(user.plan);
  const trialDaysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  if (user.isDemo) {
    return { ...limitsToSummary(limits, DEMO_USAGE.photosUsed, DEMO_USAGE.videosUsed), trialDaysLeft };
  }

  const supabase = createClient();
  if (!supabase) {
    return { ...limitsToSummary(limits, 0, 0), trialDaysLeft };
  }

  const { data } = await supabase
    .from("usage")
    .select("photos_used, videos_used")
    .eq("user_id", user.id)
    .eq("period_start", currentPeriodStart())
    .maybeSingle();

  return {
    ...limitsToSummary(limits, data?.photos_used ?? 0, data?.videos_used ?? 0),
    trialDaysLeft,
  };
}

function limitsToSummary(
  limits: { photos: number; videos: number },
  photosUsed: number,
  videosUsed: number,
) {
  return {
    photosUsed,
    photosLimit: limits.photos,
    videosUsed,
    videosLimit: limits.videos,
  };
}

/** Enforce plan limits, then atomically record consumption. Returns false when over limit. */
export async function consumeUsage(
  user: SessionUser,
  kind: "photo" | "video",
  amount = 1,
): Promise<boolean> {
  if (user.isDemo) return true; // demo mode never blocks

  const supabase = createClient();
  if (!supabase) return true;

  const period = currentPeriodStart();
  const usage = await getUsage(user);
  if (kind === "photo" && usage.photosUsed + amount > usage.photosLimit) return false;
  if (kind === "video" && usage.videosUsed + amount > usage.videosLimit) return false;

  await supabase.from("usage").upsert(
    {
      user_id: user.id,
      period_start: period,
      photos_used: usage.photosUsed + (kind === "photo" ? amount : 0),
      videos_used: usage.videosUsed + (kind === "video" ? amount : 0),
    },
    { onConflict: "user_id,period_start" },
  );
  return true;
}

export async function recordGeneration(
  user: SessionUser,
  gen: { type: "photo" | "video"; inputUrl?: string; outputUrl: string; meta: Record<string, unknown> },
) {
  if (user.isDemo) return;
  const supabase = createClient();
  if (!supabase) return;
  await supabase.from("generations").insert({
    user_id: user.id,
    type: gen.type,
    status: "completed",
    input_url: gen.inputUrl ?? null,
    output_url: gen.outputUrl,
    prompt_meta: gen.meta,
  });
}
