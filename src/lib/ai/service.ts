// AI Service - Claude API Integration
// Handles Discovery Copilot, Framework Recommendations, and Scope Generation

import Anthropic from "@anthropic-ai/sdk";
import type {
  DiscoveryContext,
  DiscoveryAnswer,
  FrameworkRecommendation,
  FrameworkTemplate,
  GeneratedScope,
  ScopeGenerationInput,
  Engagement,
  CanvasData,
} from "@/types";

/**
 * Initialize and validate Anthropic API client for server-side operations.
 *
 * Creates a new Anthropic client instance with API key from environment variables.
 * This function should only be called in server-side contexts (API routes, server components).
 *
 * @returns Configured Anthropic client instance
 * @throws Error if ANTHROPIC_API_KEY environment variable is not set
 *
 * @example
 * const client = getAnthropicClient();
 * const response = await client.messages.create({...});
 */
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
};

// ============================================
// DISCOVERY COPILOT
// ============================================

const DISCOVERY_SYSTEM_PROMPT = `You are an expert consulting engagement discovery assistant. Your role is to help consultants gather comprehensive information about client engagements through intelligent follow-up questions.

GUIDELINES:
1. Ask clarifying questions that uncover hidden requirements and risks
2. Identify stakeholders and their motivations
3. Probe for success criteria and constraints
4. Look for scope creep indicators
5. Be conversational but efficient - respect the consultant's time
6. Focus on information that directly impacts engagement scoping

RESPONSE FORMAT:
- Keep follow-up questions concise (1-2 sentences)
- If the answer is complete, say "COMPLETE" 
- If you need clarification, ask ONE focused question
- Never ask multiple questions at once`;

/**
 * Generate AI-powered follow-up questions during discovery phase.
 *
 * Analyzes the current engagement context and previous discovery answers to determine
 * if additional clarification is needed or if the discovery process is complete for this question.
 * Uses Claude to intelligently probe for hidden requirements, stakeholders, and constraints.
 *
 * @param context - Discovery context including engagement details, current question, and previous answers
 * @returns Promise resolving to object with followUp question (or null if complete) and isComplete flag
 *
 * @example
 * const result = await generateDiscoveryFollowUp({
 *   engagement: { client_name: "Acme Corp", client_industry: "tech", title: "Digital Transformation" },
 *   current_question: { id: "q1", question: "What are your main objectives?", category: "scope" },
 *   answers: { "q1": { value: "Cloud migration", category: "scope" } }
 * });
 * // Returns: { followUp: "Which cloud provider are you targeting?", isComplete: false }
 */
export async function generateDiscoveryFollowUp(
  context: DiscoveryContext
): Promise<{ followUp: string | null; isComplete: boolean }> {
  const client = getAnthropicClient();

  const answersText = Object.entries(context.answers)
    .map(([qId, answer]) => `Q: ${qId}\nA: ${answer.value}`)
    .join("\n\n");

  const prompt = `ENGAGEMENT CONTEXT:
Client: ${context.engagement.client_name}
Industry: ${context.engagement.client_industry || "Not specified"}
Title: ${context.engagement.title}

PREVIOUS ANSWERS:
${answersText || "None yet"}

CURRENT QUESTION:
${context.current_question.question}
${context.current_question.description ? `(${context.current_question.description})` : ""}

AI CONTEXT FOR THIS QUESTION:
${context.current_question.ai_context || "Standard question"}

Based on the context and previous answers, determine if you need to ask a follow-up question to clarify or expand on this topic. If the answer seems complete and comprehensive, respond with just "COMPLETE".`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: DISCOVERY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const isComplete = text.trim().toUpperCase() === "COMPLETE";

    return {
      followUp: isComplete ? null : text.trim(),
      isComplete,
    };
  } catch (error) {
    console.error("Discovery follow-up error:", error);
    return { followUp: null, isComplete: true };
  }
}

// ============================================
// FRAMEWORK RECOMMENDER
// ============================================

