/**
 * DOCX Export Utility
 * FR-504: Export DOCX
 *
 * Generates professional Word documents from SOW data using docx library.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { GeneratedScope, Engagement } from "@/types";

interface ExportDOCXOptions {
  sowData: GeneratedScope;
  engagement: Engagement;
}

// Colors (hex format for docx)
const COLORS = {
  primary: "2563EB", // blue-600
  secondary: "6B7280", // gray-500
  text: "1F2937", // gray-800
  lightText: "4B5563", // gray-600
  success: "22C55E", // green-500
  warning: "F59E0B", // amber-500
  danger: "EF4444", // red-500
  background: "F9FAFB", // gray-50
};

/**
 * Export SOW to DOCX
 */
export async function exportSOWToDOCX({ sowData, engagement }: ExportDOCXOptions): Promise<void> {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: "Calibri",
            size: 22, // 11pt
            color: COLORS.text,
          },
          paragraph: {
            spacing: { after: 120 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Statement of Work",
                bold: true,
                size: 56, // 28pt
                color: COLORS.primary,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Engagement Title
          new Paragraph({
            children: [
              new TextRun({
                text: engagement.title,
                bold: true,
                size: 32, // 16pt
                color: COLORS.text,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Client Info
          new Paragraph({
            children: [
              new TextRun({ text: "Prepared for: ", bold: true }),
              new TextRun({ text: engagement.client_name }),
            ],
          }),
          ...(engagement.client_industry
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Industry: ", bold: true }),
                    new TextRun({ text: engagement.client_industry }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({ text: "Date: ", bold: true }),
              new TextRun({
                text: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              }),
            ],
            spacing: { after: 600 },
          }),

          // Horizontal line
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
            },
            spacing: { after: 400 },
          }),

          // Executive Summary
          new Paragraph({
            text: "Executive Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: sowData.executive_summary })],
            spacing: { after: 400 },
          }),

          // Objectives
          new Paragraph({
            text: "Objectives",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...sowData.objectives.map(
            (objective, idx) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${idx + 1}. `, bold: true, color: COLORS.success }),
                  new TextRun({ text: objective }),
                ],
                spacing: { after: 120 },
              })
          ),

          // Deliverables
          new Paragraph({
            text: "Deliverables",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...sowData.deliverables.flatMap((deliverable) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${deliverable.id}: `, bold: true, color: COLORS.primary }),
                new TextRun({ text: deliverable.name, bold: true }),
              ],
              shading: { type: ShadingType.SOLID, color: COLORS.background },
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: deliverable.description })],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Acceptance Criteria:", bold: true, size: 20, color: COLORS.lightText }),
              ],
              spacing: { after: 60 },
            }),
            ...deliverable.acceptance_criteria.map(
              (criteria) =>
                new Paragraph({
                  children: [new TextRun({ text: `  \u2022 ${criteria}`, size: 20 })],
                  spacing: { after: 40 },
                })
            ),
          ]),

          // Timeline
          new Paragraph({
            text: "Timeline",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          createTimelineTable(sowData.timeline),

          // Assumptions
          new Paragraph({
            text: "Assumptions",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...sowData.assumptions.map(
            (assumption) =>
              new Paragraph({
                children: [new TextRun({ text: `\u2022 ${assumption}` })],
                spacing: { after: 80 },
              })
          ),

          // Risks
          new Paragraph({
            text: "Risks & Mitigations",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...sowData.risks.flatMap((risk) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${risk.id} `, bold: true, color: COLORS.danger }),
                new TextRun({
                  text: `[${risk.likelihood}] `,
                  color: getLikelihoodColor(risk.likelihood),
                  size: 20,
                }),
                new TextRun({
                  text: `[${risk.impact} impact]`,
                  color: getImpactColor(risk.impact),
                  size: 20,
                }),
              ],
              shading: { type: ShadingType.SOLID, color: COLORS.background },
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: risk.description })],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Mitigation: ", bold: true, size: 20, color: COLORS.lightText }),
                new TextRun({ text: risk.mitigation, size: 20 }),
              ],
              spacing: { after: 200 },
            }),
          ]),

          // Footer
          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
            },
            spacing: { before: 600, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Generated by Consulting Framer",
                size: 18,
                color: COLORS.secondary,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const fileName = `SOW_${engagement.client_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}

/**
 * Create timeline table
 */
function createTimelineTable(timeline: GeneratedScope["timeline"]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Phase"),
          createHeaderCell("Duration"),
          createHeaderCell("Deliverables"),
        ],
      }),
      // Data rows
      ...timeline.map(
        (phase, idx) =>
          new TableRow({
            children: [
              createDataCell(`${phase.id}: ${phase.name}`, idx % 2 === 0),
              createDataCell(`${phase.duration_weeks} week${phase.duration_weeks !== 1 ? "s" : ""}`, idx % 2 === 0),
              createDataCell(phase.deliverables.join(", "), idx % 2 === 0),
            ],
          })
      ),
    ],
  });
}

function createHeaderCell(text: string): TableCell {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: COLORS.primary },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })],
      }),
    ],
  });
}

function createDataCell(text: string, alternate: boolean): TableCell {
  return new TableCell({
    shading: alternate ? { type: ShadingType.SOLID, color: COLORS.background } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20 })],
      }),
    ],
  });
}

function getLikelihoodColor(likelihood: "high" | "medium" | "low"): string {
  switch (likelihood) {
    case "high":
      return COLORS.danger;
    case "medium":
      return COLORS.warning;
    case "low":
      return COLORS.success;
  }
}

function getImpactColor(impact: "high" | "medium" | "low"): string {
  switch (impact) {
    case "high":
      return COLORS.danger;
    case "medium":
      return COLORS.warning;
    case "low":
      return COLORS.success;
  }
}
