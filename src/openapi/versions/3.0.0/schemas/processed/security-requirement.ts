import { z } from "zod";

// SecurityRequirement オブジェクトスキーマ定義
// キーはセキュリティスキーム名で、値はスコープのリスト
export const SecurityRequirementSchema = z.record(z.array(z.string()));

export type SecurityRequirement = z.infer<typeof SecurityRequirementSchema>;
