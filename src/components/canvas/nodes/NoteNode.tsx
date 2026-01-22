"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { Trash2, GripVertical, Edit2, Check, X } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import type { BaseNodeData } from "@/types";

interface NoteData extends BaseNodeData {
  content?: string;
}

type NoteNodeProps = {
  id: string;
  data: NoteData;
  selected?: boolean;
};

const NOTE_COLORS = [
  { name: "Yellow", value: "#fef3c7", border: "#fbbf24" },
  { name: "Blue", value: "#dbeafe", border: "#3b82f6" },
  { name: "Green", value: "#dcfce7", border: "#22c55e" },
  { name: "Pink", value: "#fce7f3", border: "#ec4899" },
  { name: "Purple", value: "#ede9fe", border: "#8b5cf6" },
];

export const NoteNode = memo(function NoteNode({
  id,
  data,
  selected,
}: NoteNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.content || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { updateNode, removeNode } = useCanvasStore();

  const currentColor = NOTE_COLORS.find((c) => c.value === data.color) || NOTE_COLORS[0];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateNode(id, { ...data, content: editText });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(data.content || "");
    setIsEditing(false);
  };

  const handleColorChange = (color: typeof NOTE_COLORS[0]) => {
    updateNode(id, { ...data, color: color.value });
    setShowColorPicker(false);
  };

  return (
    <div
      className={`rounded-lg shadow-md transition-shadow ${
        selected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      style={{
        backgroundColor: data.color || currentColor.value,
        borderColor: currentColor.border,
        borderWidth: 2,
        minWidth: 200,
        maxWidth: 300,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between rounded-t-md px-3 py-2"
        style={{ backgroundColor: currentColor.border + "30" }}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Note</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Color picker toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="rounded p-1 hover:bg-black/10"
              title="Change color"
            >
              <div
                className="h-4 w-4 rounded-full border border-gray-400"
                style={{ backgroundColor: currentColor.border }}
              />
            </button>
            {showColorPicker && (
              <div className="absolute right-0 top-full z-10 mt-1 flex gap-1 rounded-lg bg-white p-2 shadow-lg">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      data.color === color.value ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.border }}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Edit button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 hover:bg-black/10"
              title="Edit note"
            >
              <Edit2 className="h-4 w-4 text-gray-500" />
            </button>
          )}

          {/* Delete button */}
          <button
            onClick={() => removeNode(id)}
            className="rounded p-1 hover:bg-black/10"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="w-full resize-none rounded border border-gray-300 bg-white/80 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder="Add your note here..."
            />
            <div className="flex justify-end gap-1">
              <button
                onClick={handleCancel}
                className="rounded p-1 text-gray-500 hover:bg-gray-200"
                title="Cancel (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                className="rounded p-1 text-green-600 hover:bg-green-100"
                title="Save (⌘+Enter)"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="min-h-[60px] cursor-pointer whitespace-pre-wrap text-sm text-gray-700"
            onClick={() => setIsEditing(true)}
          >
            {data.content || (
              <span className="italic text-gray-400">Click to add note...</span>
            )}
          </div>
        )}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
      <Handle type="target" position={Position.Left} className="!bg-gray-500" />
      <Handle type="source" position={Position.Right} className="!bg-gray-500" />
    </div>
  );
});
