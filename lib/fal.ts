import { fal } from "@fal-ai/client";
import { isLive } from "@/lib/env";

// Model ids come from .env so quality/price tier can change with no code edits.
const DEFAULT_IMAGE_MODEL = "fal-ai/flux-pro/kontext";
const DEFAULT_VIDEO_MODEL = "fal-ai/kling-video/v2.5-turbo/pro/image-to-video";

const imageModel = () => process.env.FAL_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
const videoModel = () => process.env.FAL_VIDEO_MODEL?.trim() || DEFAULT_VIDEO_MODEL;

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

const MOTION_PROMPTS: Record<string, string> = {
  orbit:
    "camera slowly orbits around the product, smooth 360 rotation, studio lighting, product stays centered and sharp",
  dolly:
    "slow cinematic dolly-in toward the product, shallow depth of field builds, dramatic reveal, product in crisp focus",
  pan: "smooth lateral camera pan across the product, elegant gliding motion, consistent lighting, premium commercial feel",
};

export function buildPhotoPrompt(theme: string, style: string) {
  const base = THEME_PROMPTS[theme] ?? THEME_PROMPTS.studio;
  const styled = STYLE_PROMPTS[style] ?? "";
  return `${base}${styled ? `, ${styled}` : ""}, ultra detailed, 8k, product perfectly preserved`;
}

/**
 * Build the input body for the selected image model. Different fal image
 * models take different params: classic flux/dev image-to-image needs a
 * denoise `strength`, while editing models (Flux Kontext, Seedream, Nano
 * Banana) restage from the image directly and reject `strength`.
 */
function buildImageInput(model: string, imageUrl: string, prompt: string, count: number) {
  const input: Record<string, unknown> = {
    image_url: imageUrl,
    prompt,
    num_images: count,
  };
  if (model.includes("flux/dev") || model.includes("image-to-image")) {
    input.strength = 0.82;
    input.enable_safety_checker = true;
  }
  // Flux models (dev + Kontext) take guidance_scale; a higher value makes the
  // model follow the prompt more strongly. Skipped for non-flux models
  // (e.g. Nano Banana / Seedream) which don't accept this param.
  if (model.includes("flux")) {
    input.guidance_scale = 4;
  }
  return input;
}

// Non-contradictory quality tag appended to a user's own prompt. Deliberately
// has NO background or "preserved" wording — those fight a requested scene change.
const QUALITY_SUFFIX =
  "sharp focus on the product, professional product photography, high detail, photorealistic";

/** Image-to-image on fal.ai: restage the uploaded product photo. Model from FAL_IMAGE_MODEL. */
export async function generateProductPhotos(opts: {
  imageDataUrl: string;
  theme: string;
  style: string;
  count?: number;
  /** Optional free-text prompt from the user; leads the scene, theme/style refine it. */
  prompt?: string;
}): Promise<string[]> {
  if (!isLive("fal")) throw new Error("fal.ai is not configured");
  fal.config({ credentials: process.env.FAL_KEY! });

  // If the user wrote their own scene, send it (nearly) as-is — only a neutral
  // quality tag. Do NOT append the studio theme scaffold, which injects
  // "seamless white background" + "product perfectly preserved" and cancels
  // out any requested scene change. Theme/style apply only with no custom prompt.
  const custom = opts.prompt?.trim();
  const finalPrompt = custom
    ? `${custom}, ${QUALITY_SUFFIX}`
    : buildPhotoPrompt(opts.theme, opts.style);

  const model = imageModel();
  const result = await fal.subscribe(model, {
    input: buildImageInput(model, opts.imageDataUrl, finalPrompt, opts.count ?? 4),
  });

  const images = (result.data as { images?: { url: string }[] }).images ?? [];
  return images.map((i) => i.url);
}

/**
 * Image-to-video on fal.ai. Model from FAL_VIDEO_MODEL (Kling by default).
 * fal accepts a data-URL directly for image_url, so no separate upload step.
 */
export async function generateProductVideo(opts: {
  imageDataUrl: string;
  motion: string;
  durationSeconds?: 5 | 10;
  /** Optional free-text prompt from the user; leads the motion description. */
  prompt?: string;
}): Promise<{ url: string; durationSeconds: number }> {
  if (!isLive("fal")) throw new Error("fal.ai is not configured");
  fal.config({ credentials: process.env.FAL_KEY! });

  const custom = opts.prompt?.trim();
  const motionPrompt = MOTION_PROMPTS[opts.motion] ?? MOTION_PROMPTS.orbit;
  const finalPrompt = custom ? `${custom}, ${motionPrompt}` : motionPrompt;

  const duration = String(opts.durationSeconds ?? 5);
  const result = await fal.subscribe(videoModel(), {
    input: {
      image_url: opts.imageDataUrl,
      prompt: finalPrompt,
      duration,
      cfg_scale: 0.5,
    },
  });

  const video = (result.data as { video?: { url?: string } }).video;
  if (!video?.url) throw new Error("fal returned no video URL");
  return { url: video.url, durationSeconds: Number(duration) };
}
