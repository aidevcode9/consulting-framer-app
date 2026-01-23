/**
 * Proposal PDF Export Utility
 * FR-502: Generate Proposal
 *
 * Generates professional PDF documents from proposal data using jsPDF.
 */

import { jsPDF } from "jspdf";
import type { GeneratedProposal, Engagement } from "@/types";

interface ExportPDFOptions {
  proposalData: GeneratedProposal;
  engagement: Engagement;
}

// Colors
const COLORS = {
  primary: [124, 58, 237] as [number, number, number], // purple-600
  secondary: [107, 114, 128] as [number, number, number], // gray-500
  text: [31, 41, 55] as [number, number, number], // gray-800
  lightText: [75, 85, 99] as [number, number, number], // gray-600
  border: [229, 231, 235] as [number, number, number], // gray-200
  background: [249, 250, 251] as [number, number, number], // gray-50
  success: [34, 197, 94] as [number, number, number], // green-500
  emerald: [16, 185, 129] as [number, number, number], // emerald-500
  indigo: [99, 102, 241] as [number, number, number], // indigo-500
};

/**
 * Export Proposal to PDF
 */
export function exportProposalToPDF({ proposalData, engagement }: ExportPDFOptions): void {
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
  doc.rect(0, 0, pageWidth, 70, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Proposal", margin, 40);

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(engagement.title, margin, 55);

  // Client info
  yPos = 85;
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Prepared for:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(engagement.client_name, margin + 32, yPos);

  if (engagement.client_industry) {
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Industry:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(engagement.client_industry, margin + 32, yPos);
  }

  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }), margin + 32, yPos);

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

  const summaryLines = doc.splitTextToSize(proposalData.executive_summary, contentWidth);
  for (const line of summaryLines) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  yPos += 10;

  // Situation Analysis
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Understanding Your Situation", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const situationLines = doc.splitTextToSize(proposalData.situation_analysis, contentWidth);
  for (const line of situationLines) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  yPos += 10;

  // Proposed Approach
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Our Proposed Approach", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const approachLines = doc.splitTextToSize(proposalData.proposed_approach, contentWidth);
  for (const line of approachLines) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  yPos += 10;

  // Key Benefits
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Key Benefits", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  proposalData.key_benefits.forEach((benefit, idx) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text(`${idx + 1}.`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);

    const benefitLines = doc.splitTextToSize(benefit, contentWidth - 10);
    benefitLines.forEach((line: string, lineIdx: number) => {
      doc.text(line, margin + 8, yPos + lineIdx * 5);
    });
    yPos += benefitLines.length * 5 + 3;
  });

  yPos += 10;

  // Methodology
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Methodology", margin, yPos);
  yPos += 10;

  proposalData.methodology.forEach((phase) => {
    checkPageBreak(35);

    // Phase header
    doc.setFillColor(...COLORS.background);
    doc.rect(margin, yPos - 4, contentWidth, 10, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.indigo);
    doc.text(phase.phase, margin + 3, yPos + 2);

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.lightText);
    doc.text(phase.duration, pageWidth - margin - 20, yPos + 2);
    yPos += 12;

    // Description
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const descLines = doc.splitTextToSize(phase.description, contentWidth - 6);
    descLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + 3, yPos);
      yPos += 5;
    });

    // Outcomes
    if (phase.outcomes.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.lightText);
      doc.setFontSize(9);
      doc.text("Key Outcomes:", margin + 3, yPos);
      yPos += 5;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      phase.outcomes.forEach((outcome) => {
        checkPageBreak(6);
        doc.text(`→ ${outcome}`, margin + 6, yPos);
        yPos += 5;
      });
    }

    yPos += 8;
  });

  // Investment
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Investment", margin, yPos);
  yPos += 10;

  if (proposalData.investment.summary) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const summLines = doc.splitTextToSize(proposalData.investment.summary, contentWidth);
    summLines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  proposalData.investment.options.forEach((option) => {
    checkPageBreak(40);

    doc.setFillColor(...COLORS.background);
    doc.rect(margin, yPos - 4, contentWidth, 12, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.emerald);
    doc.text(option.name, margin + 3, yPos + 3);
    doc.text(option.price_range, pageWidth - margin - 40, yPos + 3);
    yPos += 14;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const optDescLines = doc.splitTextToSize(option.description, contentWidth - 6);
    optDescLines.forEach((line: string) => {
      doc.text(line, margin + 3, yPos);
      yPos += 5;
    });

    if (option.includes.length > 0) {
      yPos += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.lightText);
      doc.text("Includes:", margin + 3, yPos);
      yPos += 5;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      option.includes.forEach((item) => {
        checkPageBreak(6);
        doc.text(`✓ ${item}`, margin + 6, yPos);
        yPos += 5;
      });
    }

    yPos += 8;
  });

  if (proposalData.investment.terms) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.lightText);
    doc.text(proposalData.investment.terms, margin, yPos);
    yPos += 10;
  }

  // Next Steps
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Next Steps", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  proposalData.next_steps.forEach((step, idx) => {
    checkPageBreak(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.indigo);
    doc.text(`${idx + 1}.`, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(step, margin + 8, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Why Us
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Why Choose Us", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const whyUsLines = doc.splitTextToSize(proposalData.why_us, contentWidth);
  for (const line of whyUsLines) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(
      `Proposal - ${engagement.client_name} | Page ${i} of ${pageCount}`,
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
  const fileName = `Proposal_${engagement.client_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
