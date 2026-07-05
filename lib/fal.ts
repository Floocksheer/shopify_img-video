import { fal } from "@fal-ai/client";
import { isLive } from "@/lib/env";

const THEME_PROMPTS: Record<string, string> = {
  studio:
    "professional studio product photography, seamless white background, softbox lighting, crisp reflections, commercial quality",
  lifestyle:
    "lifestyle product photography, styled home interior, warm natural window light, shallow depth of field, editorial quality",
  outdoor:
    "outdoor product photography, natural landscape backdrop, golden hour sunlight, organic textures, premium brand campaign",
  seasonal:
    "seasonal product photography, festive styled scene, warm ambient lighting, tasteful props, holiday campaign quality",
};

const STYLE_PROMPTS: Record<string, string> = {
  minimal: "minimalist composition, generous negative space",
  vibrant: "vibrant saturated colors, bold contrast",
  moody: "moody dramatic lighting, deep shadows",
  soft: "soft pastel tones, airy and light",
};

export function buildPhotoPrompt(theme: string, style: string) {
  const base = THEME_PROMPTS[theme] ?? THEME_PROMPTS.studio;
  const styled = STYLE_PROMPTS[style] ?? "";
  return `${base}${styled ? `, ${styled}` : ""}, ultra detailed, 8k, product perfectly preserved`;
}

/** Flux image-to-image on fal.ai: restage the uploaded product photo. */
export async function generateProductPhotos(opts: {
  imageDataUrl: string;
  theme: string;
  style: string;
  count?: number;
}): Promise<string[]> {
  if (!isLive("fal")) throw new Error("fal.ai is not configured");
  fal.config({ credentials: process.env.FAL_KEY! });

  const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
    input: {
      image_url: opts.imageDataUrl,
      prompt: buildPhotoPrompt(opts.theme, opts.style),
      strength: 0.82,
      num_images: opts.count ?? 4,
      enable_safety_checker: true,
    },
  });

  const images = (result.data as { images?: { url: string }[] }).images ?? [];
  return images.map((i) => i.url);
}
