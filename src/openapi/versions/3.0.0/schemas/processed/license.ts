import { z } from "zod";

// License オブジェクトスキーマ定義
export const LicenseSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

export type License = z.infer<typeof LicenseSchema>;
