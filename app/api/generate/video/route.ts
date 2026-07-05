import { NextResponse } from "next/server";
import { isLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import { generateProductVideo } from "@/lib/kling";
import { demoGenerateVideo } from "@/lib/demo";
import { consumeUsage, recordGeneration } from "@/lib/usage";

export const maxDuration = 300;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { image, motion } = await request.json();
  if (!image || !motion) {
    return NextResponse.json({ error: "Missing image or motion style" }, { status: 400 });
  }

  const allowed = await consumeUsage(user, "video");
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached this month's video limit. Upgrade to Pro for 20 videos/month." },
      { status: 402 },
    );
  }

  try {
    let result: { url: string; durationSeconds: number };
    let demo = false;

    if (isLive("kling")) {
      result = await generateProductVideo({ imageDataUrl: image, motion });
    } else {
      result = await demoGenerateVideo(motion);
      demo = true;
    }

    await recordGeneration(user, {
      type: "video",
      outputUrl: result.url,
      meta: { motion, duration: result.durationSeconds },
    });

    return NextResponse.json({ url: result.url, demo });
  } catch (e) {
    console.error("video generation failed:", e);
    return NextResponse.json(
      { error: "Video generation failed. Please try again." },
      { status: 500 },
    );
  }
}
