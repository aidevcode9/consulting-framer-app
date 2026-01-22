"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Plus,
  FolderOpen,
  Search,
  Bell,
  User,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { CanvasWithProvider } from "@/components/canvas/Canvas";
import { DiscoveryPanel } from "@/components/discovery/DiscoveryPanel";
import { useUIStore, useEngagementStore, useCanvasStore } from "@/lib/store";

import type { Engagement } from "@/types";

// Tab types for the right panel
type RightPanelTab = "discovery" | "scope" | null;

export default function AppPage() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { currentEngagement, setCurrentEngagement } = useEngagementStore();
  const { markSaved, getCanvasData, setNodes, setEdges } = useCanvasStore();

  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("discovery");
  const [showNewEngagementModal, setShowNewEngagementModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch engagements on mount
  useEffect(() => {
    async function fetchEngagements() {
      try {
        const res = await fetch("/api/engagements");
        if (res.ok) {
          const data = await res.json();
          setEngagements(data.engagements || []);
        }
      } catch (error) {
        console.error("Failed to fetch engagements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEngagements();
  }, []);

  // Save canvas to database
  const saveCanvasToDb = useCallback(async () => {
    if (!currentEngagement) return;

    const canvasData = getCanvasData();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/engagements/${currentEngagement.id}/canvas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvas_data: canvasData }),
      });

      if (res.ok) {
        markSaved();
      }
    } catch (error) {
      console.error("Failed to save canvas:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentEngagement, getCanvasData, markSaved]);

  // Auto-save every 5 seconds when dirty
  const handleSave = useCallback(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      saveCanvasToDb();
    }, 5000);
  }, [saveCanvasToDb]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSelectEngagement = (engagement: Engagement) => {
    // Load canvas data from the engagement
    if (engagement.canvas_data) {
      setNodes(engagement.canvas_data.nodes || []);
      setEdges(engagement.canvas_data.edges || []);
    }
    setCurrentEngagement(engagement);
  };

  const handleCreateEngagement = async (data: { title: string; clientName: string; industry: string }) => {
    try {
      const res = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          client_name: data.clientName,
          client_industry: data.industry || null,
        }),
      });

      if (res.ok) {
        const { engagement } = await res.json();
        setEngagements((prev) => [engagement, ...prev]);
        setCurrentEngagement(engagement);
        setNodes([]);
        setEdges([]);
        setShowNewEngagementModal(false);
      }
    } catch (error) {
      console.error("Failed to create engagement:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <aside
        className={`flex flex-col border-r bg-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Layers className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-gray-900">Framer</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* New Engagement Button */}
        <div className="p-3">
          <button
            onClick={() => setShowNewEngagementModal(true)}
            className={`flex w-full items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <Plus className="h-4 w-4" />
            {sidebarOpen && "New Engagement"}
          </button>
        </div>

        {/* Engagements List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Recent Engagements
              </span>
            </div>
            <div className="space-y-1">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  Loading...
                </div>
              ) : engagements.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  No engagements yet
                </div>
              ) : (
                engagements.map((engagement) => (
                  <button
                    key={engagement.id}
                    onClick={() => handleSelectEngagement(engagement)}
                    className={`w-full rounded-lg p-2 text-left transition-colors ${
                      currentEngagement?.id === engagement.id
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 truncate">
                        <p className="truncate text-sm font-medium">
                          {engagement.title}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {engagement.client_name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={engagement.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(engagement.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="border-t p-3">
          <nav className="space-y-1">
            <SidebarLink
              icon={LayoutGrid}
              label="Dashboard"
              active={false}
              collapsed={!sidebarOpen}
            />
            <SidebarLink
              icon={Settings}
              label="Settings"
              active={false}
              collapsed={!sidebarOpen}
            />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-4">
          <div className="flex items-center gap-4">
            {currentEngagement ? (
              <>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentEngagement.title}
                </h1>
                <StatusBadge status={currentEngagement.status} />
                {isSaving && (
                  <span className="text-xs text-gray-400">Saving...</span>
                )}
              </>
            ) : (
              <h1 className="text-lg font-semibold text-gray-500">
                Select or create an engagement
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Search className="h-5 w-5" />
            </button>
            {/* Notifications */}
            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <main className="flex-1 overflow-hidden">
            {currentEngagement ? (
              <CanvasWithProvider onSave={handleSave} />
            ) : (
              <EmptyState onCreateNew={() => setShowNewEngagementModal(true)} />
            )}
          </main>

          {/* Right Panel */}
          {currentEngagement && (
            <aside className="flex w-80 flex-col border-l bg-white">
              {/* Panel Tabs */}
              <div className="flex border-b">
                <PanelTabButton
                  icon={Sparkles}
                  label="Discovery"
                  active={rightPanelTab === "discovery"}
                  onClick={() => setRightPanelTab("discovery")}
                />
                <PanelTabButton
                  icon={ClipboardList}
                  label="Scope"
                  active={rightPanelTab === "scope"}
                  onClick={() => setRightPanelTab("scope")}
                />
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {rightPanelTab === "discovery" && (
                  <DiscoveryPanel
                    onComplete={() => {
                      console.log("Discovery complete!");
                    }}
                  />
                )}
                {rightPanelTab === "scope" && (
                  <ScopePanel />
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* New Engagement Modal */}
      {showNewEngagementModal && (
        <NewEngagementModal
          onClose={() => setShowNewEngagementModal(false)}
          onCreate={handleCreateEngagement}
        />
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    discovery: { bg: "bg-amber-100", text: "text-amber-700", label: "Discovery" },
    framing: { bg: "bg-blue-100", text: "text-blue-700", label: "Framing" },
    scoping: { bg: "bg-purple-100", text: "text-purple-700", label: "Scoping" },
    active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
    completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
    on_hold: { bg: "bg-red-100", text: "text-red-700", label: "On Hold" },
  };

  const config = statusConfig[status] || statusConfig.discovery;

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Sidebar Link Component
function SidebarLink({
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50"
      } ${collapsed && "justify-center"}`}
    >
      <Icon className="h-5 w-5" />
      {!collapsed && label}
    </button>
  );
}

// Panel Tab Button
function PanelTabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// Empty State Component
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
          <FolderOpen className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No engagement selected
        </h3>
        <p className="mb-6 text-gray-500">
          Select an existing engagement or create a new one to get started.
        </p>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Engagement
        </button>
      </div>
    </div>
  );
}

// Scope Panel Component
function ScopePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <ClipboardList className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-2 font-semibold text-gray-700">Scope Generation</h3>
      <p className="mb-4 text-sm text-gray-500">
        Complete the discovery questions and add frameworks to your canvas to generate a scope.
      </p>
      <button
        disabled
        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
      >
        Generate SOW
      </button>
    </div>
  );
}

// New Engagement Modal
function NewEngagementModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { title: string; clientName: string; industry: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && clientName) {
      onCreate({ title, clientName, industry });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          New Engagement
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Engagement Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Strategic Review 2026"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select industry...</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="financial_services">Financial Services</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="professional_services">Professional Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
