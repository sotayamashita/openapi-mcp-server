import { z } from "zod";
import { ContactSchema } from "./contact";
import { LicenseSchema } from "./license";

// Info オブジェクトスキーマ定義
export const InfoSchema = z.object({
  title: z.string(),
  version: z.string(),
  description: z.string().optional(),
  termsOfService: z.string().url().optional(),
  contact: ContactSchema.optional(),
  license: LicenseSchema.optional(),
});

export type Info = z.infer<typeof InfoSchema>;
