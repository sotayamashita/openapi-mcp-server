import { z } from "zod";
import { OAuthFlowsSchema } from "./oauth-flows";

// セキュリティスキームタイプ
const securitySchemeTypeEnum = z.enum([
  "apiKey",
  "http",
  "oauth2",
  "openIdConnect",
]);

// APIキーの場所
const apiKeyLocationEnum = z.enum(["query", "header", "cookie"]);

// SecurityScheme オブジェクトスキーマ定義
export const SecuritySchemeSchema = z.object({
  type: securitySchemeTypeEnum,
  description: z.string().optional(),

  // apiKey タイプの場合
  name: z.string().optional(),
  in: apiKeyLocationEnum.optional(),

  // http タイプの場合
  scheme: z.string().optional(),
  bearerFormat: z.string().optional(),

  // oauth2 タイプの場合
  flows: OAuthFlowsSchema.optional(),

  // openIdConnect タイプの場合
  openIdConnectUrl: z.string().url().optional(),
});

export type SecurityScheme = z.infer<typeof SecuritySchemeSchema>;
