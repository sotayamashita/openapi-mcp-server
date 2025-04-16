import { z } from "zod";
import type { ZodTypeAny } from "zod";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import type { SchemaConverterOptions } from "../types";

/**
 * Convert string schema
 */
function convertStringSchema(schema: OpenAPIV3_1.SchemaObject): ZodTypeAny {
  let zodSchema: ZodTypeAny = z.string();

  if (schema.enum) {
    if (schema.enum.length === 1) {
      zodSchema = z.union([z.string(), z.literal(schema.enum[0])]);
    } else {
      zodSchema = z.union([
        z.string(),
        z.enum([...schema.enum] as [string, ...string[]]),
      ]);
    }
  }

  if (schema.pattern && zodSchema._def.typeName === "ZodString") {
    zodSchema = (zodSchema as ReturnType<typeof z.string>).regex(
      new RegExp(schema.pattern),
    );
  }

  return zodSchema;
}

/**
 * Convert number schema
 */
function convertNumberSchema(schema: OpenAPIV3_1.SchemaObject): ZodTypeAny {
  let zodSchema = schema.type === "integer" ? z.number().int() : z.number();

  if (schema.minimum !== undefined) zodSchema = zodSchema.gte(schema.minimum);
  if (schema.maximum !== undefined) zodSchema = zodSchema.lte(schema.maximum);

  return zodSchema;
}

/**
 * Convert array schema
 */
function convertArraySchema(schema: OpenAPIV3_1.SchemaObject): ZodTypeAny {
  if (!schema.items) return z.array(z.any());

  return z.array(
    convertOpenAPISchemaToZod(schema.items as OpenAPIV3_1.SchemaObject),
  );
}

/**
 * Convert object schema
 */
function convertObjectSchema(schema: OpenAPIV3_1.SchemaObject): ZodTypeAny {
  const shape: Record<string, ZodTypeAny> = {};

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      const isRequired = schema.required?.includes(key) ?? false;
      const zodProp = convertOpenAPISchemaToZod(
        propSchema as OpenAPIV3_1.SchemaObject,
      );
      shape[key] = isRequired ? zodProp : zodProp.optional();
    });
  }

  return z.object(shape);
}

/**
 * Convert OpenAPI SchemaObject to Zod type
 * @param schema Schema to convert
 * @param options Conversion options
 * @returns Zod type
 */
export function convertOpenAPISchemaToZod(
  schema: OpenAPIV3_1.SchemaObject,
  options?: SchemaConverterOptions,
): ZodTypeAny {
  if (!schema) return z.any();

  let zodSchema: ZodTypeAny;

  // Convert based on type
  if (schema.type === "string") {
    zodSchema = convertStringSchema(schema);
  } else if (schema.type === "number" || schema.type === "integer") {
    zodSchema = convertNumberSchema(schema);
  } else if (schema.type === "boolean") {
    zodSchema = z.boolean();
  } else if (schema.type === "array") {
    zodSchema = convertArraySchema(schema);
  } else if (schema.type === "object" || schema.properties) {
    zodSchema = convertObjectSchema(schema);
  } else if (schema.type === "null") {
    zodSchema = z.null();
  } else {
    zodSchema = z.any();
  }

  // Handle options
  if (options?.makeOptional) {
    zodSchema = zodSchema.optional();
  }

  return zodSchema;
}
