import { z } from "zod";
import { SchemaObjectSchema } from "./schema";
import { referenceOr } from "./reference";
import { ExampleSchema } from "./example";

// Content style definition within header
const styleEnum = z.enum([
  "simple",
  "matrix",
  "label",
  "form",
  "spaceDelimited",
  "pipeDelimited",
  "deepObject",
]);

// Header object schema definition
export const HeaderSchema = z.object({
  description: z.string().optional(),
  required: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  allowEmptyValue: z.boolean().optional(),

  style: styleEnum.optional(),
  explode: z.boolean().optional(),
  allowReserved: z.boolean().optional(),
  schema: referenceOr(SchemaObjectSchema).optional(),
  example: z.any().optional(),
  examples: z.record(z.string(), referenceOr(ExampleSchema)).optional(),

  // These attributes should not be included in header definition
  name: z.string().optional(),
  in: z.string().optional(),
});

export type Header = z.infer<typeof HeaderSchema>;
