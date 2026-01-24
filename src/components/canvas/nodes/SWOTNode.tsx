"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { StrategicInsightsPanel } from "../StrategicInsightsPanel";
import type { BaseNodeData, NodeItem, SWOTStrategicInsights } from "@/types";

interface SWOTSection {
  id: "strengths" | "weaknesses" | "opportunities" | "threats";
  label: string;
  color: string;
  bgColor: string;
}

const SWOT_SECTIONS: SWOTSection[] = [
  { id: "strengths", label: "Strengths", color: "#22c55e", bgColor: "#dcfce7" },
  { id: "weaknesses", label: "Weaknesses", color: "#ef4444", bgColor: "#fee2e2" },
  { id: "opportunities", label: "Opportunities", color: "#3b82f6", bgColor: "#dbeafe" },
  { id: "threats", label: "Threats", color: "#f59e0b", bgColor: "#fef3c7" },
];

interface SWOTData extends BaseNodeData {
  sections?: Record<string, NodeItem[]>;
  strategic_insights?: SWOTStrategicInsights;
}

type SWOTNodeProps = {
  id: string;
  data: SWOTData;
  selected?: boolean;
};

export const SWOTNode = memo(function SWOTNode({ id, data, selected }: SWOTNodeProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const { updateNode } = useCanvasStore();

  // Initialize sections if not present
  const sections = data.sections || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  const handleAddItem = (sectionId: string) => {
    if (!newItemText.trim()) return;

    const newSections = { ...sections };
    const newItem: NodeItem = {
      id: `${sectionId}-${Date.now()}`,
      text: newItemText.trim(),
      created_at: new Date().toISOString(),
    };
    newSections[sectionId] = [...(newSections[sectionId] || []), newItem];

    updateNode(id, { ...data, sections: newSections });
    setNewItemText("");
    setEditingSection(null);
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    const newSections = { ...sections };
    newSections[sectionId] = newSections[sectionId].filter((item) => item.id !== itemId);
    updateNode(id, { ...data, sections: newSections });
  };

  return (
    <div
      className={`rounded-lg bg-white shadow-lg transition-shadow ${
        selected ? "ring-2 ring-blue-500 shadow-xl" : ""
      }`}
      style={{ minWidth: 500, minHeight: 350, width: "100%", height: "100%" }}
    >
      <NodeResizer
        minWidth={500}
        minHeight={350}
        isVisible={selected}
        lineClassName="!border-blue-400"
        handleClassName="!w-2 !h-2 !bg-blue-500 !border-blue-500"
      />
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-white/70" />
          <h3 className="font-semibold text-white">SWOT Analysis</h3>
        </div>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs text-white">
          Strategy
        </span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-200 p-px">
        {SWOT_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="min-h-[150px] p-3"
            style={{ backgroundColor: section.bgColor }}
          >
            {/* Section Header */}
            <div className="mb-2 flex items-center justify-between">
              <h4
                className="text-sm font-semibold"
                style={{ color: section.color }}
              >
                {section.label}
              </h4>
              <button
                onClick={() => setEditingSection(section.id)}
                className="rounded p-1 transition-colors hover:bg-black/10"
                title={`Add ${section.label.toLowerCase()}`}
              >
                <Plus className="h-4 w-4" style={{ color: section.color }} />
              </button>
            </div>

            {/* Items */}
            <div className="space-y-1">
              {sections[section.id]?.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start justify-between rounded bg-white/70 px-2 py-1 text-sm"
                >
                  <span className="flex-1 text-gray-700">{item.text}</span>
                  <button
                    onClick={() => handleRemoveItem(section.id, item.id)}
                    className="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}

              {/* Add item input */}
              {editingSection === section.id && (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem(section.id);
                      if (e.key === "Escape") setEditingSection(null);
                    }}
                    placeholder={`Add ${section.label.toLowerCase()}...`}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddItem(section.id)}
                    className="rounded bg-gray-800 px-2 py-1 text-sm text-white hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!sections[section.id]?.length && editingSection !== section.id && (
                <p className="text-xs italic text-gray-400">
                  Click + to add items
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FR-454: Strategic Insights Panel */}
      <div className="px-4 pb-2">
        <StrategicInsightsPanel
          frameworkType="swot"
          insights={data.strategic_insights}
        />
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
  );
});
