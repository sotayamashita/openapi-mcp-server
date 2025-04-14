import { z } from "zod";
import { ServerSchema } from "./server";

// Link object schema definition
export const LinkSchema = z.object({
  operationRef: z.string().optional(),
  operationId: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional(),
  requestBody: z.any().optional(),
  description: z.string().optional(),
  server: ServerSchema.optional(),
});

export type Link = z.infer<typeof LinkSchema>;
