"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  BookOpen,
} from "lucide-react";
import type {
  FrameworkStrategicInsights,
  PorterStrategicInsights,
  McKinseyStrategicInsights,
  SWOTStrategicInsights,
  BMCStrategicInsights,
  RatingLevel,
  FrameworkMethodology,
  MethodologySource,
} from "@/types";

interface StrategicInsightsPanelProps {
  frameworkType: "swot" | "porter" | "mckinsey7s" | "bmc";
  insights?: FrameworkStrategicInsights;
  methodology?: FrameworkMethodology; // FR-456: Methodology transparency
}

// Type guards for specific insights
function isPorterInsights(
  insights: FrameworkStrategicInsights,
  type: string
): insights is PorterStrategicInsights {
  return type === "porter" && "intensity_ratings" in insights;
}

function isMcKinseyInsights(
  insights: FrameworkStrategicInsights,
  type: string
): insights is McKinseyStrategicInsights {
  return type === "mckinsey7s" && "element_health" in insights;
}

function isSWOTInsights(
  insights: FrameworkStrategicInsights,
  type: string
): insights is SWOTStrategicInsights {
  return type === "swot" && "tows_strategies" in insights;
}

function isBMCInsights(
  insights: FrameworkStrategicInsights,
  type: string
): insights is BMCStrategicInsights {
  return type === "bmc" && "value_proposition_fit" in insights;
}

