import { OpenApiObjectSchema, type OpenApiObject } from "./schemas/processed";

/**
 * Parse and validate an OpenAPI 3.0.0 document
 *
 * @param document OpenAPI document
 * @returns Validated OpenAPI 3.0.0 document
 * @throws When schema validation fails
 */
export function parseOpenApi(document: unknown): OpenApiObject {
  // Validate using Zod schema
  const validatedDoc = OpenApiObjectSchema.parse(document);
  return processOpenApi(validatedDoc);
}

/**
 * Process a validated OpenAPI 3.0.0 document
 *
 * @param validatedDoc Validated OpenAPI 3.0.0 document
 * @returns Processed OpenAPI 3.0.0 document
 */
function processOpenApi(validatedDoc: OpenApiObject): OpenApiObject {
  // Implement additional processing logic here
  // Example: reference resolution, additional validation, etc.

  return validatedDoc;
}

/**
 * Parse and validate an OpenAPI 3.0.0 document (safe version)
 * Returns a result object instead of throwing errors
 *
 * @param document OpenAPI document
 * @returns Validation result and validated document (on success)
 */
export function safeParseOpenApi(document: unknown): {
  success: boolean;
  data?: OpenApiObject;
  error?: any;
} {
  try {
    // Validate using Zod schema
    const result = OpenApiObjectSchema.safeParse(document);

    if (result.success) {
      return {
        success: true,
        data: processOpenApi(result.data),
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
