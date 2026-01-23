/**
 * AI Client Abstraction
 * FR-402: AI follow-up questions
 *
 * Supports:
 * - Anthropic Claude (default)
 * - Google Gemini 2.0 Flash (via AI_PROVIDER=gemini)
 *
 * Features:
 * - 30s timeout on all requests
 * - Telemetry logging for all calls
 * - Request ID tracking
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createLogger } from "@/lib/logger";
import { AIServiceError } from "@/lib/errors";

const log = createLogger("AI");

// Default timeout: 30 seconds
const DEFAULT_TIMEOUT_MS = 30000;

export type AIProvider = "anthropic" | "gemini";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  timeoutMs?: number;
}

export interface AICompletionResult {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  model: string;
  provider: AIProvider;
  latencyMs: number;
  requestId: string;
}

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Get configured provider (default: anthropic)
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === "gemini") return "gemini";
  return "anthropic";
}

// Get model based on provider
function getModel(provider: AIProvider): string {
  if (provider === "gemini") {
    return process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
}

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  requestId: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new AIServiceError(`AI request timed out after ${timeoutMs}ms`, {
          requestId,
          timeoutMs,
        })
      );
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Generate a completion using the configured AI provider
 */
export async function generateCompletion(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const provider = getAIProvider();
  const model = getModel(provider);
  const {
    maxTokens = 1024,
    temperature = 0.7,
    systemPrompt,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;
  const requestId = generateRequestId();

  // Telemetry: Log request start
  log.info("AI request started", {
    requestId,
    provider,
    model,
    maxTokens,
    temperature,
    messageCount: messages.length,
    promptLength: messages.reduce((sum, m) => sum + m.content.length, 0),
  });

  const startTime = Date.now();

  try {
    type PartialResult = Omit<AICompletionResult, "latencyMs" | "requestId">;
    let partialResult: PartialResult;

    if (provider === "gemini") {
      partialResult = await withTimeout(
        generateGeminiCompletion(
          messages,
          model,
          maxTokens,
          temperature,
          systemPrompt,
          requestId
        ),
        timeoutMs,
        requestId
      );
    } else {
      partialResult = await withTimeout(
        generateAnthropicCompletion(
          messages,
          model,
          maxTokens,
          temperature,
          systemPrompt,
          requestId
        ),
        timeoutMs,
        requestId
      );
    }

    const latencyMs = Date.now() - startTime;

    // Telemetry: Log successful completion
    log.info("AI request completed", {
      requestId,
      provider,
      model,
      latencyMs,
      inputTokens: partialResult.tokensUsed.input,
      outputTokens: partialResult.tokensUsed.output,
      totalTokens: partialResult.tokensUsed.input + partialResult.tokensUsed.output,
      responseLength: partialResult.content.length,
    });

    return { ...partialResult, latencyMs, requestId };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    // Telemetry: Log failure
    log.error("AI request failed", {
      requestId,
      provider,
      model,
      latencyMs,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError(
      `AI completion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { requestId, provider, error }
    );
  }
}

/**
 * Anthropic Claude completion
 */
async function generateAnthropicCompletion(
  messages: AIMessage[],
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt: string | undefined,
  requestId: string
): Promise<Omit<AICompletionResult, "latencyMs" | "requestId">> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AIServiceError("ANTHROPIC_API_KEY not configured");
  }

  const client = new Anthropic({ apiKey });

  log.debug("Calling Anthropic API", { requestId, model });

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textContent = response.content.find((c) => c.type === "text");
  const content = textContent?.type === "text" ? textContent.text : "";

  return {
    content,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    model,
    provider: "anthropic",
  };
}

/**
 * Google Gemini completion
 */
async function generateGeminiCompletion(
  messages: AIMessage[],
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt: string | undefined,
  requestId: string
): Promise<Omit<AICompletionResult, "latencyMs" | "requestId">> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIServiceError("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
    },
    systemInstruction: systemPrompt,
  });

  log.debug("Calling Gemini API", { requestId, model });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = geminiModel.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const content = response.text();

  // Gemini doesn't always return token counts
  const usage = response.usageMetadata;

  return {
    content,
    tokensUsed: {
      input: usage?.promptTokenCount || 0,
      output: usage?.candidatesTokenCount || 0,
    },
    model,
    provider: "gemini",
  };
}