// Rating badge colors
function getRatingColor(rating: RatingLevel): string {
  switch (rating) {
    case "HIGH":
    case "STRONG":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
    case "MODERATE":
      return "bg-yellow-100 text-yellow-800";
    case "LOW":
    case "WEAK":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// FR-456: Format academic citation
function formatCitation(source: MethodologySource): string {
  const author = source.authors || source.author || "Unknown";
  return `${author} (${source.year}). "${source.title}", ${source.publication}.`;
}

export function StrategicInsightsPanel({
  frameworkType,
  insights,
  methodology,
}: StrategicInsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show panel if we have insights or methodology
  if (!insights && !methodology) {
    return null;
  }

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-1">
          <Lightbulb className="h-3 w-3 text-amber-500" />
          Strategic Insights
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-2 space-y-3 px-2 text-xs">
          {/* FR-456: Methodology section */}
          {methodology && (
            <div className="rounded bg-slate-50 p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <BookOpen className="h-3 w-3" />
                  Methodology
                </span>
                <span
                  className="cursor-help rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-700"
                  title="Prompt version used to generate this analysis. Higher versions include improved methodology and industry context."
                >
                  v{methodology.prompt_version}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {formatCitation(methodology.source.primary)}
              </p>
              {methodology.source.updated && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Updated: {formatCitation(methodology.source.updated)}
                </p>
              )}
              {methodology.source.extended && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Extended: {formatCitation(methodology.source.extended)}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Based on: {methodology.discovery_inputs_summary}
              </p>
            </div>
          )}

          {/* Framework-specific content */}
          {insights && isPorterInsights(insights, frameworkType) && (
            <PorterInsightsContent insights={insights} />
          )}
          {insights && isMcKinseyInsights(insights, frameworkType) && (
            <McKinseyInsightsContent insights={insights} />
          )}
          {insights && isSWOTInsights(insights, frameworkType) && (
            <SWOTInsightsContent insights={insights} />
          )}
          {insights && isBMCInsights(insights, frameworkType) && (
            <BMCInsightsContent insights={insights} />
          )}

          {/* Strategic Implications - common to all */}
          {insights?.strategic_implications && (
            <div className="rounded bg-blue-50 p-2">
              <div className="mb-1 flex items-center gap-1 font-medium text-blue-800">
                <TrendingUp className="h-3 w-3" />
                Strategic Implications
              </div>
              <p className="text-gray-700">{insights.strategic_implications}</p>
            </div>
          )}

          {/* Evidence Quality - if available */}
          {insights?.evidence_quality && (
            <div className="rounded bg-gray-50 p-2">
              <div
                className="mb-1 flex cursor-help items-center gap-1 font-medium text-gray-700"
                title="AI self-reports how many observations are grounded in industry-specific evidence vs generic business insights. Higher industry-specific ratio = more actionable analysis."
              >
                <BarChart3 className="h-3 w-3" />
                Evidence Quality
              </div>
              <div className="flex gap-3 text-gray-600">
                <span
                  className="cursor-help"
                  title="Observations grounded in industry-specific evidence (e.g., 'Legal tech CAC is typically 40%')"
                >
                  Industry-specific:{" "}
                  <span className="font-medium text-green-700">
                    {insights.evidence_quality.industry_specific_count}
                  </span>
                </span>
                <span
                  className="cursor-help"
                  title="General business observations not specific to the client's industry"
                >
                  Generic:{" "}
                  <span className="font-medium text-gray-500">
                    {insights.evidence_quality.generic_count}
                  </span>
                </span>
              </div>
              {insights.evidence_quality.evidence_gaps?.length > 0 && (
                <div className="mt-1 text-amber-700">
                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                  Gaps: {insights.evidence_quality.evidence_gaps.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Porter's Five Forces content
function PorterInsightsContent({ insights }: { insights: PorterStrategicInsights }) {
  const forces = [
    { key: "rivalry", label: "Rivalry" },
    { key: "entrants", label: "New Entrants" },
    { key: "suppliers", label: "Supplier Power" },
    { key: "buyers", label: "Buyer Power" },
    { key: "substitutes", label: "Substitutes" },
  ] as const;

  return (
    <div>
      <div className="mb-1 font-medium text-gray-700">Force Intensity</div>
      <div className="flex flex-wrap gap-1">
        {forces.map(({ key, label }) => {
          const rating = insights.intensity_ratings?.[key];
          if (!rating) return null;
          return (
            <span
              key={key}
              className={`rounded px-1.5 py-0.5 ${getRatingColor(rating)}`}
            >
              {label}: {rating}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// McKinsey 7-S content
function McKinseyInsightsContent({ insights }: { insights: McKinseyStrategicInsights }) {
  const elements = [
    { key: "strategy", label: "Strategy" },
    { key: "structure", label: "Structure" },
    { key: "systems", label: "Systems" },
    { key: "shared_values", label: "Values" },
    { key: "style", label: "Style" },
    { key: "staff", label: "Staff" },
    { key: "skills", label: "Skills" },
  ] as const;

  return (
    <div className="space-y-2">
      <div>
        <div className="mb-1 font-medium text-gray-700">Element Health</div>
        <div className="flex flex-wrap gap-1">
          {elements.map(({ key, label }) => {
            const rating = insights.element_health?.[key];
            if (!rating) return null;
            return (
              <span
                key={key}
                className={`rounded px-1.5 py-0.5 ${getRatingColor(rating)}`}
              >
                {label}: {rating}
              </span>
            );
          })}
        </div>
      </div>

      {insights.alignment_issues?.length > 0 && (
        <div className="rounded bg-amber-50 p-2">
          <div className="mb-1 flex items-center gap-1 font-medium text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            Alignment Issues
          </div>
          <ul className="list-inside list-disc text-gray-700">
            {insights.alignment_issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// SWOT content
function SWOTInsightsContent({ insights }: { insights: SWOTStrategicInsights }) {
  return (
    <div className="space-y-2">
      {/* Factor Priorities */}
      {insights.factor_priority && (
        <div>
          <div className="mb-1 font-medium text-gray-700">Priority Factors</div>
          <div className="grid grid-cols-2 gap-1">
            {insights.factor_priority.strengths?.[0] && (
              <span className="truncate rounded bg-green-50 px-1.5 py-0.5 text-green-800">
                S: {insights.factor_priority.strengths[0]}
              </span>
            )}
            {insights.factor_priority.weaknesses?.[0] && (
              <span className="truncate rounded bg-red-50 px-1.5 py-0.5 text-red-800">
                W: {insights.factor_priority.weaknesses[0]}
              </span>
            )}
            {insights.factor_priority.opportunities?.[0] && (
              <span className="truncate rounded bg-blue-50 px-1.5 py-0.5 text-blue-800">
                O: {insights.factor_priority.opportunities[0]}
              </span>
            )}
            {insights.factor_priority.threats?.[0] && (
              <span className="truncate rounded bg-amber-50 px-1.5 py-0.5 text-amber-800">
                T: {insights.factor_priority.threats[0]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* TOWS Strategies */}
      {insights.tows_strategies && (
        <div className="rounded bg-purple-50 p-2">
          <div className="mb-1 font-medium text-purple-800">TOWS Strategies</div>
          <div className="space-y-1 text-gray-700">
            {insights.tows_strategies.so && (
              <div className="truncate">
                <span className="font-medium text-green-700">SO:</span>{" "}
                {insights.tows_strategies.so}
              </div>
            )}
            {insights.tows_strategies.wo && (
              <div className="truncate">
                <span className="font-medium text-amber-700">WO:</span>{" "}
                {insights.tows_strategies.wo}
              </div>
            )}
            {insights.tows_strategies.st && (
              <div className="truncate">
                <span className="font-medium text-blue-700">ST:</span>{" "}
                {insights.tows_strategies.st}
              </div>
            )}
            {insights.tows_strategies.wt && (
              <div className="truncate">
                <span className="font-medium text-red-700">WT:</span>{" "}
                {insights.tows_strategies.wt}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// BMC content
function BMCInsightsContent({ insights }: { insights: BMCStrategicInsights }) {
  const fits = [
    { key: "segment_vp_fit", label: "Segment-VP Fit" },
    { key: "vp_channel_fit", label: "VP-Channel Fit" },
    { key: "relationship_revenue_fit", label: "Rel-Revenue Fit" },
  ] as const;

  return (
    <div className="space-y-2">
      {/* Value Proposition Fit */}
      {insights.value_proposition_fit && (
        <div>
          <div className="mb-1 font-medium text-gray-700">Value Proposition Fit</div>
          <div className="flex flex-wrap gap-1">
            {fits.map(({ key, label }) => {
              const rating = insights.value_proposition_fit?.[key];
              if (!rating) return null;
              return (
                <span
                  key={key}
                  className={`rounded px-1.5 py-0.5 ${getRatingColor(rating)}`}
                >
                  {label}: {rating}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Coherence Issues */}
      {insights.coherence_issues?.length > 0 && (
        <div className="rounded bg-amber-50 p-2">
          <div className="mb-1 flex items-center gap-1 font-medium text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            Coherence Issues
          </div>
          <ul className="list-inside list-disc text-gray-700">
            {insights.coherence_issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
