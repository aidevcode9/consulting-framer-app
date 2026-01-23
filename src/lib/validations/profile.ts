import { z } from "zod";
import { ValidationError } from "../errors";

// Update profile input
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
  company: z.string().max(100).optional(),
  role: z.string().max(50).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Validate and parse input, returning typed result or throwing ValidationError
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    throw new ValidationError(errors.join("; "));
  }
  return result.data;
}
