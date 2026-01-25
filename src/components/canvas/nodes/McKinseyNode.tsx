"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { StrategicInsightsPanel } from "../StrategicInsightsPanel";
import type { BaseNodeData, NodeItem, McKinseyStrategicInsights, FrameworkMethodology } from "@/types";

interface McKinseyElement {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isHard: boolean; // Hard vs Soft elements
}

const MCKINSEY_ELEMENTS: McKinseyElement[] = [
  // Hard elements (top)
  { id: "strategy", label: "Strategy", color: "#6366f1", bgColor: "#e0e7ff", isHard: true },
  { id: "structure", label: "Structure", color: "#8b5cf6", bgColor: "#ede9fe", isHard: true },
  { id: "systems", label: "Systems", color: "#a855f7", bgColor: "#f3e8ff", isHard: true },
  // Soft elements (bottom)
  { id: "shared_values", label: "Shared Values", color: "#d946ef", bgColor: "#fae8ff", isHard: false },
  { id: "style", label: "Style", color: "#ec4899", bgColor: "#fce7f3", isHard: false },
  { id: "staff", label: "Staff", color: "#f43f5e", bgColor: "#ffe4e6", isHard: false },
  { id: "skills", label: "Skills", color: "#ef4444", bgColor: "#fee2e2", isHard: false },
];

interface McKinseyData extends BaseNodeData {
  elements?: Record<string, NodeItem[]>;
  strategic_insights?: McKinseyStrategicInsights;
  methodology?: FrameworkMethodology; // FR-456: Methodology transparency
}

type McKinseyNodeProps = {
  id: string;
  data: McKinseyData;
  selected?: boolean;
};

