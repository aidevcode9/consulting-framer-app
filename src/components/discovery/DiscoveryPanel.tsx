"use client";

import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useDiscoveryStore, useEngagementStore } from "@/lib/store";
import type { DiscoveryQuestion, DiscoveryAnswer } from "@/types";

// Mock questions for demo (in production, fetch from database)
const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "business_context",
    question: "What is the client's primary business or industry?",
    description: "Understanding the client's core business helps frame the engagement.",
    category: "business_context",
    question_type: "text",
    sort_order: 1,
    is_required: true,
    ai_context: "Use this to understand industry-specific challenges.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "company_size",
    question: "What is the approximate company size?",
    description: "Employee count and revenue range helps scope the engagement.",
    category: "business_context",
    question_type: "select",
    options: [
      { value: "startup", label: "Startup (1-50 employees)" },
      { value: "small", label: "Small (51-200 employees)" },
      { value: "medium", label: "Medium (201-1000 employees)" },
      { value: "large", label: "Large (1000+ employees)" },
      { value: "enterprise", label: "Enterprise (10,000+ employees)" },
    ],
    sort_order: 2,
    is_required: true,
    ai_context: "Company size affects solution complexity.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "main_challenge",
    question: "What is the primary challenge or opportunity the client wants to address?",
    description: "The core reason for this engagement.",
    category: "problem_definition",
    question_type: "text",
    sort_order: 3,
    is_required: true,
    ai_context: "This is the central problem statement.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "previous_attempts",
    question: "What has the client already tried to address this challenge?",
    description: "Previous initiatives, solutions, or approaches.",
    category: "problem_definition",
    question_type: "text",
    sort_order: 4,
    is_required: false,
    ai_context: "Understanding past attempts prevents repeating failures.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "success_criteria",
    question: "What does success look like for the client?",
    description: "Specific outcomes or metrics they want to achieve.",
    category: "success_criteria",
    question_type: "text",
    sort_order: 5,
    is_required: true,
    ai_context: "Success criteria should be measurable.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "timeline",
    question: "What is the expected timeline for this engagement?",
    description: "Weeks, months, or specific deadlines.",
    category: "constraints",
    question_type: "text",
    sort_order: 6,
    is_required: true,
    ai_context: "Timeline affects scope significantly.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "budget_range",
    question: "What is the approximate budget range?",
    description: "Budget constraints help scope the engagement appropriately.",
    category: "constraints",
    question_type: "select",
    options: [
      { value: "under_25k", label: "Under $25,000" },
      { value: "25k_50k", label: "$25,000 - $50,000" },
      { value: "50k_100k", label: "$50,000 - $100,000" },
      { value: "100k_250k", label: "$100,000 - $250,000" },
      { value: "over_250k", label: "Over $250,000" },
    ],
    sort_order: 7,
    is_required: false,
    ai_context: "Budget determines solution sophistication.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
];

interface DiscoveryPanelProps {
  onComplete?: () => void;
}

export function DiscoveryPanel({ onComplete }: DiscoveryPanelProps) {
  const {
    answers,
    currentQuestionIndex,
    isComplete,
    aiFollowUp,
    isProcessing,
    setAnswer,
    setCurrentQuestionIndex,
    setComplete,
    setAIFollowUp,
    setProcessing,
  } = useDiscoveryStore();

  const { currentEngagement } = useEngagementStore();

  const [inputValue, setInputValue] = useState("");
  const [followUpValue, setFollowUpValue] = useState("");

  const questions = DISCOVERY_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Get existing answer for current question
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = answers[currentQuestion.id];
      if (existingAnswer) {
        setInputValue(existingAnswer.value as string);
      } else {
        setInputValue("");
      }
    }
  }, [currentQuestion, answers]);

  const handleSubmit = async () => {
    if (!inputValue.trim() && currentQuestion.is_required) return;

    // Save answer
    const answer: DiscoveryAnswer = {
      question_id: currentQuestion.id,
      value: inputValue.trim(),
      answered_at: new Date().toISOString(),
    };
    setAnswer(currentQuestion.id, answer);

    // Check if we should get AI follow-up
    if (currentQuestion.ai_context && inputValue.trim()) {
      setProcessing(true);
      try {
        // In production, call the AI service
        // const result = await generateDiscoveryFollowUp({...});
        // For demo, simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Simulate AI deciding if follow-up is needed
        const needsFollowUp = Math.random() > 0.6;
        if (needsFollowUp) {
          setAIFollowUp(
            `Could you elaborate on how this relates to the ${currentQuestion.category.replace("_", " ")}?`
          );
        } else {
          moveToNext();
        }
      } catch (error) {
        console.error("AI follow-up error:", error);
        moveToNext();
      } finally {
        setProcessing(false);
      }
    } else {
      moveToNext();
    }
  };

  const handleFollowUpSubmit = () => {
    if (!followUpValue.trim()) return;

    // Update answer with follow-up
    const existingAnswer = answers[currentQuestion.id];
    if (existingAnswer) {
      setAnswer(currentQuestion.id, {
        ...existingAnswer,
        ai_follow_up: aiFollowUp || undefined,
        follow_up_answer: followUpValue.trim(),
      });
    }

    setAIFollowUp(null);
    setFollowUpValue("");
    moveToNext();
  };

  const moveToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setInputValue("");
    } else {
      setComplete(true);
      onComplete?.();
    }
  };

  const moveToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isComplete) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          Discovery Complete!
        </h3>
        <p className="mb-6 text-gray-600">
          You've answered all the discovery questions. The AI will now recommend
          frameworks based on your responses.
        </p>
        <button
          onClick={() => {
            setComplete(false);
            setCurrentQuestionIndex(0);
          }}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Review Answers
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="font-medium text-blue-600">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              getCategoryColor(currentQuestion.category)
            }`}
          >
            {formatCategory(currentQuestion.category)}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          {currentQuestion.question}
          {currentQuestion.is_required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </h3>

        {currentQuestion.description && (
          <p className="mb-6 text-sm text-gray-500">
            {currentQuestion.description}
          </p>
        )}

        {/* Input based on question type */}
        {currentQuestion.question_type === "text" ? (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer..."
            className="w-full rounded-lg border border-gray-300 p-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
            disabled={isProcessing || !!aiFollowUp}
          />
        ) : currentQuestion.question_type === "select" ? (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => setInputValue(option.value)}
                disabled={isProcessing || !!aiFollowUp}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  inputValue === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}

        {/* AI Follow-up */}
        {aiFollowUp && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">AI Follow-up</span>
            </div>
            <p className="mb-4 text-sm text-amber-700">{aiFollowUp}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpValue}
                onChange={(e) => setFollowUpValue(e.target.value)}
                placeholder="Your response..."
                className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFollowUpSubmit();
                }}
              />
              <button
                onClick={handleFollowUpSubmit}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setAIFollowUp(null);
                  moveToNext();
                }}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={moveToPrevious}
            disabled={currentQuestionIndex === 0 || isProcessing}
            className="flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              (currentQuestion.is_required && !inputValue.trim()) ||
              isProcessing ||
              !!aiFollowUp
            }
            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentQuestionIndex === questions.length - 1 ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    business_context: "bg-blue-100 text-blue-700",
    problem_definition: "bg-purple-100 text-purple-700",
    stakeholders: "bg-green-100 text-green-700",
    constraints: "bg-orange-100 text-orange-700",
    success_criteria: "bg-emerald-100 text-emerald-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
}

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
