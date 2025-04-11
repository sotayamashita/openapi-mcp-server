import { z } from "zod";
import { ExternalDocumentationSchema } from "./external-documentation";
import { ParameterSchema } from "./parameter";
import { ResponsesSchema } from "./responses";
import { RequestBodySchema } from "./request-body";
import { SecurityRequirementSchema } from "./security-requirement";
import { ServerSchema } from "./server";
import { referenceOr } from "./reference";
import { CallbackSchema } from "./callback";

// Operation オブジェクトスキーマ定義
export const OperationSchema = z.object({
  // 基本情報
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  externalDocs: ExternalDocumentationSchema.optional(),
  operationId: z.string().optional(),

  // パラメータと入力
  parameters: z.array(referenceOr(ParameterSchema)).optional(),
  requestBody: referenceOr(RequestBodySchema).optional(),

  // レスポンスとコールバック
  responses: ResponsesSchema,
  callbacks: z.record(z.string(), referenceOr(CallbackSchema)).optional(),

  // その他の属性
  deprecated: z.boolean().optional(),
  security: z.array(SecurityRequirementSchema).optional(),
  servers: z.array(ServerSchema).optional(),
});

export type Operation = z.infer<typeof OperationSchema>;
