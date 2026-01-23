/**
 * Discovery Questions Data
 * FR-407: Question branching - includes conditional questions
 * FR-408: Discovery templates - industry-specific question sets (future)
 *
 * Questions can have branching conditions via `show_when`:
 * - equals: Show when answer exactly matches value
 * - contains: Show when answer contains value
 * - not_empty: Show when question has any answer
 */

import type { DiscoveryQuestion } from "@/types";

/**
 * Core discovery questions with branching conditions
 */
export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  // ============================================
  // BUSINESS CONTEXT
  // ============================================
  {
    id: "business_context",
    question: "What is the client's primary business or industry?",
    description: "Understanding the client's core business helps frame the engagement.",
    category: "business_context",
    question_type: "text",
    options: null,
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

  // ============================================
  // CONDITIONAL: ENTERPRISE-SPECIFIC QUESTIONS
  // ============================================
  {
    id: "enterprise_structure",
    question: "How is the organization structured?",
    description: "Understanding the org structure helps identify stakeholders and decision-makers.",
    category: "business_context",
    question_type: "select",
    options: [
      { value: "centralized", label: "Centralized - Single HQ makes decisions" },
      { value: "decentralized", label: "Decentralized - Business units operate independently" },
      { value: "matrix", label: "Matrix - Cross-functional reporting" },
      { value: "hybrid", label: "Hybrid - Mix of structures" },
    ],
    sort_order: 3,
    is_required: false,
    ai_context: "Enterprise structure affects change management approach.",
    depends_on: "company_size",
    show_when: {
      question_id: "company_size",
      operator: "equals",
      value: "enterprise",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "enterprise_regions",
    question: "How many regions or countries does the organization operate in?",
    description: "Geographic spread affects implementation complexity.",
    category: "business_context",
    question_type: "select",
    options: [
      { value: "single", label: "Single country" },
      { value: "regional", label: "Regional (2-5 countries)" },
      { value: "multinational", label: "Multinational (6-20 countries)" },
      { value: "global", label: "Global (20+ countries)" },
    ],
    sort_order: 4,
    is_required: false,
    ai_context: "Geographic spread affects rollout strategy.",
    depends_on: "company_size",
    show_when: {
      question_id: "company_size",
      operator: "equals",
      value: "enterprise",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // CONDITIONAL: STARTUP-SPECIFIC QUESTIONS
  // ============================================
  {
    id: "startup_stage",
    question: "What stage is the startup currently in?",
    description: "Startup stage affects strategic priorities and resource constraints.",
    category: "business_context",
    question_type: "select",
    options: [
      { value: "pre_seed", label: "Pre-seed / Ideation" },
      { value: "seed", label: "Seed / MVP" },
      { value: "series_a", label: "Series A / Growth" },
      { value: "series_b_plus", label: "Series B+ / Scaling" },
    ],
    sort_order: 5,
    is_required: false,
    ai_context: "Startup stage determines strategic recommendations.",
    depends_on: "company_size",
    show_when: {
      question_id: "company_size",
      operator: "equals",
      value: "startup",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "startup_funding",
    question: "What is the current funding/runway situation?",
    description: "Financial constraints affect project scope and timeline.",
    category: "constraints",
    question_type: "select",
    options: [
      { value: "bootstrapped", label: "Bootstrapped / Self-funded" },
      { value: "funded_short", label: "Funded, < 12 months runway" },
      { value: "funded_long", label: "Funded, 12+ months runway" },
      { value: "profitable", label: "Profitable / Cash flow positive" },
    ],
    sort_order: 6,
    is_required: false,
    ai_context: "Runway affects urgency and budget flexibility.",
    depends_on: "company_size",
    show_when: {
      question_id: "company_size",
      operator: "equals",
      value: "startup",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // PROBLEM DEFINITION
  // ============================================
  {
    id: "main_challenge",
    question: "What is the primary challenge or opportunity the client wants to address?",
    description: "The core reason for this engagement.",
    category: "problem_definition",
    question_type: "text",
    options: null,
    sort_order: 10,
    is_required: true,
    ai_context: "This is the central problem statement.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // CONDITIONAL: GROWTH CHALLENGES
  // ============================================
  {
    id: "growth_bottleneck",
    question: "What is the biggest bottleneck to growth?",
    description: "Identifying the constraint helps focus recommendations.",
    category: "problem_definition",
    question_type: "select",
    options: [
      { value: "sales", label: "Sales / Revenue generation" },
      { value: "product", label: "Product / Service capacity" },
      { value: "people", label: "People / Talent" },
      { value: "capital", label: "Capital / Funding" },
      { value: "operations", label: "Operations / Infrastructure" },
      { value: "market", label: "Market / Demand" },
    ],
    sort_order: 11,
    is_required: false,
    ai_context: "Growth bottleneck determines framework focus.",
    depends_on: "main_challenge",
    show_when: {
      question_id: "main_challenge",
      operator: "contains",
      value: "growth",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // CONDITIONAL: COST CHALLENGES
  // ============================================
  {
    id: "cost_focus_area",
    question: "Which cost areas are you primarily focused on?",
    description: "Understanding cost priorities helps target analysis.",
    category: "problem_definition",
    question_type: "select",
    options: [
      { value: "labor", label: "Labor / Headcount" },
      { value: "technology", label: "Technology / IT" },
      { value: "operations", label: "Operations / Supply chain" },
      { value: "overhead", label: "Overhead / Administrative" },
      { value: "all", label: "All areas - comprehensive review" },
    ],
    sort_order: 12,
    is_required: false,
    ai_context: "Cost focus area determines analysis scope.",
    depends_on: "main_challenge",
    show_when: {
      question_id: "main_challenge",
      operator: "contains",
      value: "cost",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // PREVIOUS ATTEMPTS
  // ============================================
  {
    id: "previous_attempts",
    question: "What has the client already tried to address this challenge?",
    description: "Previous initiatives, solutions, or approaches.",
    category: "problem_definition",
    question_type: "text",
    options: null,
    sort_order: 15,
    is_required: false,
    ai_context: "Understanding past attempts prevents repeating failures.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // CONDITIONAL: FAILED ATTEMPTS FOLLOW-UP
  // ============================================
  {
    id: "failure_reasons",
    question: "Why do you think previous attempts didn't succeed?",
    description: "Understanding failure modes helps avoid repeating them.",
    category: "problem_definition",
    question_type: "text",
    options: null,
    sort_order: 16,
    is_required: false,
    ai_context: "Failure analysis informs risk mitigation.",
    depends_on: "previous_attempts",
    show_when: {
      question_id: "previous_attempts",
      operator: "not_empty",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // SUCCESS CRITERIA
  // ============================================
  {
    id: "success_criteria",
    question: "What does success look like for the client?",
    description: "Specific outcomes or metrics they want to achieve.",
    category: "success_criteria",
    question_type: "text",
    options: null,
    sort_order: 20,
    is_required: true,
    ai_context: "Success criteria should be measurable.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "success_metrics",
    question: "Are there specific KPIs or metrics you're targeting?",
    description: "Quantifiable targets help measure engagement success.",
    category: "success_criteria",
    question_type: "text",
    options: null,
    sort_order: 21,
    is_required: false,
    ai_context: "Specific metrics enable tracking and accountability.",
    depends_on: "success_criteria",
    show_when: {
      question_id: "success_criteria",
      operator: "not_empty",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // CONSTRAINTS
  // ============================================
  {
    id: "timeline",
    question: "What is the expected timeline for this engagement?",
    description: "Weeks, months, or specific deadlines.",
    category: "constraints",
    question_type: "text",
    options: null,
    sort_order: 25,
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
    sort_order: 26,
    is_required: false,
    ai_context: "Budget determines solution sophistication.",
    depends_on: null,
    show_when: null,
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },

  // ============================================
  // CONDITIONAL: LARGE BUDGET QUESTIONS
  // ============================================
  {
    id: "budget_allocation",
    question: "How should the budget be prioritized?",
    description: "Understanding allocation preferences guides recommendations.",
    category: "constraints",
    question_type: "select",
    options: [
      { value: "analysis", label: "Deep analysis and research" },
      { value: "implementation", label: "Implementation support" },
      { value: "technology", label: "Technology and tools" },
      { value: "balanced", label: "Balanced across all areas" },
    ],
    sort_order: 27,
    is_required: false,
    ai_context: "Budget allocation affects deliverable focus.",
    depends_on: "budget_range",
    show_when: {
      question_id: "budget_range",
      operator: "equals",
      value: "over_250k",
    },
    follow_up_prompt: null,
    created_at: new Date().toISOString(),
  },
];

/**
 * Get questions sorted by sort_order
 */
export function getSortedQuestions(): DiscoveryQuestion[] {
  return [...DISCOVERY_QUESTIONS].sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string): DiscoveryQuestion | undefined {
  return DISCOVERY_QUESTIONS.find((q) => q.id === id);
}
