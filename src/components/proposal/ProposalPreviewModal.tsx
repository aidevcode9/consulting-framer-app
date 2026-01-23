"use client";

/**
 * Proposal Preview Modal
 * FR-502: Generate Proposal
 *
 * Displays generated client-facing proposal with all sections
 * before user approves for export.
 */

import { useState, useRef, useEffect } from "react";
import {
  X,
  FileText,
  Target,
  Lightbulb,
  Clock,
  DollarSign,
  ArrowRight,
  Building2,
  Download,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { exportProposalToPDF, exportProposalToDOCX } from "@/lib/export";
import type { GeneratedProposal, Engagement } from "@/types";

interface ProposalPreviewModalProps {
  open: boolean;
  proposalData: GeneratedProposal;
  engagement: Engagement;
  onClose: () => void;
  onExport: () => void;
}

export function ProposalPreviewModal({
  open,
  proposalData,
  engagement,
  onClose,
  onExport,
}: ProposalPreviewModalProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      exportProposalToPDF({ proposalData, engagement });
      onExport();
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await exportProposalToDOCX({ proposalData, engagement });
      onExport();
    } catch (error) {
      console.error("Failed to export DOCX:", error);
      alert("Failed to export DOCX. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Proposal Preview
            </h2>
            <p className="text-sm text-purple-100">
              {engagement.client_name} — {engagement.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-purple-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Executive Summary */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Executive Summary
                </h3>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 border-l-4 border-purple-500">
                <p className="whitespace-pre-wrap text-gray-700">
                  {proposalData.executive_summary}
                </p>
              </div>
            </section>

            {/* Situation Analysis */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Understanding Your Situation
                </h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-700">
                  {proposalData.situation_analysis}
                </p>
              </div>
            </section>

            {/* Proposed Approach */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Our Proposed Approach
                </h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-700">
                  {proposalData.proposed_approach}
                </p>
              </div>
            </section>

            {/* Key Benefits */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Key Benefits
                </h3>
              </div>
              <ul className="space-y-2">
                {proposalData.key_benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg bg-green-50 p-3"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-700">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Methodology */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Methodology
                </h3>
              </div>
              <div className="space-y-4">
                {proposalData.methodology.map((phase, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                        {idx + 1}
                      </span>
                      {idx < proposalData.methodology.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-indigo-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{phase.phase}</h4>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {phase.description}
                      </p>
                      {phase.outcomes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Key Outcomes
                          </p>
                          <ul className="mt-1 space-y-1">
                            {phase.outcomes.map((outcome, oidx) => (
                              <li
                                key={oidx}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-indigo-400" />
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Investment */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Investment
                </h3>
              </div>
              {proposalData.investment.summary && (
                <p className="mb-4 text-gray-600">
                  {proposalData.investment.summary}
                </p>
              )}
              <div className="space-y-4">
                {proposalData.investment.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{option.name}</h4>
                      <span className="text-lg font-bold text-emerald-700">
                        {option.price_range}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                    {option.includes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Includes
                        </p>
                        <ul className="mt-2 grid grid-cols-2 gap-2">
                          {option.includes.map((item, iidx) => (
                            <li
                              key={iidx}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {proposalData.investment.terms && (
                <p className="mt-4 text-sm text-gray-500 italic">
                  {proposalData.investment.terms}
                </p>
              )}
            </section>

            {/* Next Steps */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Next Steps
                </h3>
              </div>
              <ol className="space-y-2">
                {proposalData.next_steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg bg-blue-50 p-3"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Why Us */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Why Choose Us
                </h3>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border border-purple-100">
                <p className="text-gray-700">{proposalData.why_us}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            Review all sections before sharing with client
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  isExporting
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isExporting ? (
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
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              {showExportMenu && !isExporting && (
                <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={handleExportPDF}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4 text-red-600" />
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportDOCX}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    Export as DOCX
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
