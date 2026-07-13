import { fal } from "@fal-ai/client";
import { isLive } from "@/lib/env";

// Model ids come from .env so quality/price tier can change with no code edits.
const DEFAULT_IMAGE_MODEL = "fal-ai/flux-pro/kontext";
const DEFAULT_VIDEO_MODEL = "fal-ai/kling-video/v2.5-turbo/pro/image-to-video";

const imageModel = () => process.env.FAL_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
const videoModel = () => process.env.FAL_VIDEO_MODEL?.trim() || DEFAULT_VIDEO_MODEL;

// Aspect ratios we expose in the UI. Values are the exact strings Flux Kontext
// (and most fal image models) accept for `aspect_ratio`. For models that take an
// explicit `image_size` instead, PIXELS maps each ratio to width/height at a
// given quality tier so the same picker drives both param styles.
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type Quality = "standard" | "high";

const ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];
const DEFAULT_ASPECT: AspectRatio = "1:1";

// Base long-edge (px) per quality tier for image_size-capable models.
// 1280 keeps even 9:16 above Seedream's ~921600px minimum area; 2048 ≈ 2K.
const QUALITY_LONG_EDGE: Record<Quality, number> = { standard: 1280, high: 2048 };

function pixelsFor(ratio: AspectRatio, quality: Quality): { width: number; height: number } {
  const long = QUALITY_LONG_EDGE[quality];
  const [w, h] = ratio.split(":").map(Number);
  // Scale so the longer side equals `long`, then round to a multiple of 16.
  const scale = long / Math.max(w, h);
  const round16 = (n: number) => Math.max(256, Math.round((n * scale) / 16) * 16);
  return { width: round16(w), height: round16(h) };
}

function normalizeAspect(ratio?: string): AspectRatio {
  return ASPECT_RATIOS.includes(ratio as AspectRatio) ? (ratio as AspectRatio) : DEFAULT_ASPECT;
}

// Presets (theme/style/motion) were removed — the user's prompt is now the only
// creative driver. These defaults fill in only when the prompt is left blank.
const DEFAULT_PHOTO_PROMPT =
  "professional studio product photography, clean seamless background, soft commercial lighting, sharp focus";
const DEFAULT_VIDEO_PROMPT =
  "smooth cinematic camera motion around the product, professional product video, product stays sharp and centered";

// Hard single-subject constraint, appended to EVERY photo prompt. Seedream
// `edit` copies the layout of the input photo (a front+back-in-one-image leaks
// straight into a 2-panel output) and reads any hint of "multiple" as "tile
// them into a grid". Stating the single-frame rule explicitly is what actually
// stops the collage.
const SINGLE_SUBJECT =
  "show the product as one single item in one continuous photograph, not a collage, not a grid, no split screen, no multiple panels, no side-by-side comparison";

// Distinct framing per output so a set is genuinely varied instead of several
// near-identical seeds. Deliberately camera/composition words only, so they
// layer on top of whatever scene the user described without fighting it.
const ANGLE_HINTS = [
  "front three-quarter hero angle",
  "side profile angle",
  "top-down flat-lay composition",
  "close-up detail crop",
  "low-angle dramatic hero shot",
  "back three-quarter angle",
];

/**
 * Build the input body for the selected image model. Different fal image
 * models take different params: classic flux/dev image-to-image needs a
 * denoise `strength`, while editing models (Flux Kontext, Seedream, Nano
 * Banana) restage from the image directly and reject `strength`.
 */
