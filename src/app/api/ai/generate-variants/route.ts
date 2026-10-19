import { NextRequest, NextResponse } from "next/server";
import { generatePlatformVariants } from "@/lib/ai/contentGenerator";
import { evaluateSafetyAndRisk } from "@/lib/ai/sentinelSafety";
import { WorkspaceId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, concept, primaryMediaUrl } = await req.json();

    if (!concept || typeof concept !== "string") {
      return NextResponse.json({ error: "Missing concept text" }, { status: 400 });
    }

    const wsId = (workspaceId || "acme-cloud") as WorkspaceId;
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if live Gemini API is configured
    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an elite enterprise social media strategist for ${wsId}.
Convert this core narrative into customized copies for X, LinkedIn, Instagram, and Telegram.
Narrative: "${concept}"

Respond with ONLY valid JSON in this format:
{
  "x": { "text": "...", "hashtags": ["#tag1", "#tag2"] },
  "linkedin": { "text": "...", "hashtags": ["#tag1", "#tag2"], "firstComment": "..." },
  "instagram": { "text": "...", "hashtags": ["#tag1", "#tag2"] },
  "telegram": { "text": "...", "hashtags": ["#tag1"] }
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const baseVariants = generatePlatformVariants({
            workspaceId: wsId,
            rawConcept: concept,
            primaryMediaUrl,
          });

          // Merge AI variants into base structure
          for (const [k, v] of Object.entries(parsed)) {
            if (baseVariants[k as keyof typeof baseVariants]) {
              baseVariants[k as keyof typeof baseVariants].text = (v as { text: string }).text;
              if ((v as { hashtags?: string[] }).hashtags) {
                baseVariants[k as keyof typeof baseVariants].hashtags = (v as { hashtags: string[] }).hashtags;
              }
            }
          }

          const safety = evaluateSafetyAndRisk(wsId, concept);
          return NextResponse.json({
            variants: baseVariants,
            safety,
            source: "gemini-live",
          });
        }
      } catch (geminiError) {
        console.warn("[OmniSocial AI] Live Gemini error, falling back to heuristic engine:", geminiError);
      }
    }

    // High-quality deterministic fallback
    const variants = generatePlatformVariants({
      workspaceId: wsId,
      rawConcept: concept,
      primaryMediaUrl,
    });
    const safety = evaluateSafetyAndRisk(wsId, concept);

    return NextResponse.json({
      variants,
      safety,
      source: "intelligent-fallback",
    });
  } catch (error) {
    console.error("[OmniSocial AI] Generation failed:", error);
    return NextResponse.json({ error: "Failed to generate variants" }, { status: 500 });
  }
}
