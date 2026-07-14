import Anthropic from "@anthropic-ai/sdk";

/**
 * Provider-agnostic scene-prompt enhancement.
 *
 * Diffusion models leave an "empty room" when a setting is only named
 * abstractly ("a stylish office") — they need specific, visible nouns. This
 * expands a short brief into a concrete scene description while keeping the
 * user's setting and intent exactly.
 *
 * Deliberately decoupled from the image/video generator: swapping FAL_IMAGE_MODEL
 * or FAL_VIDEO_MODEL never touches this. It is also decoupled from any single
 * LLM vendor — it picks whichever text provider has a key configured, so
 * switching the AI provider is a pure env change with no code edits:
 *
 *   1. GEMINI_API_KEY   → Google Gemini   (model: GEMINI_TEXT_MODEL)
 *   2. ANTHROPIC_API_KEY → Anthropic Claude (model: ANTHROPIC_TEXT_MODEL)
 *   3. neither          → returns null; caller falls back to the raw prompt
 *
 * Any error degrades to null so generation never breaks because of it.
 */

const env = (k: string) => process.env[k]?.trim() || "";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

function buildSystem(medium: "photo" | "video"): string {
  const shoot = medium === "video" ? "video shoot" : "photo shoot";
  const photographer =
    medium === "video" ? "professional product videographer" : "professional product photographer";
  // Gemini acts as the art director: it turns the customer's brief (in ANY
  // language) into the exact English shooting brief the photographer follows.
  // It is deliberately faithful and hands-off about the product itself — product
  // fidelity is enforced downstream by deterministic guardrails in lib/fal.ts,
  // so those rails can never be dropped or weakened by the model.
  return [
    `You are the art director for a ${photographer}. A customer describes, in any language, how`,
    `they want their existing product photographed for a ${shoot}. Write the exact shooting brief,`,
    `IN ENGLISH, that the photographer will follow literally. Follow these rules strictly:`,
    ``,
    `1. LANGUAGE: Always write the brief in fluent English, no matter what language the customer used.`,
    `2. FAITHFULNESS: Serve the customer's request exactly. Never assume, never invent, never add`,
    `   anything the customer did not ask for, and never change their creative intent.`,
    `3. DETAIL PRESERVATION: If the customer's brief is already detailed, keep EVERY detail they`,
    `   specified — do not shorten, summarise, drop, merge or generalise anything. You may only add`,
    `   concrete visual specificity that directly serves what they already said. If the brief is`,
    `   short or vague, stay tightly on their intent and add only minimal, natural, concrete detail`,
    `   (visible props, surfaces, lighting direction and quality, colour mood, composition/framing)`,
    `   to make it renderable — nothing beyond their intent.`,
    `4. SCOPE — SET ONLY: Describe ONLY the scene, setting, background, lighting, mood, composition`,
    `   and camera. NEVER describe, restyle, recolour or reshape the product itself — its shape,`,
    `   colour, materials, logo and text come from the customer's own photo and must be preserved`,
    `   exactly. Do not put words in the brief that would alter the product.`,
    `5. If the customer asks for a minimal, empty, plain or studio/white backdrop, honour that`,
    `   exactly — keep it clean and uncluttered, do not fill it with props.`,
    `6. EXACT COLOURS: Preserve any exact colours, hex codes (e.g. #F2E9DE) or named colours the`,
    `   customer gives, verbatim and unchanged. If they specify a background colour, describe it as`,
    `   a clean, uniform, evenly-lit background of exactly that colour filling the frame, with NO`,
    `   gradient, vignette, colour shift or coloured light spill unless they explicitly asked for one.`,
    `7. SINGLE VIEW, SINGLE PRODUCT: Describe exactly ONE ${medium === "video" ? "clip" : "photograph"}`,
    `   showing ONE single instance of the product. Never imply a collage, grid, split-screen,`,
    `   multiple panels, side-by-side layout or more than one copy of the product in the frame.`,
    `   If the customer asks for several angles, sides, views or poses (front, back, left, right,`,
    `   diagonal, etc.), do NOT combine or enumerate them and do NOT fix any single camera viewpoint`,
    `   — each angle is a SEPARATE ${medium === "video" ? "clip" : "image"} produced elsewhere, so`,
    `   describe only the shared scene, lighting and mood and leave the camera angle unspecified.`,
    `   If they ask for exactly one specific view, you may keep that single viewpoint.`,
    medium === "video"
      ? `8. MOTION: Use exactly the camera motion the customer asked for; if they named none, add one`
      : `8. Frame it as a single, natural, professional product shot.`,
    medium === "video" ? `   natural, slow, realistic camera move that suits the scene.` : ``,
    ``,
    `Output ONLY the final English brief as flowing prose. No preamble, no labels, no quotes, no lists.`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callGemini(system: string, user: string): Promise<string | null> {
  const model = env("GEMINI_TEXT_MODEL") || DEFAULT_GEMINI_MODEL;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env("GEMINI_API_KEY")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        // maxOutputTokens is generous so a highly detailed customer brief is
        // never truncated (rule 3: keep every detail). temperature is modest to
        // stay faithful rather than inventive. thinkingBudget 0 disables the 2.5
        // "thinking" phase so it doesn't eat the output budget and return an
        // empty candidate; ignored by non-thinking models, safe across swaps.
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.6,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  return text && text.length > 0 ? text : null;
}

async function callAnthropic(system: string, user: string): Promise<string | null> {
  const anthropic = new Anthropic({ apiKey: env("ANTHROPIC_API_KEY") });
  const message = await anthropic.messages.create({
    model: env("ANTHROPIC_TEXT_MODEL") || DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 1024,
    temperature: 0.6,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text = message.content
    .find((b): b is Anthropic.TextBlock => b.type === "text")
    ?.text?.trim();
  return text && text.length > 0 ? text : null;
}

export interface EnhanceResult {
  /** Enhanced English prompt, or null when nothing was produced. */
  prompt: string | null;
  /**
   * True only when a provider WAS configured and its call failed — so the UI
   * can surface a small "Gemini error" note. Not set when no provider is
   * configured (that's an expected fall-through, not an error).
   */
  failed: boolean;
}

/**
 * Expand a user's short scene brief into a concrete one. Falls back to the raw
 * prompt (prompt:null) when no text provider is configured; sets failed:true
 * when a configured provider threw, so callers can tell the user.
 */
export async function expandScenePrompt(
  userPrompt: string,
  medium: "photo" | "video",
): Promise<EnhanceResult> {
  const brief = userPrompt.trim();
  if (!brief) return { prompt: null, failed: false };

  const system = buildSystem(medium);
  try {
    if (env("GEMINI_API_KEY")) return { prompt: await callGemini(system, brief), failed: false };
    if (env("ANTHROPIC_API_KEY")) return { prompt: await callAnthropic(system, brief), failed: false };
    return { prompt: null, failed: false };
  } catch (e) {
    console.error("scene prompt expansion failed:", e);
    return { prompt: null, failed: true };
  }
}
