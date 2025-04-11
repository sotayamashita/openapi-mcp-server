import { z } from "zod";
import { referenceOr } from "./reference";
import { ExternalDocumentationSchema } from "./external-documentation";
import { DiscriminatorSchema } from "./discriminator";
import { XmlSchema } from "./xml";

// JSON Schema型のリテラル
const typeEnum = z.enum([
  "array",
  "boolean",
  "integer",
  "number",
  "object",
  "string",
]);

// 再帰的なスキーマ定義のための前方宣言
const SchemaObjectSchema: z.ZodType<any> = z.lazy(() => {
  return z.object({
    // Schema Core vocabulary
    title: z.string().optional(),
    description: z.string().optional(),
    default: z.any().optional(),
    deprecated: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    writeOnly: z.boolean().optional(),
    example: z.any().optional(),

    // Schema Validation vocabulary
    type: typeEnum.or(z.array(typeEnum)).optional(),
    enum: z.array(z.any()).optional(),
    multipleOf: z.number().positive().optional(),
    maximum: z.number().optional(),
    exclusiveMaximum: z.boolean().optional(),
    minimum: z.number().optional(),
    exclusiveMinimum: z.boolean().optional(),
    maxLength: z.number().int().nonnegative().optional(),
    minLength: z.number().int().nonnegative().optional(),
    pattern: z.string().optional(),
    maxItems: z.number().int().nonnegative().optional(),
    minItems: z.number().int().nonnegative().optional(),
    uniqueItems: z.boolean().optional(),
    maxProperties: z.number().int().nonnegative().optional(),
    minProperties: z.number().int().nonnegative().optional(),
    required: z.array(z.string()).optional(),
    format: z.string().optional(),

    // Schema Structural vocabulary
    items: z
      .union([
        referenceOr(SchemaObjectSchema),
        z.array(referenceOr(SchemaObjectSchema)),
      ])
      .optional(),
    allOf: z.array(referenceOr(SchemaObjectSchema)).optional(),
    oneOf: z.array(referenceOr(SchemaObjectSchema)).optional(),
    anyOf: z.array(referenceOr(SchemaObjectSchema)).optional(),
    not: referenceOr(SchemaObjectSchema).optional(),
    properties: z
      .record(z.string(), referenceOr(SchemaObjectSchema))
      .optional(),
    additionalProperties: z
      .union([z.boolean(), referenceOr(SchemaObjectSchema)])
      .optional(),

    // OpenAPI specific fields
    nullable: z.boolean().optional(), // OpenAPI 3.0.0固有のフィールド
    discriminator: DiscriminatorSchema.optional(),
    xml: XmlSchema.optional(),
    externalDocs: ExternalDocumentationSchema.optional(),
  });
});

export { SchemaObjectSchema };
export type SchemaObject = z.infer<typeof SchemaObjectSchema>;
