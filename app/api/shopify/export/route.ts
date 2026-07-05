import { NextResponse } from "next/server";
import { isLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import { exportImageToShopify } from "@/lib/shopify";
import { demoShopifyExport } from "@/lib/demo";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { imageUrl, filename } = await request.json();
  if (!imageUrl) return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });

  try {
    const result = isLive("shopify")
      ? await exportImageToShopify({ imageUrl, filename: filename ?? "lumora-export.jpg" })
      : await demoShopifyExport(imageUrl);
    return NextResponse.json({ ...result, demo: !isLive("shopify") });
  } catch (e) {
    console.error("shopify export failed:", e);
    return NextResponse.json({ error: "Export failed. Check your Shopify connection." }, { status: 500 });
  }
}
