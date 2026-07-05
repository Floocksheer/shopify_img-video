import { cookies } from "next/headers";
import { isLive } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/plans";

export const DEMO_COOKIE = "lumora_demo_session";

export interface SessionUser {
  id: string;
  email: string;
  plan: PlanId;
  trialEndsAt: string | null;
  isDemo: boolean;
}

/** Resolve the current user: real Supabase session when live, demo cookie otherwise. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isLive("supabase")) {
    const supabase = createClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, trial_ends_at")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? "",
      plan: (profile?.plan as PlanId) ?? "trial",
      trialEndsAt: profile?.trial_ends_at ?? null,
      isDemo: false,
    };
  }

  // Demo mode: local cookie session
  const cookie = cookies().get(DEMO_COOKIE);
  if (!cookie?.value) return null;
  let email = "demo@lumora.app";
  try {
    email = JSON.parse(cookie.value).email ?? email;
  } catch {
    // legacy/plain cookie value — keep default email
  }
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 5);
  return {
    id: "demo-user",
    email,
    plan: "trial",
    trialEndsAt: trialEnds.toISOString(),
    isDemo: true,
  };
}
