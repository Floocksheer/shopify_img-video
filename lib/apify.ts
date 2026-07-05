import { ApifyClient } from "apify-client";
import { isLive } from "@/lib/env";

export interface ScrapedProduct {
  title: string;
  image: string;
  price: string;
}

/** Run the Shopify scraper actor against a store URL and collect products. */
export async function scrapeShopifyStore(storeUrl: string): Promise<{
  store: string;
  products: ScrapedProduct[];
}> {
  if (!isLive("apify")) throw new Error("Apify is not configured");
  const client = new ApifyClient({ token: process.env.APIFY_TOKEN! });

  const run = await client.actor("pocesar/shopify-scraper").call(
    { startUrls: [{ url: storeUrl }], maxRequestsPerCrawl: 30 },
    { waitSecs: 120 },
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 12 });

  const products: ScrapedProduct[] = items
    .map((item) => {
      const it = item as Record<string, unknown>;
      const images = it.images as { src?: string }[] | undefined;
      const variants = it.variants as { price?: string }[] | undefined;
      return {
        title: String(it.title ?? "Untitled product"),
        image: images?.[0]?.src ?? "",
        price: variants?.[0]?.price ? `€${variants[0].price}` : "",
      };
    })
    .filter((p) => p.image);

  return { store: storeUrl, products };
}