export const McKinseyNode = memo(function McKinseyNode({
  id,
  data,
  selected,
}: McKinseyNodeProps) {
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const { updateNode } = useCanvasStore();

  const elements = data.elements || {
    strategy: [],
    structure: [],
    systems: [],
    shared_values: [],
    style: [],
    staff: [],
    skills: [],
  };

  const handleAddItem = (elementId: string) => {
    if (!newItemText.trim()) return;

    const newElements = { ...elements };
    const newItem: NodeItem = {
      id: `${elementId}-${Date.now()}`,
      text: newItemText.trim(),
      created_at: new Date().toISOString(),
    };
    newElements[elementId] = [...(newElements[elementId] || []), newItem];

    updateNode(id, { ...data, elements: newElements });
    setNewItemText("");
    setEditingElement(null);
  };

  const handleRemoveItem = (elementId: string, itemId: string) => {
    const newElements = { ...elements };
    newElements[elementId] = newElements[elementId].filter((item) => item.id !== itemId);
    updateNode(id, { ...data, elements: newElements });
  };

  const hardElements = MCKINSEY_ELEMENTS.filter((e) => e.isHard);
  const softElements = MCKINSEY_ELEMENTS.filter((e) => !e.isHard);
  const sharedValues = MCKINSEY_ELEMENTS.find((e) => e.id === "shared_values")!;

  return (
    <div
      className={`rounded-lg bg-white shadow-lg transition-shadow ${
        selected ? "ring-2 ring-indigo-500 shadow-xl" : ""
      }`}
      style={{ minWidth: 550, minHeight: 450, width: "100%", height: "100%" }}
    >
      <NodeResizer
        minWidth={550}
        minHeight={450}
        isVisible={selected}
        lineClassName="!border-indigo-400"
        handleClassName="!w-2 !h-2 !bg-indigo-500 !border-indigo-500"
      />
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-white/70" />
          <h3 className="font-semibold text-white">McKinsey 7-S Framework</h3>
        </div>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs text-white">
          Organizational
        </span>
      </div>

      <div className="h-[calc(100%-48px)] p-2">
        <Group orientation="vertical" className="h-full">
          {/* Hard Elements Row: Strategy | Structure | Systems */}
          <Panel defaultSize={35} minSize={20}>
            <Group orientation="horizontal" className="h-full">
              {hardElements.map((element, idx) => (
                <>
                  {idx > 0 && (
                    <Separator key={`sep-${element.id}`} className="group flex w-2 items-center justify-center">
                      <div className="h-12 w-1 rounded-full bg-gray-200 transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
                    </Separator>
                  )}
                  <Panel key={element.id} defaultSize={33.33} minSize={20}>
                    <div className="h-full p-1">
                      <ElementCard
                        element={element}
                        items={elements[element.id] || []}
                        isEditing={editingElement === element.id}
                        onEdit={() => setEditingElement(element.id)}
                        onAdd={() => handleAddItem(element.id)}
                        onRemove={(itemId) => handleRemoveItem(element.id, itemId)}
                        newItemText={newItemText}
                        setNewItemText={setNewItemText}
                        onCancel={() => setEditingElement(null)}
                      />
                    </div>
                  </Panel>
                </>
              ))}
            </Group>
          </Panel>

          <Separator className="group flex h-2 items-center justify-center">
            <div className="h-1 w-12 rounded-full bg-gray-200 transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
          </Separator>

          {/* Center: Shared Values */}
          <Panel defaultSize={30} minSize={15}>
            <div className="flex h-full justify-center p-1">
              <div
                className="h-full w-full overflow-auto rounded-lg border-2 p-3"
                style={{
                  borderColor: sharedValues.color,
                  backgroundColor: sharedValues.bgColor,
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold" style={{ color: sharedValues.color }}>
                    {sharedValues.label}
                  </h4>
                  <button
                    onClick={() => setEditingElement("shared_values")}
                    className="rounded p-1 hover:bg-black/10"
                  >
                    <Plus className="h-4 w-4" style={{ color: sharedValues.color }} />
                  </button>
                </div>

                <div className="space-y-1">
                  {elements.shared_values?.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onRemove={() => handleRemoveItem("shared_values", item.id)}
                    />
                  ))}
                  {editingElement === "shared_values" && (
                    <AddItemInput
                      value={newItemText}
                      onChange={setNewItemText}
                      onAdd={() => handleAddItem("shared_values")}
                      onCancel={() => setEditingElement(null)}
                    />
                  )}
                  {!elements.shared_values?.length && editingElement !== "shared_values" && (
                    <p className="text-xs italic text-gray-400">Click + to add core values</p>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <Separator className="group flex h-2 items-center justify-center">
            <div className="h-1 w-12 rounded-full bg-gray-200 transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
          </Separator>

          {/* Soft Elements Row: Style | Staff | Skills */}
          <Panel defaultSize={35} minSize={20}>
            <Group orientation="horizontal" className="h-full">
              {softElements
                .filter((e) => e.id !== "shared_values")
                .map((element, idx) => (
                  <>
                    {idx > 0 && (
                      <Separator key={`sep-${element.id}`} className="group flex w-2 items-center justify-center">
                        <div className="h-12 w-1 rounded-full bg-gray-200 transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
                      </Separator>
                    )}
                    <Panel key={element.id} defaultSize={33.33} minSize={20}>
                      <div className="h-full p-1">
                        <ElementCard
                          element={element}
                          items={elements[element.id] || []}
                          isEditing={editingElement === element.id}
                          onEdit={() => setEditingElement(element.id)}
                          onAdd={() => handleAddItem(element.id)}
                          onRemove={(itemId) => handleRemoveItem(element.id, itemId)}
                          newItemText={newItemText}
                          setNewItemText={setNewItemText}
                          onCancel={() => setEditingElement(null)}
                        />
                      </div>
                    </Panel>
                  </>
                ))}
            </Group>
          </Panel>
        </Group>

        {/* FR-454: Strategic Insights Panel */}
        {/* FR-456: Added methodology prop */}
        <StrategicInsightsPanel
          frameworkType="mckinsey7s"
          insights={data.strategic_insights}
          methodology={data.methodology}
        />
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
      <Handle type="target" position={Position.Left} className="!bg-indigo-500" />
      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
    </div>
  );
});

// Reusable Element Card
interface ElementCardProps {
  element: McKinseyElement;
  items: NodeItem[];
  isEditing: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  newItemText: string;
  setNewItemText: (text: string) => void;
  onCancel: () => void;
}

function ElementCard({
  element,
  items,
  isEditing,
  onEdit,
  onAdd,
  onRemove,
  newItemText,
  setNewItemText,
  onCancel,
}: ElementCardProps) {
  return (
    <div
      className="h-full overflow-auto rounded-lg border p-3"
      style={{ borderColor: element.color, backgroundColor: element.bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm font-semibold" style={{ color: element.color }}>
          {element.label}
        </h5>
        <button onClick={onEdit} className="rounded p-0.5 hover:bg-black/10">
          <Plus className="h-3 w-3" style={{ color: element.color }} />
        </button>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onRemove={() => onRemove(item.id)} />
        ))}
        {isEditing && (
          <AddItemInput
            value={newItemText}
            onChange={setNewItemText}
            onAdd={onAdd}
            onCancel={onCancel}
          />
        )}
        {!items.length && !isEditing && (
          <p className="text-xs italic text-gray-400">Click + to add</p>
        )}
      </div>
    </div>
  );
}

// Reusable Item Row
function ItemRow({
  item,
  onRemove,
}: {
  item: NodeItem;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-start justify-between rounded bg-white/70 px-2 py-1 text-sm">
      <span className="flex-1 text-gray-700">{item.text}</span>
      <button
        onClick={onRemove}
        className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}

// Reusable Add Item Input
function AddItemInput({
  value,
  onChange,
  onAdd,
  onCancel,
}: {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim()) onAdd();
        if (e.key === "Escape") onCancel();
      }}
      placeholder="Add item..."
      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      autoFocus
    />
  );
}
