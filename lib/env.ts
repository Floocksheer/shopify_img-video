/**
 * Per-service live/demo detection. A service is "live" only when every env
 * key it needs is present; otherwise its API route falls back to the mock
 * implementation in lib/demo. This is the single switch for demo mode.
 */

const has = (...keys: string[]) => keys.every((k) => !!process.env[k]?.trim());

export const services = {
  supabase: () =>
    has("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  stripe: () => has("STRIPE_SECRET_KEY"),
  fal: () => has("FAL_KEY"),
  kling: () => has("KLING_ACCESS_KEY", "KLING_SECRET_KEY"),
  apify: () => has("APIFY_TOKEN"),
  anthropic: () => has("ANTHROPIC_API_KEY"),
  shopify: () => has("SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN"),
} as const;

export type ServiceName = keyof typeof services;

export const isLive = (service: ServiceName) => services[service]();

/** True when any core service is mocked — drives the "Demo mode" badge. */
export const anyDemo = () =>
  (Object.keys(services) as ServiceName[]).some((s) => !isLive(s));

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
