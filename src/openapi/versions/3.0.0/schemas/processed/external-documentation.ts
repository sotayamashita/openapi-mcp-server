import { z } from "zod";

// ExternalDocumentation オブジェクトスキーマ定義
export const ExternalDocumentationSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
});

export type ExternalDocumentation = z.infer<typeof ExternalDocumentationSchema>;
