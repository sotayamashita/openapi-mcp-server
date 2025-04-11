import { z } from "zod";

// Discriminator オブジェクトスキーマ定義
export const DiscriminatorSchema = z.object({
  propertyName: z.string(),
  mapping: z.record(z.string(), z.string()).optional(),
});

export type Discriminator = z.infer<typeof DiscriminatorSchema>;
