import { NextResponse } from "next/server";
import { isLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import { generateProductVideo } from "@/lib/fal";
import { demoGenerateVideo } from "@/lib/demo";
import { consumeUsage, recordGeneration } from "@/lib/usage";

export const maxDuration = 300;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { prompt, duration, resolution } = body;
  // All uploaded photos are fused into ONE video by the reference-to-video
  // model. Accept a list; fall back to the legacy single `image`. Pixverse C1
  // accepts up to 7 reference images.
  const MAX_PHOTOS = 7;
  const sources: string[] = (
    Array.isArray(body.images)
      ? body.images.filter((s: unknown): s is string => typeof s === "string" && s.length > 0)
      : body.image
        ? [body.image]
        : []
  ).slice(0, MAX_PHOTOS);
  if (sources.length === 0) {
    return NextResponse.json({ error: "Please upload at least one product photo" }, { status: 400 });
  }
  const durationSeconds = [5, 10, 15].includes(Number(duration)) ? Number(duration) : 5;
  const videoResolution = resolution === "1080p" ? "1080p" : "720p";

  // One generation = one video = one credit, regardless of how many photos.
  const allowed = await consumeUsage(user, "video", 1);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached this month's video limit. Upgrade to Pro for 20 videos/month." },
      { status: 402 },
    );
  }

  try {
    let result: { url: string; durationSeconds: number; enhanceError?: boolean };
    let demo = false;

    if (isLive("fal")) {
      result = await generateProductVideo({
        imageDataUrls: sources,
        prompt,
        durationSeconds,
        resolution: videoResolution,
      });
    } else {
      result = await demoGenerateVideo("");
      demo = true;
    }

    await recordGeneration(user, {
      type: "video",
      inputUrl: sources[0],
      outputUrl: result.url,
      meta: { prompt, duration: result.durationSeconds, photos: sources.length },
    });

    return NextResponse.json({ url: result.url, demo, geminiError: !!result.enhanceError });
  } catch (e) {
    console.error("video generation failed:", e);
    return NextResponse.json(
      { error: "Video generation failed. Please try again." },
      { status: 500 },
    );
  }
}
