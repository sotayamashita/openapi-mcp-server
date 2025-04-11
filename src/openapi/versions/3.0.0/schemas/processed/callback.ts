import { z } from "zod";
import { referenceOr } from "./reference";

// Callback object schema definition
// Key is expression string, value is PathItem object
// Using z.lazy to avoid circular references
export const CallbackSchema = z.record(
  z.string(),
  z.lazy(() => {
    // Dynamic import at runtime
    const { PathItemSchema } = require("./path-item");
    return referenceOr(PathItemSchema);
  }),
);

export type Callback = z.infer<typeof CallbackSchema>;
