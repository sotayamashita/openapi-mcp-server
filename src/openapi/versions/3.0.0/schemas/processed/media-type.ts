import { z } from "zod";
import { SchemaObjectSchema } from "./schema";
import { referenceOr } from "./reference";
import { EncodingSchema } from "./encoding";
import { ExampleSchema } from "./example";

// MediaType object schema definition
export const MediaTypeSchema = z.object({
  schema: referenceOr(SchemaObjectSchema).optional(),
  example: z.any().optional(),
  examples: z.record(z.string(), referenceOr(ExampleSchema)).optional(),
  encoding: z.record(z.string(), EncodingSchema).optional(),
});

export type MediaType = z.infer<typeof MediaTypeSchema>;
