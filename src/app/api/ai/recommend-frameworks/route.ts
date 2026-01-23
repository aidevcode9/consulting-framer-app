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

    // Require API key
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      return NextResponse.json(
        { error: "AI service not configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY." },
        { status: 503 }
      );
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
