import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AIService } from "@/services/ai.service";
import { handleApiError } from "@/lib/api-utils";
import { z } from "zod";

/**
 * POST /api/ai/summary
 * Generate executive summary from discovery answers
 * FR-404: Discovery summary
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
        summary: `Executive Summary for ${context.clientName}\n\nBased on the discovery process, the client is seeking consulting support to address key business challenges. The engagement will focus on understanding current operations, identifying improvement opportunities, and developing actionable recommendations.\n\nKey areas of focus include strategic planning, operational efficiency, and stakeholder alignment. The recommended approach involves structured analysis using established frameworks followed by collaborative solution development.`,
        message: "AI not configured - using mock response",
      });
    }

    const aiService = new AIService(supabase);
    const summary = await aiService.generateDiscoverySummary(
      user.id,
      engagementId,
      discoveryAnswers,
      context
    );

    return NextResponse.json({ summary });
  } catch (error) {
    return handleApiError(error);
  }
}
