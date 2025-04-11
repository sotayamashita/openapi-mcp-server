import { z } from "zod";
import { InfoSchema } from "./info";
import { ServerSchema } from "./server";
import { SecurityRequirementSchema } from "./security-requirement";
import { TagSchema } from "./tag";
import { ExternalDocumentationSchema } from "./external-documentation";

// OpenAPI 3.0.0のルートオブジェクトスキーマを定義
export const OpenApiObjectSchema = z.object({
  openapi: z.string().regex(/^3\.0\.\d+$/),
  info: InfoSchema,
  servers: z.array(ServerSchema).optional(),
  paths: z.record(z.string(), z.any()),
  components: z
    .object({
      schemas: z.record(z.string(), z.any()).optional(),
      responses: z.record(z.string(), z.any()).optional(),
      parameters: z.record(z.string(), z.any()).optional(),
      examples: z.record(z.string(), z.any()).optional(),
      requestBodies: z.record(z.string(), z.any()).optional(),
      headers: z.record(z.string(), z.any()).optional(),
      securitySchemes: z.record(z.string(), z.any()).optional(),
      links: z.record(z.string(), z.any()).optional(),
      callbacks: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  security: z.array(SecurityRequirementSchema).optional(),
  tags: z.array(TagSchema).optional(),
  externalDocs: ExternalDocumentationSchema.optional(),
});

// 型定義のエクスポート
export type OpenApiObject = z.infer<typeof OpenApiObjectSchema>;

// 他のスキーマをエクスポート
export * from "./contact";
export * from "./external-documentation";
export * from "./info";
export * from "./license";
export * from "./security-requirement";
export * from "./server";
export * from "./server-variable";
export * from "./tag";
