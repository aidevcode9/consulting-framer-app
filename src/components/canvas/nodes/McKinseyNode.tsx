"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import type { BaseNodeData, NodeItem } from "@/types";

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
}

export const McKinseyNode = memo(function McKinseyNode({
  id,
  data,
  selected,
}: NodeProps<McKinseyData>) {
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
      style={{ width: 650 }}
    >
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

      <div className="p-4">
        {/* Legend */}
        <div className="mb-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-gray-600">Hard Elements (easier to change)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-pink-500" />
            <span className="text-gray-600">Soft Elements (harder to change)</span>
          </div>
        </div>

        {/* Hard Elements Row */}
        <div className="mb-3 grid grid-cols-3 gap-3">
          {hardElements.map((element) => (
            <ElementCard
              key={element.id}
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
          ))}
        </div>

        {/* Center: Shared Values (larger, connecting element) */}
        <div className="mb-3 flex justify-center">
          <div
            className="w-[280px] rounded-lg border-2 p-4"
            style={{
              borderColor: sharedValues.color,
              backgroundColor: sharedValues.bgColor,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <h4
                className="text-sm font-bold"
                style={{ color: sharedValues.color }}
              >
                {sharedValues.label}
              </h4>
              <button
                onClick={() => setEditingElement("shared_values")}
                className="rounded p-1 hover:bg-black/10"
              >
                <Plus className="h-4 w-4" style={{ color: sharedValues.color }} />
              </button>
            </div>
            <p className="mb-2 text-xs text-gray-500">
              Core values that underpin the organization
            </p>

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

        {/* Soft Elements Row (excluding Shared Values) */}
        <div className="grid grid-cols-3 gap-3">
          {softElements
            .filter((e) => e.id !== "shared_values")
            .map((element) => (
              <ElementCard
                key={element.id}
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
            ))}
        </div>
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
      className="rounded-lg border p-3"
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

      <div className="min-h-[60px] space-y-1">
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
