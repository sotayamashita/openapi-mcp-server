import { z } from "zod";
import { referenceOr } from "./reference";

// Callback オブジェクトスキーマ定義
// キーは式文字列、値はPathItemオブジェクト
// 循環参照を避けるためにz.lazyを使用
export const CallbackSchema = z.record(
  z.string(),
  z.lazy(() => {
    // 実行時に動的にインポート
    const { PathItemSchema } = require("./path-item");
    return referenceOr(PathItemSchema);
  }),
);

export type Callback = z.infer<typeof CallbackSchema>;
