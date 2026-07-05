"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLive } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/auth";

export interface AuthState {
  error?: string;
  message?: string;
}

function setDemoSession(email: string) {
  cookies().set(DEMO_COOKIE, JSON.stringify({ email }), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const plan = String(formData.get("plan") ?? "starter");

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  if (!isLive("supabase")) {
    // Demo mode: local session, skip Stripe
    setDemoSession(email);
    redirect("/dashboard?welcome=1");
  }

  const supabase = createClient()!;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // Card-required trial: hand off to Stripe Checkout when configured
  if (isLive("stripe") && data.user) {
    redirect(`/api/stripe/checkout?plan=${plan}`);
  }
  redirect("/dashboard?welcome=1");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) return { error: "Email and password are required." };

  if (!isLive("supabase")) {
    setDemoSession(email);
    redirect(next);
  }

  const supabase = createClient()!;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  redirect(next);
}

export async function forgotPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  if (!isLive("supabase")) {
    return {
      message:
        "Demo mode: no email service is connected. Connect Supabase to enable password resets.",
    };
  }

  const supabase = createClient()!;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });
  if (error) return { error: error.message };
  return { message: "Check your inbox — we sent a reset link." };
}

export async function logout() {
  if (isLive("supabase")) {
    const supabase = createClient()!;
    await supabase.auth.signOut();
  }
  cookies().delete(DEMO_COOKIE);
  redirect("/");
}
