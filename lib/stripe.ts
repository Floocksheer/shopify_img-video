import Stripe from "stripe";
import { isLive } from "@/lib/env";

export function getStripe(): Stripe | null {
  if (!isLive("stripe")) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
  });
}

/**
 * Checkout session for the 7-day trial: card is collected up front and the
 * subscription auto-charges when the trial ends (per business model).
 */
export async function createTrialCheckout(opts: {
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: opts.customerEmail,
    line_items: [{ price: opts.priceId, quantity: 1 }],
    payment_method_collection: "always",
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: opts.userId },
    },
    metadata: { user_id: opts.userId },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    allow_promotion_codes: true,
  });
}
