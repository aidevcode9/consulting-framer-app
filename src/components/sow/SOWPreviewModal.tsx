"use client";

/**
 * SOW Preview Modal
 * FR-509: Preview before export
 *
 * Displays generated Statement of Work with all sections
 * before user approves for export.
 */

import { X, FileText, Target, CheckSquare, Calendar, AlertTriangle, Lightbulb } from "lucide-react";
import type { GeneratedScope, Engagement } from "@/types";

interface SOWPreviewModalProps {
  open: boolean;
  sowData: GeneratedScope;
  engagement: Engagement;
  onClose: () => void;
  onExport: () => void;
  warnings?: string[];
}

export function SOWPreviewModal({
  open,
  sowData,
  engagement,
  onClose,
  onExport,
  warnings = [],
}: SOWPreviewModalProps) {
  if (!open) return null;

  const getLikelihoodColor = (likelihood: "high" | "medium" | "low") => {
    switch (likelihood) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-green-100 text-green-700";
    }
  };

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Statement of Work Preview
            </h2>
            <p className="text-sm text-gray-500">
              {engagement.client_name} — {engagement.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warnings Banner (FR-508) */}
        {warnings.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  Incomplete sections detected
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm text-amber-700">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Executive Summary */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Executive Summary
                </h3>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-700">
                  {sowData.executive_summary}
                </p>
              </div>
            </section>

            {/* Objectives */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Objectives
                </h3>
              </div>
              <ul className="space-y-2">
                {sowData.objectives.map((objective, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-700">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Deliverables */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Deliverables
                </h3>
              </div>
              <div className="space-y-4">
                {sowData.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {deliverable.id}
                      </span>
                      <h4 className="font-medium text-gray-900">
                        {deliverable.name}
                      </h4>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {deliverable.description}
                    </p>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Acceptance Criteria
                      </p>
                      <ul className="space-y-1">
                        {deliverable.acceptance_criteria.map((criteria, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-3">
                {sowData.timeline.map((phase, idx) => (
                  <div
                    key={phase.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {idx + 1}
                      </span>
                      {idx < sowData.timeline.length - 1 && (
                        <div className="mt-2 h-full w-0.5 bg-blue-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{phase.name}</h4>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {phase.duration_weeks} week{phase.duration_weeks !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {phase.deliverables.length > 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          Deliverables: {phase.deliverables.join(", ")}
                        </p>
                      )}
                      {phase.dependencies.length > 0 && (
                        <p className="mt-1 text-xs text-gray-400">
                          Depends on: {phase.dependencies.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Assumptions */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Assumptions
                </h3>
              </div>
              <ul className="space-y-2">
                {sowData.assumptions.map((assumption, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {assumption}
                  </li>
                ))}
              </ul>
            </section>

            {/* Risks */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Risks</h3>
              </div>
              <div className="space-y-3">
                {sowData.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        {risk.id}
                      </span>
                      <div className="flex gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getLikelihoodColor(risk.likelihood)}`}
                        >
                          {risk.likelihood} likelihood
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getImpactColor(risk.impact)}`}
                        >
                          {risk.impact} impact
                        </span>
                      </div>
                    </div>
                    <p className="mb-2 text-gray-700">{risk.description}</p>
                    <div className="rounded bg-gray-50 p-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Mitigation
                      </p>
                      <p className="text-sm text-gray-600">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            Review all sections before exporting
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onExport}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Approve & Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
