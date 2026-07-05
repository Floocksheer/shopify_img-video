export type PlanId = "trial" | "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number | null;
  photos: number;
  videos: number;
  themes: number | "unlimited";
  features: string[];
  stripePriceEnv?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  trial: {
    id: "trial",
    name: "Free Trial",
    priceMonthly: null,
    photos: 200,
    videos: 5,
    themes: 15,
    features: [
      "7 days, full Starter features",
      "200 AI product photos",
      "5 AI product videos",
      "Credit card required",
      "Auto-converts to Starter after trial",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    photos: 200,
    videos: 5,
    themes: 15,
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    features: [
      "200 AI product photos / month",
      "5 AI product videos / month",
      "15 background themes",
      "One-click Shopify export",
      "Competitor analysis (3 stores / month)",
      "Email support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 49,
    photos: 600,
    videos: 20,
    themes: "unlimited",
    stripePriceEnv: "STRIPE_PRICE_PRO",
    features: [
      "600 AI product photos / month",
      "20 AI product videos / month",
      "Unlimited background themes",
      "Brand kit (colors, props, lighting)",
      "Unlimited competitor analysis",
      "API access",
      "Priority support",
    ],
  },
};

export function planLimits(plan: PlanId) {
  const p = PLANS[plan];
  return { photos: p.photos, videos: p.videos };
}
