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

    // Check if AI API key is configured
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      // Return mock proposal when no API key configured
      return NextResponse.json({
        proposal: {
          executive_summary: `Proposal for ${engagement.client_name}\n\nWe are pleased to present this proposal for ${engagement.title}. Based on our discovery conversations and analysis, we have developed a tailored approach to address your strategic priorities and drive measurable business outcomes.\n\nOur team brings deep expertise in your industry and has successfully delivered similar engagements for leading organizations.`,
          situation_analysis: `${engagement.client_name} is navigating a complex landscape that requires strategic clarity and execution excellence. Through our initial discussions, we've identified key challenges that present both immediate needs and longer-term transformation opportunities.\n\nYour organization has demonstrated strong commitment to improvement, and we see significant potential for positive impact through our collaborative engagement.`,
          proposed_approach: `Our methodology combines strategic analysis with practical implementation focus. We will work alongside your team to ensure knowledge transfer and sustainable capability building.\n\nThe engagement will follow a phased approach, starting with deep discovery to ensure we fully understand your context, followed by collaborative analysis and recommendation development, and concluding with actionable implementation planning.\n\nThroughout the engagement, we maintain transparency through regular touchpoints and progress updates.`,
          key_benefits: [
            "Clear strategic direction aligned with organizational priorities",
            "Actionable roadmap with prioritized initiatives and quick wins",
            "Quantified business case to support investment decisions",
            "Internal capability development for sustained success",
            "Access to industry best practices and benchmarks",
          ],
          methodology: [
            {
              phase: "Phase 1: Discovery",
              description: "Deep dive into current state through interviews, data analysis, and stakeholder engagement",
              duration: "2-3 weeks",
              outcomes: ["Current state assessment", "Key findings presentation", "Stakeholder alignment"],
            },
            {
              phase: "Phase 2: Analysis & Strategy",
              description: "Develop strategic recommendations based on discovery findings and industry best practices",
              duration: "2-3 weeks",
              outcomes: ["Strategic recommendations", "Business case development", "Executive presentation"],
            },
            {
              phase: "Phase 3: Roadmap & Planning",
              description: "Create detailed implementation plan with timelines, resources, and success metrics",
              duration: "1-2 weeks",
              outcomes: ["Implementation roadmap", "Resource plan", "Success metrics framework"],
            },
          ],
          investment: {
            summary: "Our investment options are designed to provide flexibility while ensuring you receive the support needed for success. We structure engagements to maximize value and minimize risk.",
            options: [
              {
                name: "Comprehensive Engagement",
                description: "Full scope including all phases with dedicated senior team",
                price_range: "$75,000 - $125,000",
                includes: [
                  "Full discovery and analysis",
                  "Strategic recommendations",
                  "Implementation roadmap",
                  "Executive presentations",
                  "Knowledge transfer sessions",
                ],
              },
              {
                name: "Focused Assessment",
                description: "Accelerated engagement focusing on priority areas",
                price_range: "$40,000 - $60,000",
                includes: [
                  "Targeted discovery",
                  "Key recommendations",
                  "High-level roadmap",
                  "Executive summary",
                ],
              },
            ],
            terms: "50% upon project kickoff, 50% upon final deliverable acceptance. Payment due net 30.",
          },
          next_steps: [
            "Schedule proposal review call to discuss questions and alignment",
            "Finalize scope and investment based on discussion",
            "Execute engagement letter",
            "Schedule kickoff meeting for week of [TBD]",
          ],
          why_us: "Our team combines deep industry expertise with practical execution experience. We've helped dozens of organizations navigate similar challenges and achieve measurable results. We pride ourselves on becoming trusted partners, not just vendors, and our client retention rate reflects the lasting value we deliver.",
        },
        message: "AI not configured - using mock response",
      });
    }

    // Generate proposal using AI service
    const aiService = new AIService(supabase);
    const proposal = await aiService.generateProposal(user.id, engagement, sowSummary);

    return NextResponse.json({ proposal });
  } catch (error) {
    return handleApiError(error);
  }
}
