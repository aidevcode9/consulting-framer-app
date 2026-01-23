/**
 * Proposal DOCX Export Utility
 * FR-502: Generate Proposal
 *
 * Generates professional Word documents from proposal data using docx library.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { GeneratedProposal, Engagement } from "@/types";

interface ExportDOCXOptions {
  proposalData: GeneratedProposal;
  engagement: Engagement;
}

// Colors (hex format for docx)
const COLORS = {
  primary: "7C3AED", // purple-600
  secondary: "6B7280", // gray-500
  text: "1F2937", // gray-800
  lightText: "4B5563", // gray-600
  success: "22C55E", // green-500
  emerald: "10B981", // emerald-500
  indigo: "6366F1", // indigo-500
  background: "F9FAFB", // gray-50
};

/**
 * Export Proposal to DOCX
 */
export async function exportProposalToDOCX({ proposalData, engagement }: ExportDOCXOptions): Promise<void> {
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
                text: "Proposal",
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
            children: [new TextRun({ text: proposalData.executive_summary })],
            shading: { type: ShadingType.SOLID, color: "F3E8FF" }, // purple-100
            spacing: { after: 400 },
          }),

          // Situation Analysis
          new Paragraph({
            text: "Understanding Your Situation",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: proposalData.situation_analysis })],
            spacing: { after: 400 },
          }),

          // Proposed Approach
          new Paragraph({
            text: "Our Proposed Approach",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: proposalData.proposed_approach })],
            spacing: { after: 400 },
          }),

          // Key Benefits
          new Paragraph({
            text: "Key Benefits",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposalData.key_benefits.map(
            (benefit, idx) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${idx + 1}. `, bold: true, color: COLORS.success }),
                  new TextRun({ text: benefit }),
                ],
                spacing: { after: 120 },
              })
          ),

          // Methodology
          new Paragraph({
            text: "Methodology",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposalData.methodology.flatMap((phase, idx) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true, color: COLORS.indigo }),
                new TextRun({ text: phase.phase, bold: true }),
                new TextRun({ text: `  (${phase.duration})`, color: COLORS.lightText, size: 20 }),
              ],
              shading: { type: ShadingType.SOLID, color: COLORS.background },
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: phase.description })],
              spacing: { after: 100 },
            }),
            ...(phase.outcomes.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Key Outcomes:", bold: true, size: 20, color: COLORS.lightText }),
                    ],
                    spacing: { after: 60 },
                  }),
                  ...phase.outcomes.map(
                    (outcome) =>
                      new Paragraph({
                        children: [new TextRun({ text: `  → ${outcome}`, size: 20 })],
                        spacing: { after: 40 },
                      })
                  ),
                ]
              : []),
          ]),

          // Investment
          new Paragraph({
            text: "Investment",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...(proposalData.investment.summary
            ? [
                new Paragraph({
                  children: [new TextRun({ text: proposalData.investment.summary })],
                  spacing: { after: 200 },
                }),
              ]
            : []),
          ...proposalData.investment.options.flatMap((option) => [
            new Paragraph({
              children: [
                new TextRun({ text: option.name, bold: true, color: COLORS.emerald }),
                new TextRun({ text: `  —  ${option.price_range}`, bold: true }),
              ],
              shading: { type: ShadingType.SOLID, color: "D1FAE5" }, // emerald-100
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: option.description })],
              spacing: { after: 100 },
            }),
            ...(option.includes.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Includes:", bold: true, size: 20, color: COLORS.lightText }),
                    ],
                    spacing: { after: 60 },
                  }),
                  ...option.includes.map(
                    (item) =>
                      new Paragraph({
                        children: [new TextRun({ text: `  ✓ ${item}`, size: 20 })],
                        spacing: { after: 40 },
                      })
                  ),
                ]
              : []),
          ]),
          ...(proposalData.investment.terms
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: proposalData.investment.terms, italics: true, size: 20, color: COLORS.lightText }),
                  ],
                  spacing: { before: 200, after: 200 },
                }),
              ]
            : []),

          // Next Steps
          new Paragraph({
            text: "Next Steps",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...proposalData.next_steps.map(
            (step, idx) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${idx + 1}. `, bold: true, color: COLORS.indigo }),
                  new TextRun({ text: step }),
                ],
                spacing: { after: 100 },
              })
          ),

          // Why Us
          new Paragraph({
            text: "Why Choose Us",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: proposalData.why_us })],
            shading: { type: ShadingType.SOLID, color: "EDE9FE" }, // purple-100
            spacing: { after: 400 },
          }),

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
  const fileName = `Proposal_${engagement.client_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}
