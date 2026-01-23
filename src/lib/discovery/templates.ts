/**
 * Discovery Templates
 * FR-408: Industry-specific question sets
 *
 * Templates provide pre-configured question sets tailored to specific industries.
 * Each template can add additional questions or modify the display of base questions.
 */

import type { DiscoveryQuestion } from "@/types";
import { DISCOVERY_QUESTIONS } from "./questions";

export interface DiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  additionalQuestions: DiscoveryQuestion[];
}

/**
 * Technology/SaaS Template
 * Focused on product-market fit, tech stack, and scaling
 */
const TECH_TEMPLATE: DiscoveryTemplate = {
  id: "tech",
  name: "Technology / SaaS",
  description: "Product-market fit, tech stack, scaling, and user acquisition",
  industry: "technology",
  icon: "Code",
  color: "bg-blue-500",
  additionalQuestions: [
    {
      id: "tech_current_stack",
      question: "What is the current technology stack?",
      description: "Languages, frameworks, cloud providers, and key tools.",
      category: "business_context",
      question_type: "text",
      options: null,
      sort_order: 7,
      is_required: false,
      ai_context: "Tech stack affects modernization recommendations.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "tech_user_metrics",
      question: "What are the key user/product metrics being tracked?",
      description: "DAU, MAU, retention, churn, NPS, etc.",
      category: "success_criteria",
      question_type: "text",
      options: null,
      sort_order: 22,
      is_required: false,
      ai_context: "Product metrics determine focus areas.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "tech_scaling_challenge",
      question: "What scaling challenges are you facing?",
      description: "Performance, infrastructure, team size, or process.",
      category: "problem_definition",
      question_type: "select",
      options: [
        { value: "technical", label: "Technical scaling (infrastructure, performance)" },
        { value: "team", label: "Team scaling (hiring, processes, culture)" },
        { value: "product", label: "Product scaling (features, markets)" },
        { value: "customer", label: "Customer scaling (support, success)" },
        { value: "multiple", label: "Multiple areas" },
      ],
      sort_order: 13,
      is_required: false,
      ai_context: "Scaling challenges determine framework selection.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
  ],
};

/**
 * Healthcare Template
 * Focused on compliance, patient outcomes, and operational efficiency
 */
const HEALTHCARE_TEMPLATE: DiscoveryTemplate = {
  id: "healthcare",
  name: "Healthcare",
  description: "Compliance, patient outcomes, operational efficiency",
  industry: "healthcare",
  icon: "Heart",
  color: "bg-red-500",
  additionalQuestions: [
    {
      id: "hc_compliance",
      question: "What regulatory frameworks apply to your operations?",
      description: "HIPAA, HITECH, state regulations, etc.",
      category: "constraints",
      question_type: "text",
      options: null,
      sort_order: 28,
      is_required: false,
      ai_context: "Compliance requirements constrain solution options.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "hc_patient_type",
      question: "What type of patients or services do you primarily serve?",
      description: "Acute care, primary care, specialty, behavioral health, etc.",
      category: "business_context",
      question_type: "text",
      options: null,
      sort_order: 7,
      is_required: false,
      ai_context: "Patient type affects operational recommendations.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "hc_outcome_focus",
      question: "What patient outcomes are you trying to improve?",
      description: "Quality scores, readmission rates, patient satisfaction, etc.",
      category: "success_criteria",
      question_type: "text",
      options: null,
      sort_order: 22,
      is_required: false,
      ai_context: "Outcome focus determines KPIs and recommendations.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "hc_ehr_system",
      question: "What EHR/EMR system are you using?",
      description: "Epic, Cerner, Meditech, AllScripts, or other.",
      category: "business_context",
      question_type: "select",
      options: [
        { value: "epic", label: "Epic" },
        { value: "cerner", label: "Cerner (Oracle Health)" },
        { value: "meditech", label: "Meditech" },
        { value: "allscripts", label: "AllScripts" },
        { value: "other", label: "Other" },
        { value: "none", label: "No EHR system" },
      ],
      sort_order: 8,
      is_required: false,
      ai_context: "EHR system affects integration recommendations.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
  ],
};

/**
 * Retail/E-commerce Template
 * Focused on customer experience, omnichannel, and supply chain
 */
const RETAIL_TEMPLATE: DiscoveryTemplate = {
  id: "retail",
  name: "Retail / E-commerce",
  description: "Customer experience, omnichannel strategy, supply chain",
  industry: "retail",
  icon: "ShoppingCart",
  color: "bg-green-500",
  additionalQuestions: [
    {
      id: "retail_channels",
      question: "What sales channels do you currently operate?",
      description: "Physical stores, e-commerce, marketplace, wholesale, etc.",
      category: "business_context",
      question_type: "text",
      options: null,
      sort_order: 7,
      is_required: false,
      ai_context: "Channel mix affects omnichannel strategy.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "retail_customer_segment",
      question: "Who is your primary customer segment?",
      description: "Demographics, psychographics, buying behavior.",
      category: "business_context",
      question_type: "text",
      options: null,
      sort_order: 8,
      is_required: false,
      ai_context: "Customer segment drives marketing and CX strategy.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "retail_supply_chain",
      question: "What are your biggest supply chain challenges?",
      description: "Inventory, fulfillment, suppliers, logistics.",
      category: "problem_definition",
      question_type: "select",
      options: [
        { value: "inventory", label: "Inventory management" },
        { value: "fulfillment", label: "Order fulfillment speed" },
        { value: "supplier", label: "Supplier reliability" },
        { value: "logistics", label: "Logistics costs" },
        { value: "forecasting", label: "Demand forecasting" },
        { value: "none", label: "No major supply chain issues" },
      ],
      sort_order: 13,
      is_required: false,
      ai_context: "Supply chain challenges affect operations strategy.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
  ],
};

/**
 * Financial Services Template
 * Focused on regulatory compliance, risk management, and digital transformation
 */
const FINANCE_TEMPLATE: DiscoveryTemplate = {
  id: "finance",
  name: "Financial Services",
  description: "Regulatory compliance, risk management, digital transformation",
  industry: "financial_services",
  icon: "DollarSign",
  color: "bg-yellow-500",
  additionalQuestions: [
    {
      id: "fin_entity_type",
      question: "What type of financial institution is this?",
      description: "Bank, credit union, insurance, investment, fintech, etc.",
      category: "business_context",
      question_type: "select",
      options: [
        { value: "bank", label: "Commercial Bank" },
        { value: "credit_union", label: "Credit Union" },
        { value: "insurance", label: "Insurance Company" },
        { value: "investment", label: "Investment Firm / Asset Manager" },
        { value: "fintech", label: "Fintech / Neobank" },
        { value: "payments", label: "Payments / Processing" },
        { value: "other", label: "Other Financial Services" },
      ],
      sort_order: 7,
      is_required: false,
      ai_context: "Entity type affects regulatory and competitive landscape.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "fin_regulatory",
      question: "Which regulatory bodies oversee your operations?",
      description: "OCC, FDIC, SEC, FINRA, state regulators, etc.",
      category: "constraints",
      question_type: "text",
      options: null,
      sort_order: 28,
      is_required: false,
      ai_context: "Regulatory oversight constrains solution options.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "fin_digital_priority",
      question: "What is the primary digital transformation priority?",
      description: "Customer experience, operations, risk, compliance, or innovation.",
      category: "problem_definition",
      question_type: "select",
      options: [
        { value: "customer", label: "Digital customer experience" },
        { value: "operations", label: "Operational efficiency" },
        { value: "risk", label: "Risk management modernization" },
        { value: "compliance", label: "Regulatory compliance" },
        { value: "innovation", label: "Product/service innovation" },
      ],
      sort_order: 13,
      is_required: false,
      ai_context: "Digital priority determines strategic focus.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
  ],
};

/**
 * Manufacturing Template
 * Focused on operational excellence, supply chain, and Industry 4.0
 */
const MANUFACTURING_TEMPLATE: DiscoveryTemplate = {
  id: "manufacturing",
  name: "Manufacturing",
  description: "Operational excellence, supply chain, Industry 4.0",
  industry: "manufacturing",
  icon: "Factory",
  color: "bg-gray-500",
  additionalQuestions: [
    {
      id: "mfg_type",
      question: "What type of manufacturing do you do?",
      description: "Discrete, process, batch, continuous, etc.",
      category: "business_context",
      question_type: "select",
      options: [
        { value: "discrete", label: "Discrete manufacturing" },
        { value: "process", label: "Process manufacturing" },
        { value: "batch", label: "Batch production" },
        { value: "continuous", label: "Continuous production" },
        { value: "mixed", label: "Mixed / Multiple types" },
      ],
      sort_order: 7,
      is_required: false,
      ai_context: "Manufacturing type affects operational recommendations.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "mfg_automation",
      question: "What is the current level of automation?",
      description: "Manual, semi-automated, highly automated, or smart factory.",
      category: "business_context",
      question_type: "select",
      options: [
        { value: "manual", label: "Mostly manual operations" },
        { value: "semi", label: "Semi-automated" },
        { value: "automated", label: "Highly automated" },
        { value: "smart", label: "Smart factory / Industry 4.0" },
      ],
      sort_order: 8,
      is_required: false,
      ai_context: "Automation level affects digital transformation strategy.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "mfg_ops_focus",
      question: "What operational metric are you most focused on improving?",
      description: "OEE, quality, lead time, inventory, safety, etc.",
      category: "success_criteria",
      question_type: "select",
      options: [
        { value: "oee", label: "Overall Equipment Effectiveness (OEE)" },
        { value: "quality", label: "Quality / Defect reduction" },
        { value: "lead_time", label: "Lead time reduction" },
        { value: "inventory", label: "Inventory optimization" },
        { value: "safety", label: "Safety metrics" },
        { value: "sustainability", label: "Sustainability / Emissions" },
      ],
      sort_order: 22,
      is_required: false,
      ai_context: "Operational focus determines KPIs and frameworks.",
      depends_on: null,
      show_when: null,
      follow_up_prompt: null,
      created_at: new Date().toISOString(),
    },
  ],
};

/**
 * General Template (no industry-specific questions)
 */
const GENERAL_TEMPLATE: DiscoveryTemplate = {
  id: "general",
  name: "General Business",
  description: "Standard discovery for any industry",
  industry: "general",
  icon: "Briefcase",
  color: "bg-purple-500",
  additionalQuestions: [],
};

/**
 * All available templates
 */
export const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  GENERAL_TEMPLATE,
  TECH_TEMPLATE,
  HEALTHCARE_TEMPLATE,
  RETAIL_TEMPLATE,
  FINANCE_TEMPLATE,
  MANUFACTURING_TEMPLATE,
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): DiscoveryTemplate | undefined {
  return DISCOVERY_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get questions for a specific template
 * Merges base questions with template-specific questions, sorted by sort_order
 */
export function getQuestionsForTemplate(templateId: string): DiscoveryQuestion[] {
  const template = getTemplateById(templateId);
  if (!template) {
    return [...DISCOVERY_QUESTIONS].sort((a, b) => a.sort_order - b.sort_order);
  }

  // Merge base questions with template-specific questions
  const allQuestions = [...DISCOVERY_QUESTIONS, ...template.additionalQuestions];

  // Sort by sort_order
  return allQuestions.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Get the default template
 */
export function getDefaultTemplate(): DiscoveryTemplate {
  return GENERAL_TEMPLATE;
}
