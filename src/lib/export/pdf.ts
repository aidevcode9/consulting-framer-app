/**
 * PDF Export Utility
 * FR-503: Export PDF
 *
 * Generates professional PDF documents from SOW data using jsPDF.
 */

import { jsPDF } from "jspdf";
import type { GeneratedScope, Engagement } from "@/types";

interface ExportPDFOptions {
  sowData: GeneratedScope;
  engagement: Engagement;
}

// Colors
const COLORS = {
  primary: [37, 99, 235] as [number, number, number], // blue-600
  secondary: [107, 114, 128] as [number, number, number], // gray-500
  text: [31, 41, 55] as [number, number, number], // gray-800
  lightText: [75, 85, 99] as [number, number, number], // gray-600
  border: [229, 231, 235] as [number, number, number], // gray-200
  background: [249, 250, 251] as [number, number, number], // gray-50
  success: [34, 197, 94] as [number, number, number], // green-500
  warning: [245, 158, 11] as [number, number, number], // amber-500
  danger: [239, 68, 68] as [number, number, number], // red-500
};

/**
 * Export SOW to PDF
 */
export function exportSOWToPDF({ sowData, engagement }: ExportPDFOptions): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper functions
  const addPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      addPage();
    }
  };

  const drawLine = (y: number) => {
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Title Page
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 60, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Statement of Work", margin, 35);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(engagement.title, margin, 48);

  // Client info
  yPos = 75;
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Prepared for:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(engagement.client_name, margin + 30, yPos);

  if (engagement.client_industry) {
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Industry:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(engagement.client_industry, margin + 30, yPos);
  }

  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }), margin + 30, yPos);

  yPos += 20;
  drawLine(yPos);
  yPos += 15;

  // Executive Summary
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Executive Summary", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const summaryLines = doc.splitTextToSize(sowData.executive_summary, contentWidth);
  for (const line of summaryLines) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  yPos += 10;

  // Objectives
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Objectives", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  sowData.objectives.forEach((objective, idx) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text(`${idx + 1}.`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);

    const objectiveLines = doc.splitTextToSize(objective, contentWidth - 10);
    objectiveLines.forEach((line: string, lineIdx: number) => {
      doc.text(line, margin + 8, yPos + lineIdx * 5);
    });
    yPos += objectiveLines.length * 5 + 3;
  });

  yPos += 10;

  // Deliverables
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Deliverables", margin, yPos);
  yPos += 10;

  sowData.deliverables.forEach((deliverable) => {
    checkPageBreak(40);

    // Deliverable header
    doc.setFillColor(...COLORS.background);
    doc.rect(margin, yPos - 4, contentWidth, 10, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(`${deliverable.id}: ${deliverable.name}`, margin + 3, yPos + 2);
    yPos += 12;

    // Description
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const descLines = doc.splitTextToSize(deliverable.description, contentWidth - 6);
    descLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + 3, yPos);
      yPos += 5;
    });

    // Acceptance Criteria
    yPos += 3;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.lightText);
    doc.setFontSize(9);
    doc.text("Acceptance Criteria:", margin + 3, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    deliverable.acceptance_criteria.forEach((criteria) => {
      checkPageBreak(6);
      doc.text(`• ${criteria}`, margin + 6, yPos);
      yPos += 5;
    });

    yPos += 8;
  });

  // Timeline
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Timeline", margin, yPos);
  yPos += 10;

  // Timeline table header
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, yPos - 4, contentWidth, 8, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Phase", margin + 3, yPos + 1);
  doc.text("Duration", margin + 80, yPos + 1);
  doc.text("Deliverables", margin + 110, yPos + 1);
  yPos += 8;

  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");

  sowData.timeline.forEach((phase, idx) => {
    checkPageBreak(10);

    if (idx % 2 === 0) {
      doc.setFillColor(...COLORS.background);
      doc.rect(margin, yPos - 4, contentWidth, 8, "F");
    }

    doc.text(`${phase.id}: ${phase.name}`, margin + 3, yPos + 1);
    doc.text(`${phase.duration_weeks} week${phase.duration_weeks !== 1 ? "s" : ""}`, margin + 80, yPos + 1);
    doc.text(phase.deliverables.join(", "), margin + 110, yPos + 1);
    yPos += 8;
  });

  yPos += 10;

  // Assumptions
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Assumptions", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  sowData.assumptions.forEach((assumption) => {
    checkPageBreak(8);
    const assumptionLines = doc.splitTextToSize(`• ${assumption}`, contentWidth - 5);
    assumptionLines.forEach((line: string) => {
      doc.text(line, margin + 3, yPos);
      yPos += 5;
    });
    yPos += 2;
  });

  yPos += 10;

  // Risks
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Risks & Mitigations", margin, yPos);
  yPos += 10;

  sowData.risks.forEach((risk) => {
    checkPageBreak(35);

    // Risk header with likelihood/impact badges
    doc.setFillColor(...COLORS.background);
    doc.rect(margin, yPos - 4, contentWidth, 10, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.danger);
    doc.text(risk.id, margin + 3, yPos + 2);

    // Likelihood badge
    const likelihoodColor = risk.likelihood === "high" ? COLORS.danger :
                           risk.likelihood === "medium" ? COLORS.warning : COLORS.success;
    doc.setTextColor(...likelihoodColor);
    doc.text(`[${risk.likelihood}]`, margin + 15, yPos + 2);

    // Impact badge
    const impactColor = risk.impact === "high" ? COLORS.danger :
                       risk.impact === "medium" ? COLORS.warning : COLORS.success;
    doc.setTextColor(...impactColor);
    doc.text(`[${risk.impact} impact]`, margin + 40, yPos + 2);

    yPos += 12;

    // Risk description
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const riskLines = doc.splitTextToSize(risk.description, contentWidth - 6);
    riskLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + 3, yPos);
      yPos += 5;
    });

    // Mitigation
    yPos += 3;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.lightText);
    doc.setFontSize(9);
    doc.text("Mitigation:", margin + 3, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const mitigationLines = doc.splitTextToSize(risk.mitigation, contentWidth - 10);
    mitigationLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 6, yPos);
      yPos += 5;
    });

    yPos += 8;
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(
      `Statement of Work - ${engagement.client_name} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      `Generated by Consulting Framer`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  // Download
  const fileName = `SOW_${engagement.client_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
