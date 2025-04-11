import { z } from "zod";

// Example object schema definition
export const ExampleSchema = z.object({
  summary: z.string().optional(),
  description: z.string().optional(),
  value: z.any().optional(),
  externalValue: z.string().optional(),
});

export type Example = z.infer<typeof ExampleSchema>;
