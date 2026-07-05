import { sleep } from "@/lib/utils";

/**
 * Mock implementations used whenever a service's API keys are absent.
 * They simulate realistic latency so loading states are exercised, and
 * return curated stock imagery in place of generated assets.
 */

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const DEMO_PHOTO_POOL: Record<string, string[]> = {
  studio: [
    u("photo-1523275335684-37898b6baf30"),
    u("photo-1505740420928-5e560c06d30e"),
    u("photo-1560343090-f0409e92791a"),
    u("photo-1526170375885-4d8ecf77b99f"),
  ],
  lifestyle: [
    u("photo-1542291026-7eec264c27ff"),
    u("photo-1571781926291-c477ebfd024b"),
    u("photo-1585386959984-a4155224a1ad"),
    u("photo-1600185365483-26d7a4cc7519"),
  ],
  outdoor: [
    u("photo-1600185365483-26d7a4cc7519"),
    u("photo-1542291026-7eec264c27ff"),
    u("photo-1523275335684-37898b6baf30"),
    u("photo-1560343090-f0409e92791a"),
  ],
  seasonal: [
    u("photo-1585386959984-a4155224a1ad"),
    u("photo-1571781926291-c477ebfd024b"),
    u("photo-1505740420928-5e560c06d30e"),
    u("photo-1526170375885-4d8ecf77b99f"),
  ],
};

export async function demoGeneratePhotos(theme: string, count = 4) {
  await sleep(2600 + Math.random() * 1200);
  const pool = DEMO_PHOTO_POOL[theme] ?? DEMO_PHOTO_POOL.studio;
  return pool.slice(0, count);
}

export async function demoGenerateVideo(_motion: string) {
  await sleep(3800 + Math.random() * 1500);
  return {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    durationSeconds: 10,
  };
}

export async function demoScrapeCompetitor(storeUrl: string) {
  await sleep(2200 + Math.random() * 800);
  return {
    store: storeUrl || "demo-rival-store.myshopify.com",
    products: [
      { title: "Aurelia Face Serum 30ml", image: u("photo-1620916566398-39f1143ab7be", 700), price: "€34.00" },
      { title: "Velvet Matte Lip Kit", image: u("photo-1586495777744-4413f21062fa", 700), price: "€22.00" },
      { title: "Botanic Body Oil", image: u("photo-1608248543803-ba4f8c70ae0b", 700), price: "€28.00" },
      { title: "Ceramic Diffuser Set", image: u("photo-1602143407151-7111542de6e8", 700), price: "€45.00" },
      { title: "Silk Cleansing Balm", image: u("photo-1571781926291-c477ebfd024b", 700), price: "€26.00" },
      { title: "Midnight Recovery Cream", image: u("photo-1556228720-195a672e8a03", 700), price: "€38.00" },
    ],
  };
}

export async function demoAnalyzeImages() {
  await sleep(3000 + Math.random() * 1000);
  return {
    summary:
      "This store leans on soft-daylight lifestyle photography with warm neutral backdrops. Products are consistently shot at eye level with shallow depth of field, and every hero image includes an organic prop (linen, stone, botanicals) to signal a premium natural-beauty position.",
    background_style: "Warm beige and stone textures, diffused natural window light, minimal props",
    camera_angle: "Eye-level, 45° three-quarter views on secondary shots",
    composition: "Rule-of-thirds with generous negative space top-right; product occupies ~40% of frame",
    lighting: "Soft directional daylight from camera-left, gentle shadows, no hard speculars",
    color_palette: ["#E8DFD3", "#C9B8A3", "#8A7B6A", "#F5F1EA"],
    weaknesses: [
      "No pure-white studio shots for marketplace listings",
      "Inconsistent shadow direction across the catalog",
      "No video or motion content on product pages",
    ],
    opportunities: [
      "Generate clean studio versions for ads and marketplaces",
      "Add 10-second orbit videos — none of their catalog has motion",
      "Unify lighting direction across all hero images",
    ],
  };
}

export async function demoShopifyExport(_imageUrl: string) {
  await sleep(1400);
  return { ok: true, mediaId: `demo-media-${Date.now()}` };
}

/** Seed generations shown on a fresh demo dashboard. */
export const DEMO_RECENT_GENERATIONS = [
  { id: "d1", type: "photo" as const, url: u("photo-1523275335684-37898b6baf30", 600), theme: "Studio", createdAt: "2026-07-04T10:12:00Z" },
  { id: "d2", type: "photo" as const, url: u("photo-1542291026-7eec264c27ff", 600), theme: "Lifestyle", createdAt: "2026-07-04T09:48:00Z" },
  { id: "d3", type: "video" as const, url: u("photo-1505740420928-5e560c06d30e", 600), theme: "Slow orbit", createdAt: "2026-07-03T18:22:00Z" },
  { id: "d4", type: "photo" as const, url: u("photo-1560343090-f0409e92791a", 600), theme: "Studio", createdAt: "2026-07-03T14:05:00Z" },
  { id: "d5", type: "photo" as const, url: u("photo-1585386959984-a4155224a1ad", 600), theme: "Seasonal", createdAt: "2026-07-02T11:30:00Z" },
  { id: "d6", type: "video" as const, url: u("photo-1526170375885-4d8ecf77b99f", 600), theme: "Dolly-in", createdAt: "2026-07-01T16:41:00Z" },
];
