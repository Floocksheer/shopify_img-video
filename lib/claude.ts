import Anthropic from "@anthropic-ai/sdk";
import { isLive } from "@/lib/env";

export interface CompetitorAnalysis {
  summary: string;
  background_style: string;
  camera_angle: string;
  composition: string;
  lighting: string;
  color_palette: string[];
  weaknesses: string[];
  opportunities: string[];
}

const ANALYSIS_TOOL: Anthropic.Tool = {
  name: "report_analysis",
  description: "Report the structured visual analysis of competitor product images",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "2-3 sentence overall assessment" },
      background_style: { type: "string" },
      camera_angle: { type: "string" },
      composition: { type: "string" },
      lighting: { type: "string" },
      color_palette: { type: "array", items: { type: "string" }, description: "hex colors" },
      weaknesses: { type: "array", items: { type: "string" } },
      opportunities: { type: "array", items: { type: "string" } },
    },
    required: [
      "summary",
      "background_style",
      "camera_angle",
      "composition",
      "lighting",
      "color_palette",
      "weaknesses",
      "opportunities",
    ],
  },
};

/** Send competitor images to Claude Vision, get structured style analysis. */
export async function analyzeCompetitorImages(
  imageUrls: string[],
): Promise<CompetitorAnalysis> {
  if (!isLive("anthropic")) throw new Error("Anthropic is not configured");
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  // Fetch and base64-encode up to 4 images
  const images = await Promise.all(
    imageUrls.slice(0, 4).map(async (url) => {
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      const mediaType = res.headers.get("content-type") ?? "image/jpeg";
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: buf.toString("base64"),
        },
      };
    }),
  );

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: "tool", name: "report_analysis" },
    messages: [
      {
        role: "user",
        content: [
          ...images,
          {
            type: "text",
            text: "You are a commercial product-photography director. Analyze these competitor product images from a Shopify store: identify the background style, camera angles, composition patterns, lighting setup, and dominant color palette. Then list concrete weaknesses and opportunities a rival store could exploit with better visuals.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude returned no structured analysis");
  return toolUse.input as unknown as CompetitorAnalysis;
}
