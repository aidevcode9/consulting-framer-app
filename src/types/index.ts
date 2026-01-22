// Core types for Consulting Framer
// These match the database schema and provide type safety throughout the app

import type { Node, Edge, Viewport } from "@xyflow/react";

// ============================================
// DATABASE TYPES
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type EngagementStatus =
  | "discovery"
  | "framing"
  | "scoping"
  | "active"
  | "completed"
  | "on_hold";

export interface Engagement {
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  client_industry: string | null;
  description: string | null;
  status: EngagementStatus;
  canvas_data: CanvasData;
  discovery_answers: Record<string, DiscoveryAnswer>;
  discovery_completed: boolean;
  tags: string[];
  estimated_value: number | null;
  estimated_duration_weeks: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface FrameworkTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: FrameworkCategory;
  node_template: FrameworkNodeTemplate;
  usage_count: number;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
}

export type FrameworkCategory =
  | "strategy"
  | "analysis"
  | "planning"
  | "operations";

export interface DiscoveryQuestion {
  id: string;
  question: string;
  description: string | null;
  category: DiscoveryCategory;
  question_type: QuestionType;
  options: QuestionOption[] | null;
  depends_on: string | null;
  show_when: ShowWhenCondition | null;
  sort_order: number;
  is_required: boolean;
  ai_context: string | null;
  follow_up_prompt: string | null;
  created_at: string;
}

export type DiscoveryCategory =
  | "business_context"
  | "problem_definition"
  | "stakeholders"
  | "constraints"
  | "success_criteria";

export type QuestionType =
  | "text"
  | "select"
  | "multi_select"
  | "number"
  | "date"
  | "scale";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ShowWhenCondition {
  question_id: string;
  operator: "equals" | "contains" | "not_empty";
  value?: string;
}

export interface DiscoveryAnswer {
  question_id: string;
  value: string | string[] | number;
  answered_at: string;
  ai_follow_up?: string;
  follow_up_answer?: string;
}

export type DeliverableType = "sow" | "proposal" | "summary" | "report";

export interface Deliverable {
  id: string;
  engagement_id: string;
  title: string;
  type: DeliverableType;
  content: DeliverableContent;
  content_markdown: string | null;
  version: number;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface DeliverableContent {
  sections: DeliverableSection[];
  metadata: {
    generated_at: string;
    model_used: string;
    based_on_canvas: boolean;
  };
}

export interface DeliverableSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface AIInteraction {
  id: string;
  engagement_id: string | null;
  user_id: string;
  interaction_type: AIInteractionType;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  latency_ms: number | null;
  tokens_used: number | null;
  model_used: string | null;
  user_rating: number | null;
  user_feedback: string | null;
  created_at: string;
}

export type AIInteractionType =
  | "discovery"
  | "framework_recommend"
  | "scope_generate"
  | "chat";

// ============================================
// CANVAS TYPES
// ============================================

export interface CanvasData {
  nodes: FrameworkNode[];
  edges: FrameworkEdge[];
  viewport: Viewport;
}

// Base node data that all framework nodes share
export interface BaseNodeData {
  label: string;
  color: string;
  items: NodeItem[];
  description?: string;
  [key: string]: unknown;
}

// Framework-specific node types
export type FrameworkNodeType =
  | "swot"
  | "porter"
  | "mckinsey7s"
  | "bmc"
  | "custom"
  | "note"
  | "image";

export interface FrameworkNode extends Node<BaseNodeData> {
  type: FrameworkNodeType;
}

export interface FrameworkEdge extends Edge {
  data?: {
    label?: string;
    relationship?: string;
  };
}

export interface NodeItem {
  id: string;
  text: string;
  priority?: "high" | "medium" | "low";
  created_at: string;
}

export interface FrameworkNodeTemplate {
  type: FrameworkNodeType;
  sections: FrameworkSection[];
}

export interface FrameworkSection {
  id: string;
  label: string;
  color: string;
  position: { x: number; y: number };
  description?: string;
}

// ============================================
// AI TYPES
// ============================================

export interface DiscoveryContext {
  engagement: Pick<Engagement, "title" | "client_name" | "client_industry">;
  answers: Record<string, DiscoveryAnswer>;
  current_question: DiscoveryQuestion;
}

export interface FrameworkRecommendation {
  framework: FrameworkTemplate;
  confidence: number;
  reasoning: string;
  suggested_focus_areas: string[];
}

export interface ScopeGenerationInput {
  engagement: Engagement;
  canvas_data: CanvasData;
  discovery_answers: Record<string, DiscoveryAnswer>;
}

export interface GeneratedScope {
  executive_summary: string;
  objectives: string[];
  deliverables: ScopeDeliverable[];
  timeline: TimelinePhase[];
  assumptions: string[];
  risks: ScopeRisk[];
  pricing?: PricingEstimate;
}

export interface ScopeDeliverable {
  id: string;
  name: string;
  description: string;
  acceptance_criteria: string[];
}

export interface TimelinePhase {
  id: string;
  name: string;
  duration_weeks: number;
  deliverables: string[];
  dependencies: string[];
}

export interface ScopeRisk {
  id: string;
  description: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  mitigation: string;
}

export interface PricingEstimate {
  total: number;
  breakdown: PricingLineItem[];
  assumptions: string[];
}

export interface PricingLineItem {
  description: string;
  hours: number;
  rate: number;
  total: number;
}

// ============================================
// UI TYPES
// ============================================

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export interface CanvasMode {
  type: "select" | "pan" | "add_node" | "connect";
  nodeTypeToAdd?: FrameworkNodeType;
}

export interface CanvasState {
  selectedNodes: string[];
  selectedEdges: string[];
  mode: CanvasMode;
  isDirty: boolean;
  lastSaved: string | null;
}

// ============================================
// API TYPES
// ============================================

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateEngagementInput {
  title: string;
  client_name: string;
  client_industry?: string;
  description?: string;
}

export interface UpdateEngagementInput {
  title?: string;
  client_name?: string;
  client_industry?: string;
  description?: string;
  status?: EngagementStatus;
  tags?: string[];
  estimated_value?: number;
  estimated_duration_weeks?: number;
}
