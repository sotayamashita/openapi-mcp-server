import { z } from "zod";
import { PathItemSchema } from "./path-item";
import { referenceOr } from "./reference";

// Paths オブジェクトスキーマ定義
// キーはパス文字列、値はPathItemオブジェクト
export const PathsSchema = z.record(z.string(), referenceOr(PathItemSchema));

export type Paths = z.infer<typeof PathsSchema>;