const FRAMEWORK_SYSTEM_PROMPT = `You are an expert consulting framework advisor. Based on engagement context, recommend the most appropriate analytical frameworks.

AVAILABLE FRAMEWORKS:
1. SWOT Analysis - Best for: Strategic positioning, competitive analysis, self-assessment
2. Porter's Five Forces - Best for: Industry analysis, competitive dynamics, market entry
3. McKinsey 7-S - Best for: Organizational change, alignment assessment, transformation
4. Business Model Canvas - Best for: Business model design, value proposition, startup strategy

RESPONSE FORMAT (JSON):
{
  "recommendations": [
    {
      "framework_slug": "swot|porter-five-forces|mckinsey-7s|business-model-canvas",
      "confidence": 0.0-1.0,
      "reasoning": "Brief explanation",
      "focus_areas": ["specific areas to focus on"]
    }
  ]
}

Return 1-3 recommendations, ordered by relevance.`;

/**
 * Recommend consulting frameworks based on engagement context and discovery answers.
 *
 * Uses AI to analyze the engagement details and discovery responses to suggest the most
 * appropriate analytical frameworks (SWOT, Porter's Five Forces, McKinsey 7-S, etc.).
 * Returns 1-3 recommendations ordered by relevance with confidence scores and reasoning.
 *
 * @param engagement - Partial engagement object with title, client info, and description
 * @param discoveryAnswers - Collected discovery question answers
 * @param availableFrameworks - List of available framework templates to choose from
 * @returns Promise resolving to array of framework recommendations with confidence and focus areas
 *
 * @example
 * const recommendations = await recommendFrameworks(
 *   { title: "Market Entry Strategy", client_name: "TechCo", client_industry: "SaaS" },
 *   { "q1": { value: "New market analysis", category: "scope" } },
 *   [swotTemplate, porterTemplate, mckinsey7sTemplate]
 * );
 * // Returns: [{ framework: porterTemplate, confidence: 0.9, reasoning: "..." }]
 */
