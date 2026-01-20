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
} from "lucide-react";
import { useUIStore } from "@/lib/store";

interface FrameworkItem {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
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

export function FrameworkPanel() {
  const { frameworkPanelOpen, setFrameworkPanelOpen } = useUIStore();
  const [expandedSection, setExpandedSection] = useState<string | null>("frameworks");

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
            </div>
            {expandedSection === "ai" ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "ai" && (
            <div className="ml-6 mt-1 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-700">
                Complete the Discovery questionnaire to get AI-powered framework
                recommendations based on your engagement context.
              </p>
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
