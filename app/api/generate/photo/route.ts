import { NextResponse } from "next/server";
import { isLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import { generateProductPhotos } from "@/lib/fal";
import { demoGeneratePhotos } from "@/lib/demo";
import { consumeUsage, recordGeneration } from "@/lib/usage";

export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { prompt, aspectRatio, quality } = body;
  // Accept a list of source photos; fall back to the legacy single `image`.
  const sources: string[] = Array.isArray(body.images)
    ? body.images.filter((s: unknown): s is string => typeof s === "string" && s.length > 0)
    : body.image
      ? [body.image]
      : [];
  if (sources.length === 0) {
    return NextResponse.json({ error: "Please upload at least one product photo" }, { status: 400 });
  }
  // How many distinct photos to generate (1–4).
  const count = Math.min(6, Math.max(1, Math.round(Number(body.count) || 4)));

  const allowed = await consumeUsage(user, "photo", count);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached this month's photo limit. Upgrade to Pro for 600 photos/month." },
      { status: 402 },
    );
  }

  try {
    let images: string[];
    let demo = false;

    if (isLive("fal")) {
      images = await generateProductPhotos({ imageDataUrls: sources, count, prompt, aspectRatio, quality });
    } else {
      images = await demoGeneratePhotos("studio", count);
      demo = true;
    }

    await Promise.all(
      images.map((url) =>
        recordGeneration(user, { type: "photo", inputUrl: sources[0], outputUrl: url, meta: { prompt } }),
      ),
    );

    return NextResponse.json({ images, demo });
  } catch (e) {
    console.error("photo generation failed:", e);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 },
    );
  }
}
