import { z } from "zod";
import { OperationSchema } from "./operation";
import { ParameterSchema } from "./parameter";
import { ServerSchema } from "./server";
import { referenceOr } from "./reference";

// PathItem object schema definition
export const PathItemSchema = z.object({
  // Basic information
  summary: z.string().optional(),
  description: z.string().optional(),

  // HTTP methods
  get: OperationSchema.optional(),
  put: OperationSchema.optional(),
  post: OperationSchema.optional(),
  delete: OperationSchema.optional(),
  options: OperationSchema.optional(),
  head: OperationSchema.optional(),
  patch: OperationSchema.optional(),
  trace: OperationSchema.optional(),

  // Common parameters and servers
  servers: z.array(ServerSchema).optional(),
  parameters: z.array(referenceOr(ParameterSchema)).optional(),
});

export type PathItem = z.infer<typeof PathItemSchema>;
