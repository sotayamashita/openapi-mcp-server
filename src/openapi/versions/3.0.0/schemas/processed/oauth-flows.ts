import { z } from "zod";

// OAuth Flow object schema definition
const OAuthFlowSchema = z.object({
  authorizationUrl: z.string().url().optional(),
  tokenUrl: z.string().url().optional(),
  refreshUrl: z.string().url().optional(),
  scopes: z.record(z.string(), z.string()),
});

// OAuth Flows object schema definition
export const OAuthFlowsSchema = z.object({
  implicit: OAuthFlowSchema.extend({
    authorizationUrl: z.string().url(),
  }).optional(),
  password: OAuthFlowSchema.extend({
    tokenUrl: z.string().url(),
  }).optional(),
  clientCredentials: OAuthFlowSchema.extend({
    tokenUrl: z.string().url(),
  }).optional(),
  authorizationCode: OAuthFlowSchema.extend({
    authorizationUrl: z.string().url(),
    tokenUrl: z.string().url(),
  }).optional(),
});

export type OAuthFlows = z.infer<typeof OAuthFlowsSchema>;
