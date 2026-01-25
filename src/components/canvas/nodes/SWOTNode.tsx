"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { StrategicInsightsPanel } from "../StrategicInsightsPanel";
import type { BaseNodeData, NodeItem, SWOTStrategicInsights, FrameworkMethodology } from "@/types";

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
  methodology?: FrameworkMethodology; // FR-456: Methodology transparency
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

      {/* 2x2 Resizable Grid */}
      <div className="h-[calc(100%-48px)] p-2">
        <Group orientation="vertical" className="h-full">
          {/* Top Row: Strengths | Weaknesses */}
          <Panel defaultSize={50} minSize={25}>
            <Group orientation="horizontal" className="h-full">
              <Panel defaultSize={50} minSize={25}>
                <SWOTQuadrant
                  section={SWOT_SECTIONS[0]}
                  items={sections.strengths || []}
                  isEditing={editingSection === "strengths"}
                  onEdit={() => setEditingSection("strengths")}
                  onAdd={() => handleAddItem("strengths")}
                  onRemove={(itemId) => handleRemoveItem("strengths", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>

              <Separator className="group flex w-2 items-center justify-center">
                <div className="h-12 w-1 rounded-full bg-gray-300 transition-colors group-hover:bg-blue-400 group-active:bg-blue-500" />
              </Separator>

              <Panel defaultSize={50} minSize={25}>
                <SWOTQuadrant
                  section={SWOT_SECTIONS[1]}
                  items={sections.weaknesses || []}
                  isEditing={editingSection === "weaknesses"}
                  onEdit={() => setEditingSection("weaknesses")}
                  onAdd={() => handleAddItem("weaknesses")}
                  onRemove={(itemId) => handleRemoveItem("weaknesses", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>
            </Group>
          </Panel>

          <Separator className="group flex h-2 items-center justify-center">
            <div className="h-1 w-12 rounded-full bg-gray-300 transition-colors group-hover:bg-blue-400 group-active:bg-blue-500" />
          </Separator>

          {/* Bottom Row: Opportunities | Threats */}
          <Panel defaultSize={50} minSize={25}>
            <Group orientation="horizontal" className="h-full">
              <Panel defaultSize={50} minSize={25}>
                <SWOTQuadrant
                  section={SWOT_SECTIONS[2]}
                  items={sections.opportunities || []}
                  isEditing={editingSection === "opportunities"}
                  onEdit={() => setEditingSection("opportunities")}
                  onAdd={() => handleAddItem("opportunities")}
                  onRemove={(itemId) => handleRemoveItem("opportunities", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>

              <Separator className="group flex w-2 items-center justify-center">
                <div className="h-12 w-1 rounded-full bg-gray-300 transition-colors group-hover:bg-blue-400 group-active:bg-blue-500" />
              </Separator>

              <Panel defaultSize={50} minSize={25}>
                <SWOTQuadrant
                  section={SWOT_SECTIONS[3]}
                  items={sections.threats || []}
                  isEditing={editingSection === "threats"}
                  onEdit={() => setEditingSection("threats")}
                  onAdd={() => handleAddItem("threats")}
                  onRemove={(itemId) => handleRemoveItem("threats", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {/* FR-454: Strategic Insights Panel */}
      {/* FR-456: Added methodology prop */}
      <div className="px-4 pb-2">
        <StrategicInsightsPanel
          frameworkType="swot"
          insights={data.strategic_insights}
          methodology={data.methodology}
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

// Reusable SWOT Quadrant component
interface SWOTQuadrantProps {
  section: SWOTSection;
  items: NodeItem[];
  isEditing: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  newItemText: string;
  setNewItemText: (text: string) => void;
  onCancel: () => void;
}

function SWOTQuadrant({
  section,
  items,
  isEditing,
  onEdit,
  onAdd,
  onRemove,
  newItemText,
  setNewItemText,
  onCancel,
}: SWOTQuadrantProps) {
  return (
    <div
      className="h-full overflow-auto p-3"
      style={{ backgroundColor: section.bgColor }}
    >
      {/* Section Header */}
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold" style={{ color: section.color }}>
          {section.label}
        </h4>
        <button
          onClick={onEdit}
          className="rounded p-1 transition-colors hover:bg-black/10"
          title={`Add ${section.label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" style={{ color: section.color }} />
        </button>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-start justify-between rounded bg-white/70 px-2 py-1 text-sm"
          >
            <span className="flex-1 text-gray-700">{item.text}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}

        {/* Add item input */}
        {isEditing && (
          <div className="flex gap-1">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItemText.trim()) onAdd();
                if (e.key === "Escape") onCancel();
              }}
              placeholder={`Add ${section.label.toLowerCase()}...`}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={onAdd}
              className="rounded bg-gray-800 px-2 py-1 text-sm text-white hover:bg-gray-700"
            >
              Add
            </button>
          </div>
        )}

        {/* Empty state */}
        {!items.length && !isEditing && (
          <p className="text-xs italic text-gray-400">Click + to add items</p>
        )}
      </div>
    </div>
  );
}
