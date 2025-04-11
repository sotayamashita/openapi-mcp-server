import { z } from "zod";
import { OperationSchema } from "./operation";
import { ParameterSchema } from "./parameter";
import { ServerSchema } from "./server";
import { referenceOr } from "./reference";

// PathItem オブジェクトスキーマ定義
export const PathItemSchema = z.object({
  // 基本情報
  summary: z.string().optional(),
  description: z.string().optional(),

  // HTTP メソッド
  get: OperationSchema.optional(),
  put: OperationSchema.optional(),
  post: OperationSchema.optional(),
  delete: OperationSchema.optional(),
  options: OperationSchema.optional(),
  head: OperationSchema.optional(),
  patch: OperationSchema.optional(),
  trace: OperationSchema.optional(),

  // 共通パラメータとサーバー
  servers: z.array(ServerSchema).optional(),
  parameters: z.array(referenceOr(ParameterSchema)).optional(),
});

export type PathItem = z.infer<typeof PathItemSchema>;
