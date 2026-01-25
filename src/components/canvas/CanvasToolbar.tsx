"use client";

import { 
  Save, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Download,
  Trash2,
  MousePointer2,
  Hand,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useCanvasStore } from "@/lib/store";
import { toPng } from "html-to-image";

interface CanvasToolbarProps {
  onSave?: () => void;
  isDirty: boolean;
  readOnly?: boolean;
}

export function CanvasToolbar({ onSave, isDirty, readOnly }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView, getNodes } = useReactFlow();
  const { undo, redo, clearCanvas, deleteSelectedNodes, selectedNodes, mode, setMode, history, historyIndex } = useCanvasStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleExportPNG = async () => {
    const flowElement = document.querySelector(".react-flow") as HTMLElement;
    if (!flowElement) return;

    try {
      const dataUrl = await toPng(flowElement, {
        backgroundColor: "#f8fafc",
        quality: 1,
      });

      const link = document.createElement("a");
      link.download = `canvas-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white p-2 shadow-lg">
      {/* Mode Toggle */}
      <div className="flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5">
        <ToolbarButton
          icon={MousePointer2}
          tooltip="Select mode (V)"
          active={mode.type === "select"}
          onClick={() => setMode({ type: "select" })}
        />
        <ToolbarButton
          icon={Hand}
          tooltip="Pan mode (H)"
          active={mode.type === "pan"}
          onClick={() => setMode({ type: "pan" })}
        />
      </div>

      <Divider />

      {/* Undo/Redo */}
      {!readOnly && (
        <>
          <ToolbarButton
            icon={Undo2}
            tooltip="Undo (⌘Z)"
            onClick={undo}
            disabled={!canUndo}
          />
          <ToolbarButton
            icon={Redo2}
            tooltip="Redo (⌘⇧Z)"
            onClick={redo}
            disabled={!canRedo}
          />
          <Divider />
        </>
      )}

      {/* Zoom Controls */}
      <ToolbarButton
        icon={ZoomOut}
        tooltip="Zoom out"
        onClick={() => zoomOut()}
      />
      <ToolbarButton
        icon={ZoomIn}
        tooltip="Zoom in"
        onClick={() => zoomIn()}
      />
      <ToolbarButton
        icon={Maximize2}
        tooltip="Fit view"
        onClick={() => fitView({ padding: 0.2 })}
      />

      <Divider />

      {/* Export */}
      <ToolbarButton
        icon={Download}
        tooltip="Export as PNG"
        onClick={handleExportPNG}
        disabled={getNodes().length === 0}
      />

      {/* Delete Selected / Clear Canvas */}
      {!readOnly && (
        <ToolbarButton
          icon={Trash2}
          tooltip={selectedNodes.length > 0 ? `Delete selected (${selectedNodes.length})` : "Clear canvas"}
          onClick={() => {
            if (selectedNodes.length > 0) {
              deleteSelectedNodes();
            } else if (confirm("Clear all items from the canvas?")) {
              clearCanvas();
            }
          }}
          disabled={getNodes().length === 0}
          danger
        />
      )}

      <Divider />

      {/* Save */}
      {!readOnly && onSave && (
        <button
          onClick={onSave}
          disabled={!isDirty}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isDirty
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      )}
    </div>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  onClick,
  disabled,
  active,
  danger,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`rounded-md p-2 transition-colors ${
        disabled
          ? "cursor-not-allowed text-gray-300"
          : active
          ? "bg-blue-100 text-blue-600"
          : danger
          ? "text-gray-600 hover:bg-red-100 hover:text-red-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-gray-200" />;
}
