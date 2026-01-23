"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCanvasStore, useDiscoveryStore, useEngagementStore } from "@/lib/store";
import { SWOTNode } from "./nodes/SWOTNode";
import { PorterNode } from "./nodes/PorterNode";
import { McKinseyNode } from "./nodes/McKinseyNode";
import { NoteNode } from "./nodes/NoteNode";
import { CanvasToolbar } from "./CanvasToolbar";
import { FrameworkPanel } from "./FrameworkPanel";
import type { FrameworkNode, FrameworkEdge } from "@/types";

// Register custom node types
const nodeTypes = {
  swot: SWOTNode,
  porter: PorterNode,
  mckinsey7s: McKinseyNode,
  note: NoteNode,
} as unknown as NodeTypes;

// Edge styles
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: "#64748b" },
  type: "smoothstep",
  animated: false,
};

interface CanvasProps {
  onSave?: () => void;
  readOnly?: boolean;
}

export function Canvas({ onSave, readOnly = false }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    viewport,
    setNodes,
    setEdges,
    setViewport,
    addNode,
    updateNode,
    addEdge: addEdgeToStore,
    saveToHistory,
    isDirty,
  } = useCanvasStore();

  const { isComplete: discoveryComplete, answers } = useDiscoveryStore();
  const { currentEngagement } = useEngagementStore();

  // Handle node changes (position, selection, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange<FrameworkNode>[]) => {
      const newNodes = applyNodeChanges(changes, nodes) as FrameworkNode[];
      setNodes(newNodes);
    },
    [nodes, setNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange<FrameworkEdge>[]) => {
      const newEdges = applyEdgeChanges(changes, edges) as FrameworkEdge[];
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      saveToHistory();
      const newEdge: FrameworkEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        type: "smoothstep",
      } as FrameworkEdge;
      addEdgeToStore(newEdge);
    },
    [addEdgeToStore, saveToHistory]
  );

  // Auto-populate framework with AI content
  const populateFramework = useCallback(
    async (nodeId: string, frameworkType: string) => {
      if (!currentEngagement || !discoveryComplete) return;

      // Only populate strategy frameworks (not notes)
      const supportedTypes = ["swot", "porter", "mckinsey7s"];
      if (!supportedTypes.includes(frameworkType)) return;

      try {
        const response = await fetch("/api/ai/populate-canvas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            engagementId: currentEngagement.id,
            frameworkType,
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

        if (response.ok) {
          const data = await response.json();
          // Convert sections to items array
          const items = Object.entries(data.sections || {}).flatMap(
            ([category, points]) =>
              (points as string[]).map((text) => ({
                id: `${category}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                text,
                category,
                created_at: new Date().toISOString(),
              }))
          );
          updateNode(nodeId, { items });
        }
      } catch (error) {
        console.error("Failed to populate framework:", error);
      }
    },
    [currentEngagement, discoveryComplete, answers, updateNode]
  );

  // Handle dropping new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowWrapper.current) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeId = `${type}-${Date.now()}`;
      const newNode: FrameworkNode = {
        id: nodeId,
        type: type as FrameworkNode["type"],
        position,
        data: getDefaultNodeData(type),
      };

      addNode(newNode);

      // Auto-populate if discovery is complete
      if (discoveryComplete && currentEngagement) {
        populateFramework(nodeId, type);
      }
    },
    [screenToFlowPosition, addNode, discoveryComplete, currentEngagement, populateFramework]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readOnly) return;

      // Undo: Cmd/Ctrl + Z
      if ((event.metaKey || event.ctrlKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        useCanvasStore.getState().undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (
        ((event.metaKey || event.ctrlKey) && event.key === "z" && event.shiftKey) ||
        ((event.metaKey || event.ctrlKey) && event.key === "y")
      ) {
        event.preventDefault();
        useCanvasStore.getState().redo();
      }

      // Save: Cmd/Ctrl + S
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readOnly, onSave]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        defaultViewport={viewport}
        onViewportChange={setViewport}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        selectNodesOnDrag={!readOnly}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        className="bg-slate-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#cbd5e1"
        />
        <Controls showInteractive={!readOnly} />
        <MiniMap
          nodeStrokeColor={(node) => {
            const n = node as FrameworkNode;
            return n.data?.color || "#64748b";
          }}
          nodeColor={(node) => {
            const n = node as FrameworkNode;
            return n.data?.color ? `${n.data.color}20` : "#f1f5f9";
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Toolbar */}
        <Panel position="top-left">
          <CanvasToolbar onSave={onSave} isDirty={isDirty} readOnly={readOnly} />
        </Panel>

        {/* Framework Panel */}
        <Panel position="top-right">
          <FrameworkPanel />
        </Panel>

        {/* Dirty indicator */}
        {isDirty && (
          <Panel position="bottom-center">
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">
              Unsaved changes
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// Helper to get default node data for each type
function getDefaultNodeData(type: string) {
  const defaults: Record<string, FrameworkNode["data"]> = {
    swot: {
      label: "SWOT Analysis",
      color: "#3b82f6",
      items: [],
      description: "Analyze Strengths, Weaknesses, Opportunities, and Threats",
    },
    porter: {
      label: "Porter's Five Forces",
      color: "#8b5cf6",
      items: [],
      description: "Analyze competitive forces in the industry",
    },
    mckinsey7s: {
      label: "McKinsey 7-S",
      color: "#6366f1",
      items: [],
      description: "Organizational alignment analysis",
    },
    note: {
      label: "Note",
      color: "#fbbf24",
      items: [],
      description: "",
    },
  };

  return defaults[type] || defaults.note;
}

// Wrapper with ReactFlowProvider
import { ReactFlowProvider } from "@xyflow/react";

export function CanvasWithProvider(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