export async function recommendFrameworks(
  engagement: Pick<Engagement, "title" | "client_name" | "client_industry" | "description">,
  discoveryAnswers: Record<string, DiscoveryAnswer>,
  availableFrameworks: FrameworkTemplate[]
): Promise<FrameworkRecommendation[]> {
  const client = getAnthropicClient();

  const answersText = Object.entries(discoveryAnswers)
    .map(([qId, answer]) => `- ${qId}: ${answer.value}`)
    .join("\n");

  const prompt = `ENGAGEMENT:
Title: ${engagement.title}
Client: ${engagement.client_name}
Industry: ${engagement.client_industry || "Not specified"}
Description: ${engagement.description || "Not provided"}

DISCOVERY ANSWERS:
${answersText || "None collected yet"}

Based on this context, recommend the most appropriate frameworks for this engagement.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: FRAMEWORK_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return parsed.recommendations.map((rec: {
      framework_slug: string;
      confidence: number;
      reasoning: string;
      focus_areas: string[];
    }) => {
      const framework = availableFrameworks.find((f) => f.slug === rec.framework_slug);
      return {
        framework: framework || availableFrameworks[0],
        confidence: rec.confidence,
        reasoning: rec.reasoning,
        suggested_focus_areas: rec.focus_areas,
      };
    });
  } catch (error) {
    console.error("Framework recommendation error:", error);
    // Return default recommendation
    return [
      {
        framework: availableFrameworks[0],
        confidence: 0.5,
        reasoning: "Default recommendation - unable to analyze context",
        suggested_focus_areas: [],
      },
    ];
  }
}

// ============================================
// SCOPE GENERATOR
// ============================================

const SCOPE_SYSTEM_PROMPT = `You are an expert consulting proposal writer. Generate professional Statement of Work (SOW) content based on engagement context and framework analysis.

OUTPUT FORMAT (JSON):
{
  "executive_summary": "2-3 sentence overview",
  "objectives": ["objective 1", "objective 2", ...],
  "deliverables": [
    {
      "id": "D1",
      "name": "Deliverable name",
      "description": "Description",
      "acceptance_criteria": ["criterion 1", "criterion 2"]
    }
  ],
  "timeline": [
    {
      "id": "P1",
      "name": "Phase name",
      "duration_weeks": 2,
      "deliverables": ["D1"],
      "dependencies": []
    }
  ],
  "assumptions": ["assumption 1", "assumption 2"],
  "risks": [
    {
      "id": "R1",
      "description": "Risk description",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low",
      "mitigation": "Mitigation strategy"
    }
  ]
}

Be specific, professional, and realistic. Tailor to the client's industry.`;

/**
 * Generate comprehensive Statement of Work (SOW) from engagement data and framework analysis.
 *
 * Creates a professional SOW document including executive summary, objectives, deliverables,
 * timeline, assumptions, and risk assessment. Analyzes canvas framework data and discovery
 * answers to produce tailored, industry-specific scope documentation.
 *
 * @param input - Scope generation input including engagement details, discovery answers, and canvas data
 * @returns Promise resolving to generated scope with structured deliverables, phases, and risks
 * @throws Error if Anthropic API call fails or JSON parsing fails
 *
 * @example
 * const scope = await generateScope({
 *   engagement: { title: "Digital Transformation", client_name: "Acme" },
 *   discovery_answers: { "q1": { value: "Cloud migration" } },
 *   canvas_data: { nodes: [...], edges: [...] }
 * });
 * // Returns: { executive_summary: "...", objectives: [...], deliverables: [...], timeline: [...] }
 */
export async function generateScope(
  input: ScopeGenerationInput
): Promise<GeneratedScope> {
  const client = getAnthropicClient();

  // Extract insights from canvas
  const canvasInsights = extractCanvasInsights(input.canvas_data);

  const answersText = Object.entries(input.discovery_answers)
    .map(([qId, answer]) => `- ${qId}: ${answer.value}`)
    .join("\n");

  const prompt = `ENGAGEMENT:
Title: ${input.engagement.title}
Client: ${input.engagement.client_name}
Industry: ${input.engagement.client_industry || "Not specified"}
Description: ${input.engagement.description || "Not provided"}

DISCOVERY ANSWERS:
${answersText}

FRAMEWORK ANALYSIS (from canvas):
${canvasInsights}

Generate a comprehensive Statement of Work based on this context.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SCOPE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(jsonMatch[0]) as GeneratedScope;
  } catch (error) {
    console.error("Scope generation error:", error);
    throw error;
  }
}

// Helper to extract insights from canvas data
function extractCanvasInsights(canvasData: CanvasData): string {
  const insights: string[] = [];

  for (const node of canvasData.nodes) {
    if (node.data.items && node.data.items.length > 0) {
      const itemTexts = node.data.items.map((item) => `  - ${item.text}`).join("\n");
      insights.push(`${node.data.label}:\n${itemTexts}`);
    }
  }

  return insights.length > 0 ? insights.join("\n\n") : "No framework analysis completed yet";
}

// ============================================
// CHAT ASSISTANT (for general questions)
// ============================================

const CHAT_SYSTEM_PROMPT = `You are a helpful consulting engagement assistant. Help the consultant with questions about their engagement, frameworks, scoping, or general consulting best practices.

Be concise, practical, and specific to consulting contexts.`;

export async function chatWithAssistant(
  message: string,
  context?: {
    engagement?: Partial<Engagement>;
    canvasData?: CanvasData;
  }
): Promise<string> {
  const client = getAnthropicClient();

  let contextText = "";
  if (context?.engagement) {
    contextText += `\nENGAGEMENT CONTEXT:
Title: ${context.engagement.title}
Client: ${context.engagement.client_name}
Industry: ${context.engagement.client_industry || "Not specified"}`;
  }
  if (context?.canvasData) {
    contextText += `\n\nCANVAS INSIGHTS:\n${extractCanvasInsights(context.canvasData)}`;
  }

  const prompt = contextText ? `${contextText}\n\nUSER QUESTION: ${message}` : message;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: CHAT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}
