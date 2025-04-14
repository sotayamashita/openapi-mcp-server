import { z } from "zod";
import { SchemaObjectSchema } from "./schema";
import { referenceOr } from "./reference";
import { ExampleSchema } from "./example";
import { MediaTypeSchema } from "./media-type";

// Define parameter location
const parameterInEnum = z.enum(["query", "header", "path", "cookie"]);

// Define parameter style
const styleEnum = z.enum([
  "matrix",
  "label",
  "form",
  "simple",
  "spaceDelimited",
  "pipeDelimited",
  "deepObject",
]);

// Parameter object schema definition
export const ParameterSchema = z.object({
  name: z.string(),
  in: parameterInEnum,
  description: z.string().optional(),
  required: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  allowEmptyValue: z.boolean().optional(),

  // Style options
  style: styleEnum.optional(),
  explode: z.boolean().optional(),
  allowReserved: z.boolean().optional(),
  schema: referenceOr(SchemaObjectSchema).optional(),
  example: z.any().optional(),
  examples: z.record(z.string(), referenceOr(ExampleSchema)).optional(),

  // Rich content
  content: z.record(z.string(), MediaTypeSchema).optional(),
});

export type Parameter = z.infer<typeof ParameterSchema>;
