"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { StrategicInsightsPanel } from "../StrategicInsightsPanel";
import type { BaseNodeData, NodeItem, BMCStrategicInsights, FrameworkMethodology } from "@/types";

interface BMCSection {
  id: string;
  label: string;
  gridArea: string;
}

// Business Model Canvas 9 blocks layout
const BMC_SECTIONS: BMCSection[] = [
  { id: "key_partners", label: "Key Partners", gridArea: "kp" },
  { id: "key_activities", label: "Key Activities", gridArea: "ka" },
  { id: "key_resources", label: "Key Resources", gridArea: "kr" },
  { id: "value_propositions", label: "Value Propositions", gridArea: "vp" },
  { id: "customer_relationships", label: "Customer Relationships", gridArea: "cr" },
  { id: "channels", label: "Channels", gridArea: "ch" },
  { id: "customer_segments", label: "Customer Segments", gridArea: "cs" },
  { id: "cost_structure", label: "Cost Structure", gridArea: "cost" },
  { id: "revenue_streams", label: "Revenue Streams", gridArea: "rev" },
];

interface BMCData extends BaseNodeData {
  sections?: Record<string, NodeItem[]>;
  strategic_insights?: BMCStrategicInsights;
  methodology?: FrameworkMethodology; // FR-456: Methodology transparency
}

type BMCNodeProps = {
  id: string;
  data: BMCData;
  selected?: boolean;
};

