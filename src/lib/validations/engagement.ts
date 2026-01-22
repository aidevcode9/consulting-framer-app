import { z } from "zod";

// UUID validation helper
export const uuidSchema = z.string().uuid("Invalid ID format");

// Create engagement input
export const createEngagementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  client_name: z.string().min(1, "Client name is required").max(200, "Client name too long"),
  client_industry: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
});

export type CreateEngagementInput = z.infer<typeof createEngagementSchema>;

// Update engagement input (all fields optional)
export const updateEngagementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  client_name: z.string().min(1).max(200).optional(),
  client_industry: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["discovery", "framing", "scoping", "active", "completed", "on_hold"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  estimated_value: z.number().positive().optional(),
  estimated_duration_weeks: z.number().int().positive().max(520).optional(),
});

export type UpdateEngagementInput = z.infer<typeof updateEngagementSchema>;

// Node item schema
const nodeItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  created_at: z.string(),
});

// Base node data schema
const baseNodeDataSchema = z.object({
  label: z.string(),
  color: z.string(),
  items: z.array(nodeItemSchema),
  description: z.string().optional(),
}).passthrough(); // Allow additional properties for framework-specific data

// Framework node schema
const frameworkNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["swot", "porter", "mckinsey7s", "bmc", "custom", "note", "image"]),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: baseNodeDataSchema,
}).passthrough(); // Allow React Flow additional properties

// Framework edge schema
const frameworkEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({
    label: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
}).passthrough(); // Allow React Flow additional properties

// Viewport schema
const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(10),
});

// Canvas data schema
export const canvasDataSchema = z.object({
  nodes: z.array(frameworkNodeSchema),
  edges: z.array(frameworkEdgeSchema),
  viewport: viewportSchema,
});

export type CanvasDataInput = z.infer<typeof canvasDataSchema>;

// Save canvas input
export const saveCanvasSchema = z.object({
  canvas_data: canvasDataSchema,
});

/**
 * Validate and parse input, returning typed result or throwing ValidationError
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
    throw new ValidationError(errors.join("; "));
  }
  return result.data;
}

// Re-export ValidationError for convenience
import { ValidationError } from "../errors";
export { ValidationError };
