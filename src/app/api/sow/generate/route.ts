import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EngagementService } from "@/services/engagement.service";
import { AIService } from "@/services/ai.service";
import { handleApiError } from "@/lib/api-utils";
import { validateInput } from "@/lib/validations/engagement";
import { z } from "zod";

/**
 * POST /api/sow/generate
 * Generate Statement of Work for an engagement
 * FR-501: Generate SOW
 *
 * Requires: Pro or Team tier (SOW generation limit > 0)
 */

// Increase timeout for SOW generation (can take up to 60 seconds)
export const maxDuration = 60;

const requestSchema = z.object({
  engagementId: z.string().uuid("Invalid engagement ID"),
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
    const { engagementId } = validateInput(requestSchema, body);

    // Fetch engagement and verify ownership
    const engagementService = new EngagementService(supabase);
    const engagement = await engagementService.getById(user.id, engagementId);

    // Check if AI API key is configured
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      // Return mock SOW when no API key configured
      return NextResponse.json({
        sow: {
          executive_summary: `Statement of Work for ${engagement.client_name}\n\nThis engagement will provide comprehensive consulting services to support ${engagement.title}. The project team will work collaboratively with stakeholders to deliver measurable business outcomes.\n\nThe engagement leverages proven methodologies and frameworks to ensure actionable insights and sustainable improvements.`,
          objectives: [
            "Assess current state operations and identify improvement opportunities",
            "Develop strategic recommendations aligned with business goals",
            "Create implementation roadmap with clear milestones",
            "Build internal capabilities for sustained success",
          ],
          deliverables: [
            {
              id: "D1",
              name: "Current State Assessment",
              description: "Comprehensive analysis of existing processes, systems, and organizational capabilities",
              acceptance_criteria: [
                "Document covers all in-scope areas",
                "Key stakeholders reviewed and approved findings",
                "Quantitative baseline metrics established",
              ],
            },
            {
              id: "D2",
              name: "Strategic Recommendations",
              description: "Detailed recommendations with prioritization and business case",
              acceptance_criteria: [
                "Recommendations are actionable and specific",
                "ROI estimates provided for key initiatives",
                "Executive presentation delivered",
              ],
            },
            {
              id: "D3",
              name: "Implementation Roadmap",
              description: "Phased plan with timelines, resources, and dependencies",
              acceptance_criteria: [
                "Roadmap covers 12-18 month horizon",
                "Quick wins identified for early momentum",
                "Resource requirements clearly defined",
              ],
            },
          ],
          timeline: [
            {
              id: "P1",
              name: "Discovery & Assessment",
              duration_weeks: 3,
              deliverables: ["D1"],
              dependencies: [],
            },
            {
              id: "P2",
              name: "Analysis & Recommendations",
              duration_weeks: 3,
              deliverables: ["D2"],
              dependencies: ["P1"],
            },
            {
              id: "P3",
              name: "Roadmap Development",
              duration_weeks: 2,
              deliverables: ["D3"],
              dependencies: ["P2"],
            },
          ],
          assumptions: [
            "Key stakeholders are available for interviews and working sessions",
            "Access to relevant data and documentation will be provided",
            "Client team members assigned for knowledge transfer",
            "Decisions are made in a timely manner to maintain project timeline",
          ],
          risks: [
            {
              id: "R1",
              description: "Key stakeholder availability may impact timeline",
              likelihood: "medium",
              impact: "medium",
              mitigation: "Establish meeting cadence early and secure calendar commitments",
            },
            {
              id: "R2",
              description: "Data quality issues may require additional analysis time",
              likelihood: "medium",
              impact: "low",
              mitigation: "Conduct early data assessment and adjust scope if needed",
            },
            {
              id: "R3",
              description: "Scope creep may extend project duration",
              likelihood: "low",
              impact: "high",
              mitigation: "Maintain rigorous change control process",
            },
          ],
        },
        message: "AI not configured - using mock response",
      });
    }

    // Generate SOW using AI service
    const aiService = new AIService(supabase);
    const sow = await aiService.generateSOW(user.id, engagement);

    return NextResponse.json({ sow });
  } catch (error) {
    return handleApiError(error);
  }
}
