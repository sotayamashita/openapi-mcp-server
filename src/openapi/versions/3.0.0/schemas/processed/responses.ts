import { z } from "zod";
import { ResponseSchema } from "./response";
import { referenceOr } from "./reference";

// Responses object schema definition
// Key is HTTP status code or default
export const ResponsesSchema = z.record(
  z.string(),
  referenceOr(ResponseSchema),
);

export type Responses = z.infer<typeof ResponsesSchema>;
