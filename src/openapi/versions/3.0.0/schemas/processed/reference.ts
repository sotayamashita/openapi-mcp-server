import { z } from "zod";

// Reference object schema definition
export const ReferenceSchema = z.object({
  $ref: z.string(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

// Accepts either schema or reference
export function referenceOr<T extends z.ZodTypeAny>(schema: T) {
  return z.union([ReferenceSchema, schema]);
}
