import { z } from "zod";
import { HeaderSchema } from "./header";
import { referenceOr } from "./reference";

// Encoding オブジェクトスキーマ定義
export const EncodingSchema = z.object({
  contentType: z.string().optional(),
  headers: z.record(z.string(), referenceOr(HeaderSchema)).optional(),
  style: z.string().optional(),
  explode: z.boolean().optional(),
  allowReserved: z.boolean().optional(),
});

export type Encoding = z.infer<typeof EncodingSchema>;
