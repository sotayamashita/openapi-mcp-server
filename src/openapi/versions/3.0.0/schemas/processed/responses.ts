import { z } from "zod";
import { ResponseSchema } from "./response";
import { referenceOr } from "./reference";

// Responses オブジェクトスキーマ定義
// キーはHTTPステータスコードかdefault
export const ResponsesSchema = z.record(
  z.string(),
  referenceOr(ResponseSchema),
);

export type Responses = z.infer<typeof ResponsesSchema>;
