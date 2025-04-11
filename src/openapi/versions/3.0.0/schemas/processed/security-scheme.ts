import { z } from "zod";
import { OAuthFlowsSchema } from "./oauth-flows";

// Security scheme type
const securitySchemeTypeEnum = z.enum([
  "apiKey",
  "http",
  "oauth2",
  "openIdConnect",
]);

// API key location
const apiKeyLocationEnum = z.enum(["query", "header", "cookie"]);

// SecurityScheme object schema definition
export const SecuritySchemeSchema = z.object({
  type: securitySchemeTypeEnum,
  description: z.string().optional(),

  // apiKey type case
  name: z.string().optional(),
  in: apiKeyLocationEnum.optional(),

  // http type case
  scheme: z.string().optional(),
  bearerFormat: z.string().optional(),

  // oauth2 type case
  flows: OAuthFlowsSchema.optional(),

  // openIdConnect type case
  openIdConnectUrl: z.string().url().optional(),
});

export type SecurityScheme = z.infer<typeof SecuritySchemeSchema>;
