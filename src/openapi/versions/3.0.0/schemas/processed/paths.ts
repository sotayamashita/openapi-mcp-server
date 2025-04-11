import { z } from "zod";
import { PathItemSchema } from "./path-item";
import { referenceOr } from "./reference";

// Paths object schema definition
// Key is path string, value is PathItem object
export const PathsSchema = z.record(z.string(), referenceOr(PathItemSchema));

export type Paths = z.infer<typeof PathsSchema>;
