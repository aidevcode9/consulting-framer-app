import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AIService } from "@/services/ai.service";
import { handleApiError } from "@/lib/api-utils";
import { z } from "zod";

/**
 * POST /api/ai/populate-canvas
 * Generate content to populate a framework node from discovery
 * FR-406: Auto-populate canvas
 */

const requestSchema = z.object({
  engagementId: z.string().uuid(),
  frameworkType: z.enum(["swot", "porter", "mckinsey7s"]),
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

    const { engagementId, frameworkType, discoveryAnswers, context } = parsed.data;

    // Check if API key is configured
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      // Return mock response when no API key configured
      const mockSections: Record<string, Record<string, string[]>> = {
        swot: {
          strengths: [
            "Strong leadership team with industry experience",
            "Established brand presence in target market",
            "Solid financial foundation for investment",
          ],
          weaknesses: [
            "Limited digital transformation capabilities",
            "Siloed organizational structure",
            "Aging technology infrastructure",
          ],
          opportunities: [
            "Emerging market segments with high growth potential",
            "Strategic partnership possibilities",
            "Technology modernization to improve efficiency",
          ],
          threats: [
            "Increasing competitive pressure from new entrants",
            "Changing regulatory environment",
            "Economic uncertainty affecting customer spending",
          ],
        },
        porter: {
          rivalry: [
            "Moderate competitive intensity in core market",
            "Price competition increasing in commodity segments",
            "Differentiation opportunities through innovation",
          ],
          suppliers: [
            "Concentrated supplier base for key inputs",
            "Moderate switching costs for alternative suppliers",
            "Vertical integration potential exists",
          ],
          buyers: [
            "Fragmented customer base reduces individual power",
            "Increasing price sensitivity in B2B segment",
            "Loyalty programs help retention",
          ],
          substitutes: [
            "Emerging technology-based alternatives",
            "Low switching costs to substitutes",
            "Brand value provides some protection",
          ],
          entrants: [
            "High capital requirements create barriers",
            "Regulatory compliance adds entry complexity",
            "Economies of scale favor incumbents",
          ],
        },
        mckinsey7s: {
          strategy: [
            "Growth strategy focused on market expansion",
            "Cost leadership in core segments",
            "Innovation-driven differentiation",
          ],
          structure: [
            "Functional organizational structure",
            "Regional divisions for market coverage",
            "Centralized support functions",
          ],
          systems: [
            "ERP system for core operations",
            "CRM for customer management",
            "Performance management processes",
          ],
          shared_values: [
            "Customer-centric culture",
            "Innovation and continuous improvement",
            "Integrity and ethical business practices",
          ],
          style: [
            "Collaborative leadership approach",
            "Data-driven decision making",
            "Open communication culture",
          ],
          staff: [
            "Strong talent in technical roles",
            "Gaps in digital capabilities",
            "Competitive compensation packages",
          ],
          skills: [
            "Deep domain expertise",
            "Strong operational capabilities",
            "Developing analytics competencies",
          ],
        },
      };

      return NextResponse.json({
        sections: mockSections[frameworkType] || {},
        message: "AI not configured - using mock response",
      });
    }

    const aiService = new AIService(supabase);
    const result = await aiService.generateCanvasContent(
      user.id,
      engagementId,
      frameworkType,
      discoveryAnswers,
      context
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
