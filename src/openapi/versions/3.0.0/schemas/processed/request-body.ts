import { z } from "zod";
import { MediaTypeSchema } from "./media-type";

// RequestBody object schema definition
export const RequestBodySchema = z.object({
  description: z.string().optional(),
  content: z.record(z.string(), MediaTypeSchema),
  required: z.boolean().optional(),
});

export type RequestBody = z.infer<typeof RequestBodySchema>;
