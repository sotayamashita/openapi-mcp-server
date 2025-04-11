import { z } from "zod";

// Reference オブジェクトスキーマ定義
export const ReferenceSchema = z.object({
  $ref: z.string(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

// スキーマまたは参照のどちらかを受け入れるユーティリティ関数
export function referenceOr<T extends z.ZodTypeAny>(schema: T) {
  return z.union([ReferenceSchema, schema]);
}
