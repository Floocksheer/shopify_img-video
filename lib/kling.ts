import jwt from "jsonwebtoken";
import { isLive } from "@/lib/env";
import { sleep } from "@/lib/utils";

const KLING_API = "https://api.klingai.com";

const MOTION_PROMPTS: Record<string, string> = {
  orbit:
    "camera slowly orbits around the product, smooth 360 rotation, studio lighting, product stays centered and sharp",
  dolly:
    "slow cinematic dolly-in toward the product, shallow depth of field builds, dramatic reveal, product in crisp focus",
  pan: "smooth lateral camera pan across the product, elegant gliding motion, consistent lighting, premium commercial feel",
};

/** Kling authenticates with a short-lived HS256 JWT built from ak/sk. */
function klingToken() {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iss: process.env.KLING_ACCESS_KEY!, exp: now + 1800, nbf: now - 5 },
    process.env.KLING_SECRET_KEY!,
    { algorithm: "HS256", header: { alg: "HS256", typ: "JWT" } },
  );
}

async function klingFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${KLING_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${klingToken()}`,
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok || json.code !== 0) {
    throw new Error(`Kling API error: ${json.message ?? res.statusText}`);
  }
  return json;
}

/** Submit an image-to-video job and poll until the clip is ready. */
export async function generateProductVideo(opts: {
  imageDataUrl: string;
  motion: string;
}): Promise<{ url: string; durationSeconds: number }> {
  if (!isLive("kling")) throw new Error("Kling is not configured");

  const prompt = MOTION_PROMPTS[opts.motion] ?? MOTION_PROMPTS.orbit;
  const base64 = opts.imageDataUrl.replace(/^data:image\/\w+;base64,/, "");

  const submit = await klingFetch("/v1/videos/image2video", {
    method: "POST",
    body: JSON.stringify({
      model_name: "kling-v1-6",
      image: base64,
      prompt,
      duration: "10",
      mode: "std",
      cfg_scale: 0.5,
    }),
  });

  const taskId = submit.data.task_id as string;

  // Poll up to ~5 minutes
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const status = await klingFetch(`/v1/videos/image2video/${taskId}`);
    const state = status.data.task_status as string;
    if (state === "succeed") {
      const video = status.data.task_result?.videos?.[0];
      if (!video?.url) throw new Error("Kling returned no video URL");
      return { url: video.url, durationSeconds: Number(video.duration ?? 10) };
    }
    if (state === "failed") {
      throw new Error(`Kling generation failed: ${status.data.task_status_msg ?? "unknown"}`);
    }
  }
  throw new Error("Kling generation timed out");
}