export const BMCNode = memo(function BMCNode({ id, data, selected }: BMCNodeProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const { updateNode } = useCanvasStore();

  // Initialize sections if not present
  const sections = data.sections || {
    key_partners: [],
    key_activities: [],
    key_resources: [],
    value_propositions: [],
    customer_relationships: [],
    channels: [],
    customer_segments: [],
    cost_structure: [],
    revenue_streams: [],
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
        selected ? "ring-2 ring-emerald-500 shadow-xl" : ""
      }`}
      style={{ minWidth: 700, minHeight: 500, width: "100%", height: "100%" }}
    >
      <NodeResizer
        minWidth={700}
        minHeight={500}
        isVisible={selected}
        lineClassName="!border-emerald-400"
        handleClassName="!w-2 !h-2 !bg-emerald-500 !border-emerald-500"
      />
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-white/70" />
          <h3 className="font-semibold text-white">Business Model Canvas</h3>
        </div>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs text-white">
          Strategy
        </span>
      </div>

      {/* BMC Resizable Layout */}
      <div className="h-[calc(100%-48px)] p-2">
        <Group orientation="vertical" className="h-full">
          {/* Main Content Row */}
          <Panel defaultSize={75} minSize={50}>
            <Group orientation="horizontal" className="h-full">
              {/* Key Partners */}
              <Panel defaultSize={20} minSize={12}>
                <BMCBlock
                  section={BMC_SECTIONS[0]}
                  items={sections.key_partners || []}
                  isEditing={editingSection === "key_partners"}
                  onEdit={() => setEditingSection("key_partners")}
                  onAdd={() => handleAddItem("key_partners")}
                  onRemove={(itemId) => handleRemoveItem("key_partners", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>

              <Separator className="group flex w-1 items-center justify-center bg-gray-200">
                <div className="h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
              </Separator>

              {/* Key Activities / Key Resources */}
              <Panel defaultSize={20} minSize={12}>
                <Group orientation="vertical" className="h-full">
                  <Panel defaultSize={50} minSize={30}>
                    <BMCBlock
                      section={BMC_SECTIONS[1]}
                      items={sections.key_activities || []}
                      isEditing={editingSection === "key_activities"}
                      onEdit={() => setEditingSection("key_activities")}
                      onAdd={() => handleAddItem("key_activities")}
                      onRemove={(itemId) => handleRemoveItem("key_activities", itemId)}
                      newItemText={newItemText}
                      setNewItemText={setNewItemText}
                      onCancel={() => setEditingSection(null)}
                    />
                  </Panel>
                  <Separator className="group flex h-1 items-center justify-center bg-gray-200">
                    <div className="h-0.5 w-8 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
                  </Separator>
                  <Panel defaultSize={50} minSize={30}>
                    <BMCBlock
                      section={BMC_SECTIONS[2]}
                      items={sections.key_resources || []}
                      isEditing={editingSection === "key_resources"}
                      onEdit={() => setEditingSection("key_resources")}
                      onAdd={() => handleAddItem("key_resources")}
                      onRemove={(itemId) => handleRemoveItem("key_resources", itemId)}
                      newItemText={newItemText}
                      setNewItemText={setNewItemText}
                      onCancel={() => setEditingSection(null)}
                    />
                  </Panel>
                </Group>
              </Panel>

              <Separator className="group flex w-1 items-center justify-center bg-gray-200">
                <div className="h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
              </Separator>

              {/* Value Propositions */}
              <Panel defaultSize={20} minSize={12}>
                <BMCBlock
                  section={BMC_SECTIONS[3]}
                  items={sections.value_propositions || []}
                  isEditing={editingSection === "value_propositions"}
                  onEdit={() => setEditingSection("value_propositions")}
                  onAdd={() => handleAddItem("value_propositions")}
                  onRemove={(itemId) => handleRemoveItem("value_propositions", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>

              <Separator className="group flex w-1 items-center justify-center bg-gray-200">
                <div className="h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
              </Separator>

              {/* Customer Relationships / Channels */}
              <Panel defaultSize={20} minSize={12}>
                <Group orientation="vertical" className="h-full">
                  <Panel defaultSize={50} minSize={30}>
                    <BMCBlock
                      section={BMC_SECTIONS[4]}
                      items={sections.customer_relationships || []}
                      isEditing={editingSection === "customer_relationships"}
                      onEdit={() => setEditingSection("customer_relationships")}
                      onAdd={() => handleAddItem("customer_relationships")}
                      onRemove={(itemId) => handleRemoveItem("customer_relationships", itemId)}
                      newItemText={newItemText}
                      setNewItemText={setNewItemText}
                      onCancel={() => setEditingSection(null)}
                    />
                  </Panel>
                  <Separator className="group flex h-1 items-center justify-center bg-gray-200">
                    <div className="h-0.5 w-8 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
                  </Separator>
                  <Panel defaultSize={50} minSize={30}>
                    <BMCBlock
                      section={BMC_SECTIONS[5]}
                      items={sections.channels || []}
                      isEditing={editingSection === "channels"}
                      onEdit={() => setEditingSection("channels")}
                      onAdd={() => handleAddItem("channels")}
                      onRemove={(itemId) => handleRemoveItem("channels", itemId)}
                      newItemText={newItemText}
                      setNewItemText={setNewItemText}
                      onCancel={() => setEditingSection(null)}
                    />
                  </Panel>
                </Group>
              </Panel>

              <Separator className="group flex w-1 items-center justify-center bg-gray-200">
                <div className="h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
              </Separator>

              {/* Customer Segments */}
              <Panel defaultSize={20} minSize={12}>
                <BMCBlock
                  section={BMC_SECTIONS[6]}
                  items={sections.customer_segments || []}
                  isEditing={editingSection === "customer_segments"}
                  onEdit={() => setEditingSection("customer_segments")}
                  onAdd={() => handleAddItem("customer_segments")}
                  onRemove={(itemId) => handleRemoveItem("customer_segments", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>
            </Group>
          </Panel>

          <Separator className="group flex h-1 items-center justify-center bg-gray-200">
            <div className="h-0.5 w-12 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
          </Separator>

          {/* Bottom Row: Cost Structure | Revenue Streams */}
          <Panel defaultSize={25} minSize={15}>
            <Group orientation="horizontal" className="h-full">
              <Panel defaultSize={60} minSize={30}>
                <BMCBlock
                  section={BMC_SECTIONS[7]}
                  items={sections.cost_structure || []}
                  isEditing={editingSection === "cost_structure"}
                  onEdit={() => setEditingSection("cost_structure")}
                  onAdd={() => handleAddItem("cost_structure")}
                  onRemove={(itemId) => handleRemoveItem("cost_structure", itemId)}
                  newItemText={newItemText}
                  setNewItemText={setNewItemText}
                  onCancel={() => setEditingSection(null)}
                />
              </Panel>
              <Separator className="group flex w-1 items-center justify-center bg-gray-200">
                <div className="h-8 w-0.5 rounded-full bg-gray-300 transition-colors group-hover:bg-emerald-400" />
              </Separator>
              <Panel defaultSize={40} minSize={25}>
                <BMCBlock
                  section={BMC_SECTIONS[8]}
                  items={sections.revenue_streams || []}
                  isEditing={editingSection === "revenue_streams"}
                  onEdit={() => setEditingSection("revenue_streams")}
                  onAdd={() => handleAddItem("revenue_streams")}
                  onRemove={(itemId) => handleRemoveItem("revenue_streams", itemId)}
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
          frameworkType="bmc"
          insights={data.strategic_insights}
          methodology={data.methodology}
        />
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
      <Handle type="target" position={Position.Left} className="!bg-emerald-500" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-500" />
    </div>
  );
});

// Reusable BMC Block component
interface BMCBlockProps {
  section: BMCSection;
  items: NodeItem[];
  isEditing: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  newItemText: string;
  setNewItemText: (text: string) => void;
  onCancel: () => void;
}

function BMCBlock({
  section,
  items,
  isEditing,
  onEdit,
  onAdd,
  onRemove,
  newItemText,
  setNewItemText,
  onCancel,
}: BMCBlockProps) {
  return (
    <div className="h-full overflow-auto bg-white p-2">
      {/* Section Header */}
      <div className="mb-1 flex items-center justify-between border-b border-gray-100 pb-1">
        <h4 className="text-xs font-semibold uppercase text-emerald-700">
          {section.label}
        </h4>
        <button
          onClick={onEdit}
          className="rounded p-0.5 transition-colors hover:bg-emerald-50"
          title={`Add ${section.label.toLowerCase()}`}
        >
          <Plus className="h-3 w-3 text-emerald-600" />
        </button>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-start justify-between rounded bg-emerald-50 px-1.5 py-0.5 text-xs"
          >
            <span className="flex-1 text-gray-700">{item.text}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-2.5 w-2.5 text-gray-400 hover:text-red-500" />
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
              placeholder="Add item..."
              className="flex-1 rounded border border-gray-300 px-1 py-0.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
            <button
              onClick={onAdd}
              className="rounded bg-emerald-600 px-1.5 py-0.5 text-xs text-white hover:bg-emerald-700"
            >
              Add
            </button>
          </div>
        )}

        {/* Empty state */}
        {!items.length && !isEditing && (
          <p className="text-[10px] italic text-gray-400">Click + to add</p>
        )}
      </div>
    </div>
  );
}
