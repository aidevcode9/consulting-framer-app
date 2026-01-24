import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EngagementService } from "@/services/engagement.service";
import { AIService } from "@/services/ai.service";
import { handleApiError } from "@/lib/api-utils";
import { validateInput } from "@/lib/validations/engagement";
import { z } from "zod";

/**
 * POST /api/proposal/generate
 * Generate client-facing proposal for an engagement
 * FR-502: Generate Proposal
 *
 * Requires: Pro or Team tier (uses SOW generation limit)
 */

// Increase timeout for proposal generation (can take up to 60 seconds)
export const maxDuration = 60;

const requestSchema = z.object({
  engagementId: z.string().uuid("Invalid engagement ID"),
  sowSummary: z.string().optional(), // Optional SOW context for better alignment
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
    const { engagementId, sowSummary } = validateInput(requestSchema, body);

    // Fetch engagement and verify ownership
    const engagementService = new EngagementService(supabase);
    const engagement = await engagementService.getById(user.id, engagementId);

    // Require API key
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      return NextResponse.json(
        { error: "AI service not configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    // Generate proposal using AI service
    const aiService = new AIService(supabase);
    const proposal = await aiService.generateProposal(user.id, engagement, sowSummary);

    return NextResponse.json({ proposal });
  } catch (error) {
    return handleApiError(error);
  }
}
