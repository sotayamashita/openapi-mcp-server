import { z } from "zod";
import { MediaTypeSchema } from "./media-type";
import { HeaderSchema } from "./header";
import { referenceOr } from "./reference";
import { LinkSchema } from "./link";

// Response オブジェクトスキーマ定義
export const ResponseSchema = z.object({
  description: z.string(),
  headers: z.record(z.string(), referenceOr(HeaderSchema)).optional(),
  content: z.record(z.string(), MediaTypeSchema).optional(),
  links: z.record(z.string(), referenceOr(LinkSchema)).optional(),
});

export type Response = z.infer<typeof ResponseSchema>;
