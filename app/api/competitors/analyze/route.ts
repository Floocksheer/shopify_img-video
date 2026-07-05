import { NextResponse } from "next/server";
import { isLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import { scrapeShopifyStore } from "@/lib/apify";
import { analyzeCompetitorImages } from "@/lib/claude";
import { demoScrapeCompetitor, demoAnalyzeImages } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 180;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { query } = await request.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "Enter a store URL or keyword" }, { status: 400 });
  }

  try {
    // 1) scrape the competitor catalog
    const scraped = isLive("apify")
      ? await scrapeShopifyStore(normalizeStoreUrl(query))
      : await demoScrapeCompetitor(query);

    if (!scraped.products.length) {
      return NextResponse.json(
        { error: "No products found at that store. Check the URL and try again." },
        { status: 404 },
      );
    }

    // 2) vision analysis of their imagery
    const analysis = isLive("anthropic")
      ? await analyzeCompetitorImages(scraped.products.map((p) => p.image))
      : await demoAnalyzeImages();

    // 3) persist when a database is connected
    if (!user.isDemo) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("competitor_analyses").insert({
          user_id: user.id,
          store_url: scraped.store,
          images: scraped.products,
          analysis,
        });
      }
    }

    return NextResponse.json({
      products: scraped.products,
      analysis,
      demo: !isLive("apify") || !isLive("anthropic"),
    });
  } catch (e) {
    console.error("competitor analysis failed:", e);
    return NextResponse.json(
      { error: "Analysis failed. Please check the store URL and try again." },
      { status: 500 },
    );
  }
}

function normalizeStoreUrl(input: string) {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(".")) return `https://${trimmed}`;
  // keyword → treat as a myshopify search seed
  return `https://www.google.com/search?q=${encodeURIComponent(`${trimmed} site:myshopify.com`)}`;
}
