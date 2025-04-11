import { z } from "zod";
import { ServerVariableSchema } from "./server-variable";

// Server object schema definition
export const ServerSchema = z.object({
  url: z.string(),
  description: z.string().optional(),
  variables: z.record(ServerVariableSchema).optional(),
});

export type Server = z.infer<typeof ServerSchema>;
