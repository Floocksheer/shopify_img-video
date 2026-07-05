import { NextResponse } from "next/server";
import { isLive, appUrl } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import { createTrialCheckout } from "@/lib/stripe";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", appUrl()));

  // Demo mode: skip payment, land on the dashboard
  if (!isLive("stripe") || user.isDemo) {
    return NextResponse.redirect(new URL("/dashboard?welcome=1", appUrl()));
  }

  const plan = new URL(request.url).searchParams.get("plan") === "pro" ? "pro" : "starter";
  const priceId =
    plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_STARTER;

  if (!priceId) {
    console.error(`Missing Stripe price id for plan "${plan}"`);
    return NextResponse.redirect(new URL("/dashboard?billing=unconfigured", appUrl()));
  }

  try {
    const session = await createTrialCheckout({
      customerEmail: user.email,
      priceId,
      userId: user.id,
      successUrl: `${appUrl()}/dashboard?welcome=1`,
      cancelUrl: `${appUrl()}/pricing?checkout=cancelled`,
    });
    return NextResponse.redirect(session.url!);
  } catch (e) {
    console.error("stripe checkout failed:", e);
    return NextResponse.redirect(new URL("/pricing?checkout=error", appUrl()));
  }
}
