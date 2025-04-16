import type { ZodTypeAny } from "zod";

/**
 * Map of Zod types (key-type pairs)
 */
export type ZodSchemaMap = Record<string, ZodTypeAny>;

/**
 * Schema conversion options
 */
export type SchemaConverterOptions = {
  /** If true, makes the resulting type optional */
  makeOptional?: boolean;
};
