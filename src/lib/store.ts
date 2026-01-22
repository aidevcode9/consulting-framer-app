import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  Engagement,
  CanvasData,
  FrameworkNode,
  FrameworkEdge,
  NodeItem,
  CanvasMode,
  DiscoveryAnswer,
  Profile,
} from "@/types";
import type { User } from "@supabase/supabase-js";
import type { Viewport } from "@xyflow/react";

// ============================================
// CANVAS STORE
// ============================================

interface CanvasState {
  // Canvas data
  nodes: FrameworkNode[];
  edges: FrameworkEdge[];
  viewport: Viewport;

  // Selection
  selectedNodes: string[];
  selectedEdges: string[];

  // Mode
  mode: CanvasMode;

  // Dirty state
  isDirty: boolean;
  lastSaved: string | null;

  // History for undo/redo
  history: CanvasData[];
  historyIndex: number;

  // Actions
  setNodes: (nodes: FrameworkNode[]) => void;
  setEdges: (edges: FrameworkEdge[]) => void;
  setViewport: (viewport: Viewport) => void;

  addNode: (node: FrameworkNode) => void;
  updateNode: (nodeId: string, data: Partial<FrameworkNode["data"]>) => void;
  removeNode: (nodeId: string) => void;

  addEdge: (edge: FrameworkEdge) => void;
  removeEdge: (edgeId: string) => void;

  addItemToNode: (nodeId: string, text: string) => void;
  updateItemInNode: (nodeId: string, itemId: string, text: string) => void;
  removeItemFromNode: (nodeId: string, itemId: string) => void;

  selectNodes: (nodeIds: string[]) => void;
  selectEdges: (edgeIds: string[]) => void;
  clearSelection: () => void;

  setMode: (mode: CanvasMode) => void;

  loadCanvas: (data: CanvasData) => void;
  clearCanvas: () => void;

  markDirty: () => void;
  markSaved: () => void;

  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  getCanvasData: () => CanvasData;
}

const initialCanvasData: CanvasData = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodes: [],
      selectedEdges: [],
      mode: { type: "select" },
      isDirty: false,
      lastSaved: null,
      history: [initialCanvasData],
      historyIndex: 0,

      // Node actions
      setNodes: (nodes) => set({ nodes, isDirty: true }),
      setEdges: (edges) => set({ edges, isDirty: true }),
      setViewport: (viewport) => set({ viewport }),

      addNode: (node) => {
        const state = get();
        state.saveToHistory();
        set({ nodes: [...state.nodes, node], isDirty: true });
      },

      updateNode: (nodeId, data) => {
        const state = get();
        const nodes = state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        );
        set({ nodes, isDirty: true });
      },

      removeNode: (nodeId) => {
        const state = get();
        state.saveToHistory();
        const nodes = state.nodes.filter((node) => node.id !== nodeId);
        const edges = state.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        );
        set({ nodes, edges, isDirty: true });
      },

      // Edge actions
      addEdge: (edge) => {
        const state = get();
        state.saveToHistory();
        set({ edges: [...state.edges, edge], isDirty: true });
      },

      removeEdge: (edgeId) => {
        const state = get();
        state.saveToHistory();
        const edges = state.edges.filter((edge) => edge.id !== edgeId);
        set({ edges, isDirty: true });
      },

      // Item actions (for adding items to framework nodes)
      addItemToNode: (nodeId, text) => {
        const state = get();
        const newItem: NodeItem = {
          id: uuidv4(),
          text,
          created_at: new Date().toISOString(),
        };
        const nodes = state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, items: [...node.data.items, newItem] } }
            : node
        );
        set({ nodes, isDirty: true });
      },

      updateItemInNode: (nodeId, itemId, text) => {
        const state = get();
        const nodes = state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  items: node.data.items.map((item) =>
                    item.id === itemId ? { ...item, text } : item
                  ),
                },
              }
            : node
        );
        set({ nodes, isDirty: true });
      },

      removeItemFromNode: (nodeId, itemId) => {
        const state = get();
        const nodes = state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  items: node.data.items.filter((item) => item.id !== itemId),
                },
              }
            : node
        );
        set({ nodes, isDirty: true });
      },

      // Selection
      selectNodes: (nodeIds) => set({ selectedNodes: nodeIds }),
      selectEdges: (edgeIds) => set({ selectedEdges: edgeIds }),
      clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

      // Mode
      setMode: (mode) => set({ mode }),

      // Canvas operations
      loadCanvas: (data) => {
        set({
          nodes: data.nodes,
          edges: data.edges,
          viewport: data.viewport,
          isDirty: false,
          history: [data],
          historyIndex: 0,
        });
      },

      clearCanvas: () => {
        const state = get();
        state.saveToHistory();
        set({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          isDirty: true,
        });
      },

      // Dirty state
      markDirty: () => set({ isDirty: true }),
      markSaved: () => set({ isDirty: false, lastSaved: new Date().toISOString() }),

      // History (undo/redo)
      saveToHistory: () => {
        const state = get();
        const currentData = state.getCanvasData();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(currentData);
        // Keep max 50 history items
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const data = state.history[newIndex];
          set({
            nodes: data.nodes,
            edges: data.edges,
            viewport: data.viewport,
            historyIndex: newIndex,
            isDirty: true,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const data = state.history[newIndex];
          set({
            nodes: data.nodes,
            edges: data.edges,
            viewport: data.viewport,
            historyIndex: newIndex,
            isDirty: true,
          });
        }
      },

      // Get current canvas data
      getCanvasData: () => {
        const state = get();
        return {
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport,
        };
      },
    }),
    { name: "canvas-store" }
  )
);

