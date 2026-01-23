/**
 * Discovery Question Branching Logic
 * FR-407: Question branching
 *
 * Evaluates branching conditions to determine which questions to show
 * based on previous answers.
 */

import type {
  DiscoveryQuestion,
  DiscoveryAnswer,
  ShowWhenCondition,
} from "@/types";

/**
 * Evaluate a single branching condition against answers
 */
export function evaluateCondition(
  condition: ShowWhenCondition,
  answers: Record<string, DiscoveryAnswer>
): boolean {
  const answer = answers[condition.question_id];

  if (!answer) {
    // No answer yet - condition fails unless we're checking for empty
    return false;
  }

  const value = String(answer.value).toLowerCase().trim();
  const conditionValue = condition.value?.toLowerCase().trim() || "";

  switch (condition.operator) {
    case "equals":
      return value === conditionValue;

    case "contains":
      return value.includes(conditionValue);

    case "not_empty":
      return value.length > 0;

    default:
      return false;
  }
}

/**
 * Check if a question should be shown based on its branching conditions
 */
export function shouldShowQuestion(
  question: DiscoveryQuestion,
  answers: Record<string, DiscoveryAnswer>
): boolean {
  // No branching condition - always show
  if (!question.show_when) {
    return true;
  }

  // Evaluate the branching condition
  return evaluateCondition(question.show_when, answers);
}

/**
 * Filter questions based on branching conditions
 * Returns only questions that should be visible given current answers
 */
export function filterVisibleQuestions(
  questions: DiscoveryQuestion[],
  answers: Record<string, DiscoveryAnswer>
): DiscoveryQuestion[] {
  return questions.filter((q) => shouldShowQuestion(q, answers));
}

/**
 * Get the next question index based on visible questions
 * Skips questions that don't meet their branching conditions
 */
export function getNextVisibleQuestionIndex(
  questions: DiscoveryQuestion[],
  currentIndex: number,
  answers: Record<string, DiscoveryAnswer>
): number | null {
  const visibleQuestions = filterVisibleQuestions(questions, answers);

  // Find current question in visible list
  const currentQuestion = questions[currentIndex];
  const currentVisibleIndex = visibleQuestions.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  // Get next visible question
  const nextVisibleIndex = currentVisibleIndex + 1;
  if (nextVisibleIndex >= visibleQuestions.length) {
    return null; // No more questions
  }

  // Find this question's index in the original list
  const nextQuestion = visibleQuestions[nextVisibleIndex];
  return questions.findIndex((q) => q.id === nextQuestion.id);
}

/**
 * Get the previous question index based on visible questions
 */
export function getPreviousVisibleQuestionIndex(
  questions: DiscoveryQuestion[],
  currentIndex: number,
  answers: Record<string, DiscoveryAnswer>
): number | null {
  const visibleQuestions = filterVisibleQuestions(questions, answers);

  // Find current question in visible list
  const currentQuestion = questions[currentIndex];
  const currentVisibleIndex = visibleQuestions.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  // Get previous visible question
  const prevVisibleIndex = currentVisibleIndex - 1;
  if (prevVisibleIndex < 0) {
    return null; // At the beginning
  }

  // Find this question's index in the original list
  const prevQuestion = visibleQuestions[prevVisibleIndex];
  return questions.findIndex((q) => q.id === prevQuestion.id);
}

/**
 * Calculate progress based on visible questions only
 */
export function calculateProgress(
  questions: DiscoveryQuestion[],
  currentIndex: number,
  answers: Record<string, DiscoveryAnswer>
): { current: number; total: number; percentage: number } {
  const visibleQuestions = filterVisibleQuestions(questions, answers);
  const currentQuestion = questions[currentIndex];
  const currentVisibleIndex = visibleQuestions.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  const current = currentVisibleIndex + 1;
  const total = visibleQuestions.length;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return { current, total, percentage };
}