function buildImageInput(
  model: string,
  imageUrls: string[],
  prompt: string,
  count: number,
  aspect: AspectRatio,
  quality: Quality,
) {
  const input: Record<string, unknown> = {
    prompt,
    num_images: count,
  };

  // Input image field differs by model: Seedream/Nano Banana edit take an
  // `image_urls` array (multiple angles of the same product improve the
  // restaging); Flux Kontext / flux-dev take a single `image_url`.
  if (model.includes("seedream") || model.includes("nano-banana")) {
    input.image_urls = imageUrls;
  } else {
    input.image_url = imageUrls[0];
  }

  // Output shape/size. Two param styles across fal models:
  //  - Flux Kontext / flux-pro take an `aspect_ratio` string (fixed ~1MP; no
  //    independent resolution knob, so `quality` is a no-op for these).
  //  - flux/dev + image-to-image + Seedream accept an explicit `image_size`,
  //    where `quality` genuinely raises the pixel count.
  if (model.includes("image-to-image") || model.includes("flux/dev") || model.includes("seedream")) {
    input.image_size = pixelsFor(aspect, quality);
  } else {
    input.aspect_ratio = aspect;
  }

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

// Keep the product itself faithful while still allowing a new scene/background.
// Scoped to the PRODUCT only — deliberately says nothing about the environment,
// so a prompt is free to move the product into any scene.
const PRODUCT_PRESERVE =
  "keep the product itself unchanged — its exact shape, proportions, color, materials, logo and text; do not distort or redesign the product";

// Added only when the user wrote a scene prompt. Edit models (Seedream) keep the
// original background unless told to replace it, so this makes the restage explicit.
const SCENE_DIRECTIVE =
  "fully restage the product into the described scene: replace the original background, floor and surroundings entirely to match the prompt, with realistic lighting, shadows and reflections";

// Realism layer for video (applies to any product). The identity lock is
// appended to every video prompt; the negative prompt is passed to models that
// accept one. Together they stop the morphing/identity-flip seen with
// unconstrained generation (e.g. a MacBook screen turning into a Windows one).
const VIDEO_IDENTITY_LOCK =
  "keep the product exactly as in the reference photo — identical shape, proportions, color, materials, logo and screen content; the product must not morph, warp, deform or transform into anything else; do not add, remove or change any text or logo; realistic physics and lighting; smooth camera motion only, the product stays consistent throughout";

const VIDEO_NEGATIVE_PROMPT =
  "morphing, warping, melting, distortion, deformation, changing shape, changing logo, changing text, different product, extra objects, duplicated product, flickering, glitch, jitter, blurry, low quality, cartoon, unrealistic, watermark";

/**
 * Restage the uploaded product photo(s) on fal.ai. The user's prompt leads;
 * we make ONE call per requested output — each with a different framing hint
 * and seed — so the set is genuinely diverse. (A single `num_images:N` call
 * just returns N near-identical variants of the same prompt.) Calls run in
 * parallel so wall-clock time stays flat, and cost is per-output either way.
 * Model from FAL_IMAGE_MODEL.
 */
export async function generateProductPhotos(opts: {
  /** One or more source photos of the same product (different angles). */
  imageDataUrls: string[];
  /** How many distinct photos to produce (1–4). */
  count?: number;
  /** Free-text scene prompt; blank falls back to a neutral studio prompt. */
  prompt?: string;
  /** Output shape; defaults to square. */
  aspectRatio?: string;
  /** Resolution tier (only affects image_size-capable models). */
  quality?: Quality;
}): Promise<string[]> {
  if (!isLive("fal")) throw new Error("fal.ai is not configured");
  fal.config({ credentials: process.env.FAL_KEY! });

  const custom = opts.prompt?.trim();
  const base = custom || DEFAULT_PHOTO_PROMPT;
  // Only force a full background replacement when the user actually described a
  // scene; a blank prompt keeps the neutral studio default.
  const scene = custom ? `, ${SCENE_DIRECTIVE}` : "";
  const model = imageModel();
  const aspect = normalizeAspect(opts.aspectRatio);
  const quality = opts.quality ?? "standard";
  const count = Math.min(6, Math.max(1, Math.round(opts.count ?? 4)));
  const baseSeed = Math.floor(Math.random() * 1_000_000);

  const calls = Array.from({ length: count }, async (_, i) => {
    // Only vary framing when more than one image is asked for.
    const framing = count > 1 ? `, ${ANGLE_HINTS[i % ANGLE_HINTS.length]}` : "";
    const prompt = `${base}${framing}${scene}, ${QUALITY_SUFFIX}, ${PRODUCT_PRESERVE}, ${SINGLE_SUBJECT}`;
    const input = buildImageInput(model, opts.imageDataUrls, prompt, 1, aspect, quality);
    input.seed = baseSeed + i * 1013; // distinct seed → distinct result
    const result = await fal.subscribe(model, { input });
    return (result.data as { images?: { url: string }[] }).images?.[0]?.url;
  });

  const urls = await Promise.all(calls);
  return urls.filter((u): u is string => typeof u === "string" && u.length > 0);
}

export type VideoResolution = "480p" | "720p" | "1080p";

/**
 * Build the model-specific input for image-to-video. One or more source photos
 * of the same product come in; the return is a single video.
 *
 *  - Pixverse C1 reference-to-video (default): takes `image_references` (each
 *    photo tagged as a subject + a @ref_name used in the prompt) and fuses ALL
 *    of them into ONE clip. `resolution` + `duration` are real knobs.
 *  - Seedance reference-to-video: takes an `image_urls` array -> one clip.
 *  - Seedance / Kling image-to-video: single `image_url` (first photo only).
 */
function buildVideoInput(
  model: string,
  imageUrls: string[],
  prompt: string,
  duration: number,
  resolution: VideoResolution,
) {
  if (model.includes("pixverse")) {
    const refs = imageUrls.map((url, i) => ({
      image_url: url,
      type: "subject",
      ref_name: `product${i + 1}`,
    }));
    const mentions = refs.map((r) => `@${r.ref_name}`).join(" ");
    return {
      image_references: refs,
      prompt: `${mentions} ${prompt}`.trim(),
      negative_prompt: VIDEO_NEGATIVE_PROMPT,
      resolution,
      duration,
    };
  }
  if (model.includes("seedance") && model.includes("reference")) {
    return { image_urls: imageUrls, prompt, resolution, duration: String(duration) };
  }
  if (model.includes("seedance")) {
    // Single-image i2v: no cfg_scale, audio off to keep token cost down.
    return { image_url: imageUrls[0], prompt, duration: String(duration), resolution, generate_audio: false };
  }
  // Kling image-to-video (default): anchors on the FIRST photo and animates it,
  // so identity is preserved. cfg_scale drives prompt adherence; negative_prompt
  // steers away from morphing/identity drift.
  return {
    image_url: imageUrls[0],
    prompt,
    duration: String(duration),
    negative_prompt: VIDEO_NEGATIVE_PROMPT,
    cfg_scale: 0.5,
  };
}

/**
 * Image-to-video on fal.ai. Model from FAL_VIDEO_MODEL. The default (Kling 2.5
 * i2v) anchors on the FIRST photo and animates it, so the product stays
 * faithful. Every prompt gets the identity-lock guardrail so the product can't
 * drift/morph mid-clip. fal accepts data-URLs directly, so no upload step.
 */
export async function generateProductVideo(opts: {
  /** One or more source photos; i2v models anchor on the first (clearest) one. */
  imageDataUrls: string[];
  durationSeconds?: number;
  resolution?: VideoResolution;
  /** Free-text motion/scene prompt; blank falls back to a neutral motion. */
  prompt?: string;
}): Promise<{ url: string; durationSeconds: number }> {
  if (!isLive("fal")) throw new Error("fal.ai is not configured");
  fal.config({ credentials: process.env.FAL_KEY! });

  const base = opts.prompt?.trim() || DEFAULT_VIDEO_PROMPT;
  const finalPrompt = `${base}, ${VIDEO_IDENTITY_LOCK}`;

  const model = videoModel();
  // Kling i2v supports only 5s or 10s; clamp anything longer down to 10.
  let duration = opts.durationSeconds ?? 5;
  if (model.includes("kling") && duration > 10) duration = 10;
  const resolution = opts.resolution ?? "720p";

  const input = buildVideoInput(model, opts.imageDataUrls, finalPrompt, duration, resolution);
  const result = await fal.subscribe(model, { input });

  const video = (result.data as { video?: { url?: string } }).video;
  if (!video?.url) throw new Error("fal returned no video URL");
  return { url: video.url, durationSeconds: duration };
}
