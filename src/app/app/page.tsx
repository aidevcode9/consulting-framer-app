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
  Check,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { CanvasWithProvider } from "@/components/canvas/Canvas";
import { DiscoveryPanel } from "@/components/discovery/DiscoveryPanel";
import { SOWPreviewModal } from "@/components/sow/SOWPreviewModal";
import { ProposalPreviewModal } from "@/components/proposal/ProposalPreviewModal";
import { useUIStore, useEngagementStore, useCanvasStore } from "@/lib/store";

import type { Engagement, EngagementStatus, GeneratedScope, GeneratedProposal } from "@/types";

// Tab types for the right panel
type RightPanelTab = "discovery" | "scope" | null;

export default function AppPage() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { currentEngagement, setCurrentEngagement } = useEngagementStore();
  const { markSaved, getCanvasData, loadCanvas } = useCanvasStore();

  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("discovery");
  const [showNewEngagementModal, setShowNewEngagementModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EngagementStatus | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showSOWPreview, setShowSOWPreview] = useState(false);
  const [sowData, setSowData] = useState<GeneratedScope | null>(null);
  const [isGeneratingSOW, setIsGeneratingSOW] = useState(false);
  const [sowWarnings, setSowWarnings] = useState<string[]>([]);
  const [showProposalPreview, setShowProposalPreview] = useState(false);
  const [proposalData, setProposalData] = useState<GeneratedProposal | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter engagements based on search, status, and archive state
  // "on_hold" status is treated as archived (FR-704)
  const filteredEngagements = engagements.filter((e) => {
    const matchesSearch =
      searchQuery === "" ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const isArchived = e.status === "on_hold";
    const matchesArchive = showArchived || !isArchived;
    return matchesSearch && matchesStatus && matchesArchive;
  });

  // Count archived engagements
  const archivedCount = engagements.filter((e) => e.status === "on_hold").length;

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

  // Generate SOW (FR-509)
  const generateSOW = useCallback(async () => {
    if (!currentEngagement) return;

    setIsGeneratingSOW(true);
    setSowWarnings([]);

    try {
      const res = await fetch("/api/sow/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementId: currentEngagement.id }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate SOW");
      }

      const data = await res.json();
      setSowData(data.sow);

      // Detect incomplete sections (FR-508)
      const warnings: string[] = [];
      if (!data.sow.executive_summary || data.sow.executive_summary.length < 50) {
        warnings.push("Executive summary is too short or missing");
      }
      if (!data.sow.objectives || data.sow.objectives.length < 2) {
        warnings.push("Less than 2 objectives defined");
      }
      if (!data.sow.deliverables || data.sow.deliverables.length < 2) {
        warnings.push("Less than 2 deliverables defined");
      }
      if (!data.sow.timeline || data.sow.timeline.length < 1) {
        warnings.push("No timeline phases defined");
      }
      if (!data.sow.risks || data.sow.risks.length < 1) {
        warnings.push("No risks identified");
      }

      // Check if discovery has enough content
      const discoveryAnswers = currentEngagement.discovery_answers || {};
      const answeredQuestions = Object.keys(discoveryAnswers).length;
      if (answeredQuestions < 3) {
        warnings.push("Only " + answeredQuestions + " discovery questions answered - consider completing more");
      }

      // Check if canvas has frameworks
      const canvasNodes = currentEngagement.canvas_data?.nodes || [];
      const frameworkNodes = canvasNodes.filter(
        (n) => n.type === "swot" || n.type === "porter" || n.type === "mckinsey7s"
      );
      if (frameworkNodes.length === 0) {
        warnings.push("No frameworks added to canvas - SOW may lack analytical depth");
      }

      setSowWarnings(warnings);
      setShowSOWPreview(true);
    } catch (error) {
      console.error("Failed to generate SOW:", error);
      alert(error instanceof Error ? error.message : "Failed to generate SOW");
    } finally {
      setIsGeneratingSOW(false);
    }
  }, [currentEngagement]);

  // Handle SOW export
  const handleSOWExport = useCallback(() => {
    setShowSOWPreview(false);
  }, []);

  // Generate Proposal (FR-502)
  const generateProposal = useCallback(async () => {
    if (!currentEngagement) return;

    setIsGeneratingProposal(true);

    try {
      // Optionally pass SOW summary for context if SOW was generated
      const sowSummary = sowData?.executive_summary;

      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementId: currentEngagement.id,
          sowSummary,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate proposal");
      }

      const data = await res.json();
      setProposalData(data.proposal);
      setShowProposalPreview(true);
    } catch (error) {
      console.error("Failed to generate proposal:", error);
      alert(error instanceof Error ? error.message : "Failed to generate proposal");
    } finally {
      setIsGeneratingProposal(false);
    }
  }, [currentEngagement, sowData]);

  // Handle Proposal export
  const handleProposalExport = useCallback(() => {
    setShowProposalPreview(false);
  }, []);

  const handleSelectEngagement = (engagement: Engagement) => {
    // Load canvas data from the engagement (uses loadCanvas to avoid marking as dirty)
    loadCanvas(engagement.canvas_data || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
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
        loadCanvas({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
        setShowNewEngagementModal(false);
      }
    } catch (error) {
      console.error("Failed to create engagement:", error);
    }
  };

  // Update engagement status
  const handleStatusChange = async (newStatus: EngagementStatus) => {
    if (!currentEngagement) return;

    try {
      const res = await fetch(`/api/engagements/${currentEngagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update current engagement
        setCurrentEngagement(data.engagement);
        // Update in engagements list
        setEngagements((prev) =>
          prev.map((e) =>
            e.id === data.engagement.id ? data.engagement : e
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Archive/unarchive engagement (FR-704)
  const handleArchive = async (engagement: Engagement) => {
    const newStatus: EngagementStatus = engagement.status === "on_hold" ? "discovery" : "on_hold";

    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update in engagements list
        setEngagements((prev) =>
          prev.map((e) =>
            e.id === data.engagement.id ? data.engagement : e
          )
        );
        // If we archived the current engagement, deselect it
        if (currentEngagement?.id === engagement.id && newStatus === "on_hold") {
          setCurrentEngagement(null);
        }
      }
    } catch (error) {
      console.error("Failed to archive engagement:", error);
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

        {/* Search and Filter (FR-703) */}
        {sidebarOpen && (
          <div className="border-b px-3 pb-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search engagements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm placeholder-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            {/* Status Filter */}
            <div className="mt-2 flex gap-1 overflow-x-auto">
              <FilterChip
                label="All"
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              />
              <FilterChip
                label="Active"
                active={statusFilter === "active"}
                onClick={() => setStatusFilter("active")}
              />
              <FilterChip
                label="Discovery"
                active={statusFilter === "discovery"}
                onClick={() => setStatusFilter("discovery")}
              />
              <FilterChip
                label="Completed"
                active={statusFilter === "completed"}
                onClick={() => setStatusFilter("completed")}
              />
            </div>
            {/* Show Archived Toggle (FR-704) */}
            {archivedCount > 0 && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                <Archive className="h-3 w-3" />
                {showArchived ? "Hide" : "Show"} archived ({archivedCount})
              </button>
            )}
          </div>
        )}

        {/* Engagements List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">
                {statusFilter === "all" ? "All" : statusConfig[statusFilter]?.label} Engagements
                {filteredEngagements.length > 0 && ` (${filteredEngagements.length})`}
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
              ) : filteredEngagements.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  No matching engagements
                </div>
              ) : (
                filteredEngagements.map((engagement) => (
                  <div
                    key={engagement.id}
                    className={`group relative rounded-lg p-2 transition-colors ${
                      currentEngagement?.id === engagement.id
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <button
                      onClick={() => handleSelectEngagement(engagement)}
                      className="w-full text-left"
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
                    {/* Archive Button (FR-704) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(engagement);
                      }}
                      className="absolute right-2 top-2 hidden rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 group-hover:block"
                      title={engagement.status === "on_hold" ? "Restore" : "Archive"}
                    >
                      {engagement.status === "on_hold" ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                <StatusSelector
                  status={currentEngagement.status}
                  onStatusChange={handleStatusChange}
                />
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
                  <Link
                    href="/app/settings"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-100" />
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
                  <ScopePanel
                    onGenerateSOW={generateSOW}
                    isGeneratingSOW={isGeneratingSOW}
                    onGenerateProposal={generateProposal}
                    isGeneratingProposal={isGeneratingProposal}
                  />
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

      {/* SOW Preview Modal (FR-509) */}
      {showSOWPreview && sowData && currentEngagement && (
        <SOWPreviewModal
          open={showSOWPreview}
          sowData={sowData}
          engagement={currentEngagement}
          onClose={() => setShowSOWPreview(false)}
          onExport={handleSOWExport}
          warnings={sowWarnings}
        />
      )}

      {/* Proposal Preview Modal (FR-502) */}
      {showProposalPreview && proposalData && currentEngagement && (
        <ProposalPreviewModal
          open={showProposalPreview}
          proposalData={proposalData}
          engagement={currentEngagement}
          onClose={() => setShowProposalPreview(false)}
          onExport={handleProposalExport}
        />
      )}
    </div>
  );
}

// Status Configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  discovery: { bg: "bg-amber-100", text: "text-amber-700", label: "Discovery" },
  framing: { bg: "bg-blue-100", text: "text-blue-700", label: "Framing" },
  scoping: { bg: "bg-purple-100", text: "text-purple-700", label: "Scoping" },
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
  on_hold: { bg: "bg-red-100", text: "text-red-700", label: "On Hold" },
};

const statusOrder: EngagementStatus[] = [
  "discovery",
  "framing",
  "scoping",
  "active",
  "completed",
  "on_hold",
];

// Status Selector Component (FR-702)
function StatusSelector({
  status,
  onStatusChange,
}: {
  status: EngagementStatus;
  onStatusChange: (status: EngagementStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const config = statusConfig[status] || statusConfig.discovery;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors hover:ring-2 hover:ring-offset-1 ${config.bg} ${config.text}`}
      >
        {config.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
          {statusOrder.map((s) => {
            const cfg = statusConfig[s];
            const isSelected = s === status;
            return (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(s);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                  isSelected ? "bg-gray-50" : ""
                }`}
              >
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
                {isSelected && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Status Badge Component (for sidebar list)
function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.discovery;

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Filter Chip Component (FR-703)
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
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

// Scope Panel Component (FR-509, FR-502)
function ScopePanel({
  onGenerateSOW,
  isGeneratingSOW,
  onGenerateProposal,
  isGeneratingProposal,
}: {
  onGenerateSOW: () => void;
  isGeneratingSOW: boolean;
  onGenerateProposal: () => void;
  isGeneratingProposal: boolean;
}) {
  const isGenerating = isGeneratingSOW || isGeneratingProposal;

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <ClipboardList className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-2 font-semibold text-gray-700">Deliverables</h3>
      <p className="mb-6 text-sm text-gray-500">
        Generate professional documents based on your discovery answers and framework analysis.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Generate SOW Button */}
        <button
          onClick={onGenerateSOW}
          disabled={isGenerating}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            isGenerating
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isGeneratingSOW ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating SOW...
            </>
          ) : (
            <>
              <ClipboardList className="h-4 w-4" />
              Generate SOW
            </>
          )}
        </button>

        {/* Generate Proposal Button */}
        <button
          onClick={onGenerateProposal}
          disabled={isGenerating}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            isGenerating
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isGeneratingProposal ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating Proposal...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Proposal
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        SOW = Internal scope document • Proposal = Client-facing pitch
      </p>
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
