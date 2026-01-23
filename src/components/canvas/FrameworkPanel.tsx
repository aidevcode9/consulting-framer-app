"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Network,
  Layers,
  StickyNote,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useUIStore, useDiscoveryStore, useEngagementStore } from "@/lib/store";

interface FrameworkItem {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const FRAMEWORKS: FrameworkItem[] = [
  {
    type: "swot",
    name: "SWOT Analysis",
    description: "Strengths, Weaknesses, Opportunities, Threats",
    icon: Grid3X3,
    color: "#3b82f6",
  },
  {
    type: "porter",
    name: "Porter's Five Forces",
    description: "Competitive industry analysis",
    icon: Network,
    color: "#8b5cf6",
  },
  {
    type: "mckinsey7s",
    name: "McKinsey 7-S",
    description: "Organizational alignment",
    icon: Layers,
    color: "#6366f1",
  },
];

const OTHER_NODES = [
  {
    type: "note",
    name: "Note",
    description: "Add custom notes",
    icon: StickyNote,
    color: "#fbbf24",
  },
];

interface Recommendation {
  framework: "swot" | "porter" | "mckinsey7s" | "bmc";
  confidence: number;
  reasoning: string;
  focusAreas: string[];
}

export function FrameworkPanel() {
  const { frameworkPanelOpen, setFrameworkPanelOpen } = useUIStore();
  const { isComplete: discoveryComplete, answers } = useDiscoveryStore();
  const { currentEngagement } = useEngagementStore();
  const [expandedSection, setExpandedSection] = useState<string | null>("frameworks");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;

  const handleGetRecommendations = async () => {
    if (!currentEngagement) {
      setRecsError("No engagement selected");
      return;
    }

    setIsLoadingRecs(true);
    setRecsError(null);
    try {
      const response = await fetch("/api/ai/recommend-frameworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementId: currentEngagement.id,
          discoveryAnswers: Object.entries(answers).map(([id, answer]) => ({
            question: id,
            answer: answer.value,
          })),
          context: {
            clientName: currentEngagement.client_name,
            industry: currentEngagement.client_industry || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Recommendations error:", error);
      setRecsError("Could not get recommendations. Try again.");
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  if (!frameworkPanelOpen) {
    return (
      <button
        onClick={() => setFrameworkPanelOpen(true)}
        className="rounded-lg bg-white p-3 shadow-lg hover:bg-gray-50"
        title="Open framework panel"
      >
        <Grid3X3 className="h-5 w-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="w-72 rounded-lg bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-gray-800">Frameworks</h3>
        <button
          onClick={() => setFrameworkPanelOpen(false)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-2">
        {/* AI Recommendations */}
        <div className="mb-2">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === "ai" ? null : "ai")
            }
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">
                AI Recommended
              </span>
              {discoveryComplete && recommendations.length === 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  Ready
                </span>
              )}
              {recommendations.length > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  {recommendations.length}
                </span>
              )}
            </div>
            {expandedSection === "ai" ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "ai" && (
            <div className="ml-2 mt-1">
              {!discoveryComplete && answeredCount === 0 ? (
                // No discovery started
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">
                    Complete the Discovery questionnaire to get AI-powered framework
                    recommendations based on your engagement context.
                  </p>
                </div>
              ) : !discoveryComplete && answeredCount > 0 ? (
                // Discovery in progress
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    Discovery in progress ({answeredCount} answers). Complete all questions to get recommendations.
                  </p>
                </div>
              ) : recommendations.length === 0 ? (
                // Discovery complete, no recommendations yet
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700">Discovery complete!</p>
                  </div>
                  <button
                    onClick={handleGetRecommendations}
                    disabled={isLoadingRecs}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {isLoadingRecs ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get AI Recommendations
                      </>
                    )}
                  </button>
                  {recsError && (
                    <p className="text-xs text-red-600">{recsError}</p>
                  )}
                </div>
              ) : (
                // Show recommendations
                <div className="space-y-2">
                  {recommendations.map((rec) => {
                    const framework = FRAMEWORKS.find((f) => f.type === rec.framework);
                    if (!framework) return null;
                    return (
                      <div
                        key={rec.framework}
                        draggable
                        onDragStart={(e) => onDragStart(e, rec.framework)}
                        className="cursor-grab rounded-md border border-amber-200 bg-amber-50 p-2 hover:border-amber-300 active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2">
                          <framework.icon
                            className="h-4 w-4"
                            style={{ color: framework.color }}
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {framework.name}
                          </span>
                          <span className="ml-auto text-xs text-amber-600">
                            {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">{rec.reasoning}</p>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setRecommendations([])}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear recommendations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Strategy Frameworks */}
        <div className="mb-2">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === "frameworks" ? null : "frameworks")
            }
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              Strategy Frameworks
            </span>
            {expandedSection === "frameworks" ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "frameworks" && (
            <div className="mt-1 space-y-1">
              {FRAMEWORKS.map((framework) => (
                <DraggableItem
                  key={framework.type}
                  item={framework}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Other Nodes */}
        <div>
          <button
            onClick={() =>
              setExpandedSection(expandedSection === "other" ? null : "other")
            }
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Other</span>
            {expandedSection === "other" ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "other" && (
            <div className="mt-1 space-y-1">
              {OTHER_NODES.map((node) => (
                <DraggableItem
                  key={node.type}
                  item={node}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t px-4 py-2">
        <p className="text-xs text-gray-400">
          Drag frameworks onto the canvas to begin analysis
        </p>
      </div>
    </div>
  );
}

// Draggable framework/node item
interface DraggableItemProps {
  item: FrameworkItem;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function DraggableItem({ item, onDragStart }: DraggableItemProps) {
  const Icon = item.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.type)}
      className="flex cursor-grab items-center gap-3 rounded-md border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm active:cursor-grabbing"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-md"
        style={{ backgroundColor: item.color + "20" }}
      >
        <Icon className="h-5 w-5" style={{ color: item.color }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{item.name}</p>
        <p className="text-xs text-gray-500">{item.description}</p>
      </div>
    </div>
  );
}
