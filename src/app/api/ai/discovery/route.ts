import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const DISCOVERY_SYSTEM_PROMPT = `You are an expert consulting engagement discovery assistant. Your role is to help consultants gather comprehensive information about client engagements through intelligent follow-up questions.

GUIDELINES:
1. Ask clarifying questions that uncover hidden requirements and risks
2. Identify stakeholders and their motivations
3. Probe for success criteria and constraints
4. Look for scope creep indicators
5. Be conversational but efficient
6. Focus on information that directly impacts engagement scoping

RESPONSE FORMAT:
Return a JSON object with:
{
  "followUp": "Your follow-up question or null if complete",
  "isComplete": true/false,
  "insights": ["Key insight 1", "Key insight 2"],
  "suggestedFrameworks": ["framework-slug-1", "framework-slug-2"]
}

If the answer is complete and comprehensive, set isComplete to true and followUp to null.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { engagement, answers, currentQuestion } = body;

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return mock response for demo without API key
      return NextResponse.json({
        followUp: null,
        isComplete: true,
        insights: ["Consider exploring stakeholder alignment"],
        suggestedFrameworks: ["swot", "mckinsey-7s"],
      });
    }

    const client = new Anthropic({ apiKey });

    const answersText = Object.entries(answers as Record<string, { value: string }>)
      .map(([qId, answer]) => `Q: ${qId}\nA: ${answer.value}`)
      .join("\n\n");

    const prompt = `ENGAGEMENT CONTEXT:
Client: ${engagement.client_name}
Industry: ${engagement.client_industry || "Not specified"}
Title: ${engagement.title}

PREVIOUS ANSWERS:
${answersText || "None yet"}

CURRENT QUESTION:
${currentQuestion.question}
${currentQuestion.description ? `(${currentQuestion.description})` : ""}

AI CONTEXT:
${currentQuestion.ai_context || "Standard question"}

Analyze the context and determine if a follow-up question is needed. Return JSON only.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: DISCOVERY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        followUp: null,
        isComplete: true,
        insights: [],
        suggestedFrameworks: [],
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Discovery API error:", error);
    return NextResponse.json(
      { error: "Failed to process discovery" },
      { status: 500 }
    );
  }
}
