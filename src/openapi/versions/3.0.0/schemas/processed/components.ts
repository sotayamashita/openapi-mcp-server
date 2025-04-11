import { z } from "zod";
import { SchemaObjectSchema } from "./schema";
import { ResponseSchema } from "./response";
import { ParameterSchema } from "./parameter";
import { ExampleSchema } from "./example";
import { RequestBodySchema } from "./request-body";
import { HeaderSchema } from "./header";
import { SecuritySchemeSchema } from "./security-scheme";
import { LinkSchema } from "./link";
import { CallbackSchema } from "./callback";
import { referenceOr } from "./reference";

// Components オブジェクトスキーマ定義
export const ComponentsSchema = z.object({
  schemas: z.record(z.string(), SchemaObjectSchema).optional(),
  responses: z.record(z.string(), referenceOr(ResponseSchema)).optional(),
  parameters: z.record(z.string(), referenceOr(ParameterSchema)).optional(),
  examples: z.record(z.string(), referenceOr(ExampleSchema)).optional(),
  requestBodies: z
    .record(z.string(), referenceOr(RequestBodySchema))
    .optional(),
  headers: z.record(z.string(), referenceOr(HeaderSchema)).optional(),
  securitySchemes: z
    .record(z.string(), referenceOr(SecuritySchemeSchema))
    .optional(),
  links: z.record(z.string(), referenceOr(LinkSchema)).optional(),
  callbacks: z.record(z.string(), referenceOr(CallbackSchema)).optional(),
});

export type Components = z.infer<typeof ComponentsSchema>;
