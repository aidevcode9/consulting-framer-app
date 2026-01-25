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
import { BMCNode } from "./nodes/BMCNode";
import { NoteNode } from "./nodes/NoteNode";
import { CanvasToolbar } from "./CanvasToolbar";
import { FrameworkPanel } from "./FrameworkPanel";
import type { FrameworkNode, FrameworkEdge } from "@/types";

// Register custom node types
const nodeTypes = {
  swot: SWOTNode,
  porter: PorterNode,
  mckinsey7s: McKinseyNode,
  bmc: BMCNode,
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

// Cache for AI-generated framework content to avoid redundant API calls
interface FrameworkCacheData {
  sections: Record<string, string[]>;
  strategic_insights?: unknown; // FR-454: Cache strategic insights too
}

interface CacheEntry {
  engagementId: string;
  answersHash: string;
  frameworks: Record<string, FrameworkCacheData>;
}

export function Canvas({ onSave, readOnly = false }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const frameworkCacheRef = useRef<CacheEntry | null>(null);
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

  // Helper to create a hash of discovery answers for cache invalidation
  const getAnswersHash = useCallback((answersObj: typeof answers): string => {
    const sorted = Object.entries(answersObj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v.value}`)
      .join("|");
    // Simple hash - just use length and first/last chars for quick comparison
    return `${sorted.length}-${sorted.slice(0, 50)}-${sorted.slice(-50)}`;
  }, []);

  // Convert raw sections (string arrays) to NodeItem arrays
  const convertSectionsToNodeItems = useCallback(
    (rawSections: Record<string, string[]>): Record<string, Array<{ id: string; text: string; created_at: string }>> => {
      const sections: Record<string, Array<{ id: string; text: string; created_at: string }>> = {};
      for (const [category, points] of Object.entries(rawSections)) {
        sections[category] = points.map((text, idx) => ({
          id: `${category}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`,
          text,
          created_at: new Date().toISOString(),
        }));
      }
      return sections;
    },
    []
  );

  // Auto-populate framework with AI content (with caching)
  const populateFramework = useCallback(
    async (nodeId: string, frameworkType: string) => {
      // Check if we have any discovery answers to use
      const hasAnswers = Object.keys(answers).length > 0;

      // Need engagement and some answers to populate
      if (!currentEngagement || !hasAnswers) {
        console.log("Cannot populate: no engagement or no answers", {
          hasEngagement: !!currentEngagement,
          hasAnswers,
          discoveryComplete,
        });
        return;
      }

      // Only populate strategy frameworks (not notes)
      const supportedTypes = ["swot", "porter", "mckinsey7s", "bmc"];
      if (!supportedTypes.includes(frameworkType)) return;

      const answersHash = getAnswersHash(answers);
      const cache = frameworkCacheRef.current;

      // Check cache: same engagement and same answers?
      if (
        cache &&
        cache.engagementId === currentEngagement.id &&
        cache.answersHash === answersHash &&
        cache.frameworks[frameworkType]
      ) {
        const cachedData = cache.frameworks[frameworkType];
        const convertedData = convertSectionsToNodeItems(cachedData.sections);
        // FR-454: Include cached strategic insights
        // Map to correct property name based on framework type
        const nodeUpdate: Record<string, unknown> = {};
        if (frameworkType === "porter") {
          nodeUpdate.forces = convertedData;
        } else if (frameworkType === "mckinsey7s") {
          nodeUpdate.elements = convertedData;
        } else {
          nodeUpdate.sections = convertedData;
        }
        if (cachedData.strategic_insights) {
          nodeUpdate.strategic_insights = cachedData.strategic_insights;
        }
        updateNode(nodeId, nodeUpdate);
        return;
      }

      console.log("Populating framework (API call):", { nodeId, frameworkType, answerCount: Object.keys(answers).length });

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
          const apiData = await response.json();
          console.log("Populate response:", apiData);
          const rawSections = apiData.sections || {};

          // Store in cache (FR-454: include strategic_insights)
          if (!frameworkCacheRef.current ||
              frameworkCacheRef.current.engagementId !== currentEngagement.id ||
              frameworkCacheRef.current.answersHash !== answersHash) {
            // Reset cache for new engagement/answers
            frameworkCacheRef.current = {
              engagementId: currentEngagement.id,
              answersHash,
              frameworks: {},
            };
          }
          frameworkCacheRef.current.frameworks[frameworkType] = {
            sections: rawSections,
            strategic_insights: apiData.strategic_insights,
          };

          const convertedData = convertSectionsToNodeItems(rawSections);
          console.log("Updating node with data:", convertedData);

          // FR-454: Include strategic insights from AI response
          // Map to correct property name based on framework type
          const nodeUpdate: Record<string, unknown> = {};
          if (frameworkType === "porter") {
            nodeUpdate.forces = convertedData;
          } else if (frameworkType === "mckinsey7s") {
            nodeUpdate.elements = convertedData;
          } else {
            nodeUpdate.sections = convertedData;
          }
          if (apiData.strategic_insights) {
            nodeUpdate.strategic_insights = apiData.strategic_insights;
          }
          updateNode(nodeId, nodeUpdate);
        } else {
          console.error("Populate API error:", response.status, await response.text());
        }
      } catch (error) {
        console.error("Failed to populate framework:", error);
      }
    },
    [currentEngagement, discoveryComplete, answers, updateNode, getAnswersHash, convertSectionsToNodeItems]
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

      // Auto-populate if we have discovery answers
      const hasAnswers = Object.keys(answers).length > 0;
      if (hasAnswers && currentEngagement) {
        populateFramework(nodeId, type);
      }
    },
    [screenToFlowPosition, addNode, answers, currentEngagement, populateFramework]
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

      // FR-211: Delete selected nodes with Delete or Backspace
      if (event.key === "Delete" || event.key === "Backspace") {
        // Don't delete if user is typing in an input/textarea
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        event.preventDefault();
        useCanvasStore.getState().deleteSelectedNodes();
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
    bmc: {
      label: "Business Model Canvas",
      color: "#10b981",
      items: [],
      description: "9-block business model visualization",
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