// ============================================
// ENGAGEMENT STORE
// ============================================

interface EngagementState {
  currentEngagement: Engagement | null;
  engagements: Engagement[];
  isLoading: boolean;
  error: string | null;

  setCurrentEngagement: (engagement: Engagement | null) => void;
  setEngagements: (engagements: Engagement[]) => void;
  updateCurrentEngagement: (updates: Partial<Engagement>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEngagementStore = create<EngagementState>()(
  devtools(
    (set, get) => ({
      currentEngagement: null,
      engagements: [],
      isLoading: false,
      error: null,

      setCurrentEngagement: (engagement) => set({ currentEngagement: engagement }),
      setEngagements: (engagements) => set({ engagements }),
      updateCurrentEngagement: (updates) => {
        const current = get().currentEngagement;
        if (current) {
          set({ currentEngagement: { ...current, ...updates } });
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: "engagement-store" }
  )
);

// ============================================
// DISCOVERY STORE
// ============================================

interface DiscoveryState {
  answers: Record<string, DiscoveryAnswer>;
  currentQuestionIndex: number;
  isComplete: boolean;
  aiFollowUp: string | null;
  isProcessing: boolean;

  setAnswer: (questionId: string, answer: DiscoveryAnswer) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setComplete: (complete: boolean) => void;
  setAIFollowUp: (followUp: string | null) => void;
  setProcessing: (processing: boolean) => void;
  loadAnswers: (answers: Record<string, DiscoveryAnswer>) => void;
  reset: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    (set) => ({
      answers: {},
      currentQuestionIndex: 0,
      isComplete: false,
      aiFollowUp: null,
      isProcessing: false,

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      setComplete: (isComplete) => set({ isComplete }),
      setAIFollowUp: (aiFollowUp) => set({ aiFollowUp }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      loadAnswers: (answers) => set({ answers }),
      reset: () =>
        set({
          answers: {},
          currentQuestionIndex: 0,
          isComplete: false,
          aiFollowUp: null,
          isProcessing: false,
        }),
    }),
    { name: "discovery-store" }
  )
);

// ============================================
// UI STORE
// ============================================

interface UIState {
  sidebarOpen: boolean;
  frameworkPanelOpen: boolean;
  discoveryPanelOpen: boolean;
  activeTab: "canvas" | "discovery" | "scope" | "deliverables";

  setSidebarOpen: (open: boolean) => void;
  setFrameworkPanelOpen: (open: boolean) => void;
  setDiscoveryPanelOpen: (open: boolean) => void;
  setActiveTab: (tab: UIState["activeTab"]) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      frameworkPanelOpen: true,
      discoveryPanelOpen: false,
      activeTab: "canvas",

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setFrameworkPanelOpen: (frameworkPanelOpen) => set({ frameworkPanelOpen }),
      setDiscoveryPanelOpen: (discoveryPanelOpen) => set({ discoveryPanelOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: "ui-store" }
  )
);

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized, isLoading: false }),
      clearAuth: () => set({ user: null, profile: null, isLoading: false }),
    }),
    { name: "auth-store" }
  )
);
