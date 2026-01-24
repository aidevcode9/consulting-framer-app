"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  GitBranch,
  LayoutTemplate,
} from "lucide-react";
import { useDiscoveryStore } from "@/lib/store";
import { getQuestionsForTemplate, getTemplateById } from "@/lib/discovery/templates";
import {
  filterVisibleQuestions,
  calculateProgress,
} from "@/lib/discovery/branching";
import { TemplateSelector } from "./TemplateSelector";
import type { DiscoveryAnswer } from "@/types";

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
    selectedTemplateId,
    setAnswer,
    setCurrentQuestionIndex,
    setComplete,
    setAIFollowUp,
    setSelectedTemplate,
  } = useDiscoveryStore();

  const [inputValue, setInputValue] = useState("");
  const [followUpValue, setFollowUpValue] = useState("");

  // FR-408: Get questions based on selected template
  const allQuestions = useMemo(
    () => getQuestionsForTemplate(selectedTemplateId || "general"),
    [selectedTemplateId]
  );

  // Get selected template info for display
  const selectedTemplate = useMemo(
    () => (selectedTemplateId ? getTemplateById(selectedTemplateId) : null),
    [selectedTemplateId]
  );

  // FR-407: Filter questions based on branching conditions
  const visibleQuestions = useMemo(
    () => filterVisibleQuestions(allQuestions, answers),
    [allQuestions, answers]
  );

  // Find current question in visible list
  const currentVisibleIndex = useMemo(() => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (!currentQuestion) return 0;
    const idx = visibleQuestions.findIndex((q) => q.id === currentQuestion.id);
    return idx >= 0 ? idx : 0;
  }, [allQuestions, currentQuestionIndex, visibleQuestions]);

  const currentQuestion = visibleQuestions[currentVisibleIndex];

  // Calculate progress based on visible questions only
  const progressInfo = useMemo(
    () => calculateProgress(allQuestions, currentQuestionIndex, answers),
    [allQuestions, currentQuestionIndex, answers]
  );

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

  // Ensure we're on a visible question when answers change
  useEffect(() => {
    if (!currentQuestion && visibleQuestions.length > 0) {
      // Current question is not visible, find the first visible question
      const firstVisible = visibleQuestions[0];
      const newIndex = allQuestions.findIndex((q) => q.id === firstVisible.id);
      if (newIndex >= 0) {
        setCurrentQuestionIndex(newIndex);
      }
    }
  }, [currentQuestion, visibleQuestions, allQuestions, setCurrentQuestionIndex]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentQuestionIndex(0);
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    if (!inputValue.trim() && currentQuestion.is_required) return;

    // Save answer
    const answer: DiscoveryAnswer = {
      question_id: currentQuestion.id,
      value: inputValue.trim(),
      answered_at: new Date().toISOString(),
    };
    setAnswer(currentQuestion.id, answer);

    // Move to next question (AI follow-ups disabled in mock mode)
    // In production with API key, this would call /api/ai/discovery for intelligent follow-ups
    moveToNext();
  };

  const handleFollowUpSubmit = () => {
    if (!followUpValue.trim() || !currentQuestion) return;

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
    // After saving an answer, recalculate visible questions
    // The next visible question might be different due to branching
    const updatedVisibleQuestions = filterVisibleQuestions(allQuestions, answers);
    const nextVisibleIndex = currentVisibleIndex + 1;

    if (nextVisibleIndex < updatedVisibleQuestions.length) {
      const nextQuestion = updatedVisibleQuestions[nextVisibleIndex];
      const newIndex = allQuestions.findIndex((q) => q.id === nextQuestion.id);
      setCurrentQuestionIndex(newIndex);
      setInputValue("");
    } else {
      setComplete(true);
      onComplete?.();
    }
  };

  const moveToPrevious = () => {
    if (currentVisibleIndex > 0) {
      const prevQuestion = visibleQuestions[currentVisibleIndex - 1];
      const newIndex = allQuestions.findIndex((q) => q.id === prevQuestion.id);
      setCurrentQuestionIndex(newIndex);
    }
  };

  // FR-408: Show template selector if no template selected
  if (!selectedTemplateId) {
    return <TemplateSelector onSelect={handleTemplateSelect} />;
  }

  if (isComplete) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          Discovery Complete!
        </h3>
        <p className="mb-4 text-gray-600">
          Great job! You&apos;ve completed the discovery questionnaire.
        </p>

        {/* Next Steps */}
        <div className="mb-6 w-full max-w-xs rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
          <h4 className="mb-2 text-sm font-semibold text-blue-800">Next Steps:</h4>
          <ol className="space-y-1 text-sm text-blue-700">
            <li>1. Open the <strong>Frameworks</strong> panel on the left</li>
            <li>2. Click <strong>AI Recommended</strong> to get suggestions</li>
            <li>3. Drag frameworks to the canvas to analyze</li>
            <li>4. Generate your <strong>SOW</strong> or <strong>Proposal</strong></li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setComplete(false);
              setCurrentQuestionIndex(0);
            }}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Review Answers
          </button>
          <button
            onClick={() => {
              // Reset to allow re-discovery with different template
              setSelectedTemplate(null);
              setComplete(false);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start New Discovery
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check if this is a conditional question (has branching)
  const isConditionalQuestion = !!currentQuestion.show_when;

  return (
    <div className="flex h-full flex-col">
      {/* Template indicator + Progress bar */}
      <div className="px-6 pt-4">
        {/* Template badge */}
        {selectedTemplate && (
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100"
            >
              <LayoutTemplate className="h-3 w-3" />
              {selectedTemplate.name}
              <span className="text-purple-400">×</span>
            </button>
          </div>
        )}
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Question {progressInfo.current} of {progressInfo.total}
          </span>
          <span className="font-medium text-blue-600">
            {progressInfo.percentage}% complete
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressInfo.percentage}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(currentQuestion.category)}`}
          >
            {formatCategory(currentQuestion.category)}
          </span>
          {isConditionalQuestion && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              <GitBranch className="h-3 w-3" />
              Follow-up
            </span>
          )}
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
            disabled={currentVisibleIndex === 0 || isProcessing}
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
            ) : currentVisibleIndex === visibleQuestions.length - 1 ? (
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
