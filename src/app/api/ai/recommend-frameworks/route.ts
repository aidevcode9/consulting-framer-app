import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AIService } from "@/services/ai.service";
import { handleApiError } from "@/lib/api-utils";
import { z } from "zod";

/**
 * POST /api/ai/recommend-frameworks
 * Generate framework recommendations based on discovery
 * FR-405: Framework recommendations
 */

const requestSchema = z.object({
  engagementId: z.string().uuid(),
  discoveryAnswers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
  context: z.object({
    clientName: z.string(),
    industry: z.string().optional(),
    challenge: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { engagementId, discoveryAnswers, context } = parsed.data;

    // Check if API key is configured
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      // Return mock response when no API key configured
      return NextResponse.json({
        recommendations: [
          {
            framework: "swot",
            confidence: 0.85,
            reasoning: "SWOT analysis provides a good starting point for understanding the competitive position.",
            focusAreas: ["Market opportunities", "Internal capabilities"],
          },
          {
            framework: "porter",
            confidence: 0.7,
            reasoning: "Understanding industry dynamics will help inform strategic decisions.",
            focusAreas: ["Competitive rivalry", "Buyer power"],
          },
        ],
        summary: "Based on the discovery information, we recommend starting with a SWOT analysis to establish baseline understanding, followed by Porter's Five Forces for industry analysis.",
        message: "AI not configured - using mock response",
      });
    }

    const aiService = new AIService(supabase);
    const result = await aiService.generateFrameworkRecommendations(
      user.id,
      engagementId,
      discoveryAnswers,
      context
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
