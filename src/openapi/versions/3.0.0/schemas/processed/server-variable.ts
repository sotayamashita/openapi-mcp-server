import { z } from "zod";

// ServerVariable オブジェクトスキーマ定義
export const ServerVariableSchema = z.object({
  enum: z.array(z.string()).optional(),
  default: z.string(),
  description: z.string().optional(),
});

export type ServerVariable = z.infer<typeof ServerVariableSchema>;
