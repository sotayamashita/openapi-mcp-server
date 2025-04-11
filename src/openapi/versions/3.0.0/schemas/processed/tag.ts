import { z } from "zod";
import { ExternalDocumentationSchema } from "./external-documentation";

// Tag オブジェクトスキーマ定義
export const TagSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  externalDocs: ExternalDocumentationSchema.optional(),
});

export type Tag = z.infer<typeof TagSchema>;
