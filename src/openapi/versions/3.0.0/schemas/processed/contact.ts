import { z } from "zod";

// Contact オブジェクトスキーマ定義
export const ContactSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  email: z.string().email().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;
