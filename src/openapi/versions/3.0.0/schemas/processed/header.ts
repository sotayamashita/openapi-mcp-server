import { z } from "zod";
import { SchemaObjectSchema } from "./schema";
import { referenceOr } from "./reference";
import { ExampleSchema } from "./example";

// ヘッダー内のコンテンツスタイル定義
const styleEnum = z.enum([
  "simple",
  "matrix",
  "label",
  "form",
  "spaceDelimited",
  "pipeDelimited",
  "deepObject",
]);

// Header オブジェクトスキーマ定義
export const HeaderSchema = z.object({
  description: z.string().optional(),
  required: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  allowEmptyValue: z.boolean().optional(),

  style: styleEnum.optional(),
  explode: z.boolean().optional(),
  allowReserved: z.boolean().optional(),
  schema: referenceOr(SchemaObjectSchema).optional(),
  example: z.any().optional(),
  examples: z.record(z.string(), referenceOr(ExampleSchema)).optional(),

  // この属性はヘッダー定義に含まれるべきでない
  name: z.string().optional(),
  in: z.string().optional(),
});

export type Header = z.infer<typeof HeaderSchema>;
