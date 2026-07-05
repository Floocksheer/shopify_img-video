# Lumora

Dark-themed AI product photography & video SaaS for Shopify sellers.
Upload one product photo → get studio-grade image sets and 10-second videos,
X-ray competitor stores, and export everything straight into Shopify.

## Stack

- **Next.js 14** (App Router) · TypeScript · Tailwind CSS · framer-motion
- **Supabase** — auth + Postgres (schema in `supabase/schema.sql`)
- **Stripe** — subscriptions with card-required 7-day trial
- **fal.ai Flux** — image generation · **Kling** — video generation
- **Apify** — Shopify store scraping · **Claude Vision** — style analysis
- **Shopify Admin API** — one-click export to the store media library

## Run it now (demo mode)

```bash
npm install
npm run dev        # http://localhost:3000
```

With no API keys configured, **every service runs in demo mode**: signup
creates a local session, generators return curated sample output with real
loading states, and the UI shows a "Demo mode" badge. The full product is
clickable end-to-end out of the box.

## Go-live checklist

Copy `.env.example` to `.env.local`, then work through it — each service
switches from demo to live independently the moment its keys are present.

1. **Supabase** — create a project, run `supabase/schema.sql` in the SQL
   editor, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.
2. **Stripe** — create two recurring prices (Starter €19/mo, Pro €49/mo), set
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`. Add a
   webhook endpoint `https://<your-domain>/api/stripe/webhook` with events
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, and set `STRIPE_WEBHOOK_SECRET`.
   Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. **fal.ai** — create a key at fal.ai/dashboard/keys → `FAL_KEY`.
4. **Kling** — get an access key pair → `KLING_ACCESS_KEY`, `KLING_SECRET_KEY`.
5. **Apify** — account token → `APIFY_TOKEN`.
6. **Anthropic** — API key → `ANTHROPIC_API_KEY`.
7. **Shopify** — create a custom app in your store admin with
   `write_files` scope → `SHOPIFY_STORE_DOMAIN` (e.g. `mystore.myshopify.com`)
   and `SHOPIFY_ADMIN_ACCESS_TOKEN`.
8. Set `NEXT_PUBLIC_APP_URL` to your production URL and deploy
   (`npm run build` — Vercel works zero-config).

## Project map

```
app/(marketing)/   landing + pricing        app/api/generate/*    fal.ai / Kling
app/(auth)/        signup, login, reset     app/api/competitors/  Apify + Claude
app/(app)/         dashboard + 3 tools      app/api/stripe/       checkout + webhook
components/        ui / marketing / app     app/api/shopify/      media export
lib/               service clients, demo mocks, usage limits, auth
supabase/          schema.sql (tables + RLS + signup trigger)
```

## Dev utilities

- `npm run typecheck` — strict TS pass
- `node screenshot.mjs http://localhost:3000 [label] [--mobile]` — full-page
  Puppeteer screenshot into `temporary screenshots/`
