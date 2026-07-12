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

  const { image, theme, style, prompt } = await request.json();
  if (!image || !theme) {
    return NextResponse.json({ error: "Missing image or theme" }, { status: 400 });
  }

  const allowed = await consumeUsage(user, "photo", 4);
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
      images = await generateProductPhotos({ imageDataUrl: image, theme, style, count: 4, prompt });
    } else {
      images = await demoGeneratePhotos(theme, 4);
      demo = true;
    }

    await Promise.all(
      images.map((url) =>
        recordGeneration(user, { type: "photo", outputUrl: url, meta: { theme, style } }),
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
