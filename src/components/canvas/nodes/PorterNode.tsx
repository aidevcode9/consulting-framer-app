"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import type { BaseNodeData, NodeItem } from "@/types";

interface PorterForce {
  id: "rivalry" | "suppliers" | "buyers" | "substitutes" | "entrants";
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

const PORTER_FORCES: PorterForce[] = [
  {
    id: "rivalry",
    label: "Competitive Rivalry",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    description: "Intensity of competition",
  },
  {
    id: "suppliers",
    label: "Supplier Power",
    color: "#06b6d4",
    bgColor: "#cffafe",
    description: "Bargaining power of suppliers",
  },
  {
    id: "buyers",
    label: "Buyer Power",
    color: "#10b981",
    bgColor: "#d1fae5",
    description: "Bargaining power of customers",
  },
  {
    id: "substitutes",
    label: "Threat of Substitutes",
    color: "#f97316",
    bgColor: "#ffedd5",
    description: "Alternative products/services",
  },
  {
    id: "entrants",
    label: "New Entrants",
    color: "#ec4899",
    bgColor: "#fce7f3",
    description: "Barriers to entry",
  },
];

interface PorterData extends BaseNodeData {
  forces?: Record<string, NodeItem[]>;
}

type PorterNodeProps = {
  id: string;
  data: PorterData;
  selected?: boolean;
};

export const PorterNode = memo(function PorterNode({
  id,
  data,
  selected,
}: PorterNodeProps) {
  const [editingForce, setEditingForce] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const { updateNode } = useCanvasStore();

  const forces = data.forces || {
    rivalry: [],
    suppliers: [],
    buyers: [],
    substitutes: [],
    entrants: [],
  };

  const handleAddItem = (forceId: string) => {
    if (!newItemText.trim()) return;

    const newForces = { ...forces };
    const newItem: NodeItem = {
      id: `${forceId}-${Date.now()}`,
      text: newItemText.trim(),
      created_at: new Date().toISOString(),
    };
    newForces[forceId] = [...(newForces[forceId] || []), newItem];

    updateNode(id, { ...data, forces: newForces });
    setNewItemText("");
    setEditingForce(null);
  };

  const handleRemoveItem = (forceId: string, itemId: string) => {
    const newForces = { ...forces };
    newForces[forceId] = newForces[forceId].filter((item) => item.id !== itemId);
    updateNode(id, { ...data, forces: newForces });
  };

  // Center force (Rivalry) is displayed prominently
  const centerForce = PORTER_FORCES.find((f) => f.id === "rivalry")!;
  const surroundingForces = PORTER_FORCES.filter((f) => f.id !== "rivalry");

  return (
    <div
      className={`rounded-lg bg-white shadow-lg transition-shadow ${
        selected ? "ring-2 ring-purple-500 shadow-xl" : ""
      }`}
      style={{ width: 600 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-white/70" />
          <h3 className="font-semibold text-white">Porter&apos;s Five Forces</h3>
        </div>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs text-white">
          Industry Analysis
        </span>
      </div>

      {/* Five Forces Layout - Diamond pattern */}
      <div className="p-4">
        {/* Top: New Entrants */}
        <div className="mb-3 flex justify-center">
          <ForceCard
            force={surroundingForces.find((f) => f.id === "entrants")!}
            items={forces.entrants || []}
            isEditing={editingForce === "entrants"}
            onEdit={() => setEditingForce("entrants")}
            onAdd={(text) => {
              setNewItemText(text);
              handleAddItem("entrants");
            }}
            onRemove={(itemId) => handleRemoveItem("entrants", itemId)}
            newItemText={newItemText}
            setNewItemText={setNewItemText}
            onCancel={() => setEditingForce(null)}
          />
        </div>

        {/* Middle Row: Suppliers - Rivalry - Buyers */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <ForceCard
            force={surroundingForces.find((f) => f.id === "suppliers")!}
            items={forces.suppliers || []}
            isEditing={editingForce === "suppliers"}
            onEdit={() => setEditingForce("suppliers")}
            onAdd={(text) => {
              setNewItemText(text);
              handleAddItem("suppliers");
            }}
            onRemove={(itemId) => handleRemoveItem("suppliers", itemId)}
            newItemText={newItemText}
            setNewItemText={setNewItemText}
            onCancel={() => setEditingForce(null)}
          />

          {/* Center: Rivalry (larger) */}
          <div
            className="flex-1 rounded-lg border-2 p-4"
            style={{
              borderColor: centerForce.color,
              backgroundColor: centerForce.bgColor,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <h4
                className="text-sm font-bold"
                style={{ color: centerForce.color }}
              >
                {centerForce.label}
              </h4>
              <button
                onClick={() => setEditingForce("rivalry")}
                className="rounded p-1 hover:bg-black/10"
              >
                <Plus className="h-4 w-4" style={{ color: centerForce.color }} />
              </button>
            </div>
            <p className="mb-2 text-xs text-gray-500">{centerForce.description}</p>

            <div className="space-y-1">
              {forces.rivalry?.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemoveItem("rivalry", item.id)}
                />
              ))}
              {editingForce === "rivalry" && (
                <AddItemInput
                  value={newItemText}
                  onChange={setNewItemText}
                  onAdd={() => handleAddItem("rivalry")}
                  onCancel={() => setEditingForce(null)}
                />
              )}
            </div>
          </div>

          <ForceCard
            force={surroundingForces.find((f) => f.id === "buyers")!}
            items={forces.buyers || []}
            isEditing={editingForce === "buyers"}
            onEdit={() => setEditingForce("buyers")}
            onAdd={(text) => {
              setNewItemText(text);
              handleAddItem("buyers");
            }}
            onRemove={(itemId) => handleRemoveItem("buyers", itemId)}
            newItemText={newItemText}
            setNewItemText={setNewItemText}
            onCancel={() => setEditingForce(null)}
          />
        </div>

        {/* Bottom: Substitutes */}
        <div className="flex justify-center">
          <ForceCard
            force={surroundingForces.find((f) => f.id === "substitutes")!}
            items={forces.substitutes || []}
            isEditing={editingForce === "substitutes"}
            onEdit={() => setEditingForce("substitutes")}
            onAdd={(text) => {
              setNewItemText(text);
              handleAddItem("substitutes");
            }}
            onRemove={(itemId) => handleRemoveItem("substitutes", itemId)}
            newItemText={newItemText}
            setNewItemText={setNewItemText}
            onCancel={() => setEditingForce(null)}
          />
        </div>
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
      <Handle type="target" position={Position.Left} className="!bg-purple-500" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />
    </div>
  );
});

// Reusable Force Card component
interface ForceCardProps {
  force: PorterForce;
  items: NodeItem[];
  isEditing: boolean;
  onEdit: () => void;
  onAdd: (text: string) => void;
  onRemove: (itemId: string) => void;
  newItemText: string;
  setNewItemText: (text: string) => void;
  onCancel: () => void;
}

function ForceCard({
  force,
  items,
  isEditing,
  onEdit,
  onAdd,
  onRemove,
  newItemText,
  setNewItemText,
  onCancel,
}: ForceCardProps) {
  return (
    <div
      className="w-[160px] rounded-lg border p-3"
      style={{ borderColor: force.color, backgroundColor: force.bgColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-xs font-semibold" style={{ color: force.color }}>
          {force.label}
        </h5>
        <button onClick={onEdit} className="rounded p-0.5 hover:bg-black/10">
          <Plus className="h-3 w-3" style={{ color: force.color }} />
        </button>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onRemove={() => onRemove(item.id)} small />
        ))}
        {isEditing && (
          <AddItemInput
            value={newItemText}
            onChange={setNewItemText}
            onAdd={() => onAdd(newItemText)}
            onCancel={onCancel}
            small
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
  small = false,
}: {
  item: NodeItem;
  onRemove: () => void;
  small?: boolean;
}) {
  return (
    <div
      className={`group flex items-start justify-between rounded bg-white/70 ${
        small ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      }`}
    >
      <span className="flex-1 text-gray-700">{item.text}</span>
      <button
        onClick={onRemove}
        className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2
          className={`text-gray-400 hover:text-red-500 ${small ? "h-2.5 w-2.5" : "h-3 w-3"}`}
        />
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
  small = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  small?: boolean;
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
      className={`w-full rounded border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${
        small ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      }`}
      autoFocus
    />
  );
}
