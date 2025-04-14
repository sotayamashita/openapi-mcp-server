import { z } from "zod";
import { validate, type ErrorObject } from "@scalar/openapi-parser";

/**
 * Detects the OpenAPI version
 * @param schema OpenAPI schema
 * @returns OpenAPI version (3.0.0 or 3.1.0)
 */
export function detectOpenApiVersion(schema: any): string {
  // Swagger 2.0 is openapi: 2.0 format
  if (
    schema.swagger &&
    typeof schema.swagger === "string" &&
    schema.swagger.startsWith("2.0")
  ) {
    return "2.0.0";
  }

  // OpenAPI 3.0.0 is openapi: 3.0.x format
  if (
    schema.openapi &&
    typeof schema.openapi === "string" &&
    schema.openapi.startsWith("3.0")
  ) {
    return "3.0.0";
  }

  // OpenAPI 3.1.0 is openapi: 3.1.x format
  if (
    schema.openapi &&
    typeof schema.openapi === "string" &&
    schema.openapi.startsWith("3.1")
  ) {
    return "3.1.0";
  }

  // Default to 3.1.0
  return "3.1.0";
}

/**
 * Interface for creating Zod schema from OpenAPI parameters
 */
export interface OpenApiParameter {
  name: string;
  description?: string;
  in?: string;
  required?: boolean;
  schema?: {
    type?: string;
    format?: string;
  };
}

/**
 * Generates Zod schema from OpenAPI parameters array
 * @param parameters Array of OpenAPI parameters
 * @returns Map of parameter names to Zod schemas
 */
export function createParameterSchema(
  parameters: OpenApiParameter[] | undefined,
): Record<string, z.ZodType> {
  const paramSchema: Record<string, z.ZodType> = {};

  if (!parameters) {
    return paramSchema;
  }

  for (const param of parameters) {
    if (!param.name) {
      continue;
    }

    // Parameter description (if any)
    const description = param.description || "";

    // Create basic schema based on parameter type
    let schema: z.ZodType;

    if (param.schema?.type === "integer" || param.schema?.type === "number") {
      schema = z.number().describe(description);
    } else if (param.schema?.type === "boolean") {
      schema = z.boolean().describe(description);
    } else if (param.schema?.type === "array") {
      // Simplified: array elements can be any type
      schema = z.array(z.any()).describe(description);
    } else if (param.schema?.type === "object") {
      // Simplified: object can have any keys and values
      schema = z.record(z.string(), z.any()).describe(description);
    } else {
      // Default to string type
      schema = z.string().describe(description);
    }

    // Handle required parameters
    if (!param.required) {
      schema = schema.optional();
    }

    paramSchema[param.name] = schema;
  }

  return paramSchema;
}

/**
 * Generates operation ID from path and HTTP method
 * Example: GET /users/{id} → getUsersById
 *
 * @param path API path
 * @param method HTTP method
 * @returns Generated operation ID
 */
export function generateOperationId(path: string, method: string): string {
  // Convert method to lowercase
  const normalizedMethod = method.toLowerCase();

  // Generate path part for ID
  let pathPart = path
    // Remove leading slash
    .replace(/^\//, "")
    // Process path parameters: {id} → ById
    .replace(
      /\{([^}]+)\}/g,
      (_, param) => `By${param.charAt(0).toUpperCase() + param.slice(1)}`,
    )
    // Replace hyphens with camelCase
    .replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
    // Replace underscores with camelCase
    .replace(/_(\w)/g, (_, letter) => letter.toUpperCase());

  // Split by slash and convert to camelCase
  pathPart = pathPart
    .split("/")
    .map((part, index) => {
      if (index === 0) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");

  // Combine with method (getUsers, postUsers, etc.)
  return `${normalizedMethod}${pathPart.charAt(0).toUpperCase() + pathPart.slice(1)}`;
}

/**
 * Validates operation ID uniqueness
 * Generates operationId from path and method if it doesn't exist
 *
 * @param schema OpenAPI schema
 * @returns Array of error messages and map of alternative IDs
 */
export function validateOperationIds(schema: any): {
  errors: string[];
  alternativeIds: Record<string, string>;
} {
  const errors: string[] = [];
  const operationIds = new Set<string>();
  const alternativeIds: Record<string, string> = {};

  if (schema.paths) {
    for (const [path, pathItem] of Object.entries<any>(schema.paths)) {
      for (const [method, operation] of Object.entries<any>(pathItem || {})) {
        if (
          typeof operation === "object" &&
          operation !== null &&
          !["$ref", "summary", "description", "servers", "parameters"].includes(
            method,
          )
        ) {
          // If operationId exists
          if (operation.operationId) {
            if (operationIds.has(operation.operationId)) {
              errors.push(`Duplicate operationId: ${operation.operationId}`);
            } else {
              operationIds.add(operation.operationId);
            }
          }
          // Generate operationId if it doesn't exist
          else {
            const generatedId = generateOperationId(path, method);
            let uniqueId = generatedId;

            // Add number suffix if generated ID conflicts with existing ones
            let counter = 1;
            while (operationIds.has(uniqueId)) {
              uniqueId = `${generatedId}_${counter}`;
              counter++;
            }

            // Record generated ID
            alternativeIds[`${method.toUpperCase()} ${path}`] = uniqueId;
            operationIds.add(uniqueId);
          }
        }
      }
    }
  }

  return { errors, alternativeIds };
}

/**
 * Validates OpenAPI schema
 * Uses @scalar/openapi-parser's validate function
 * Validates schema based on version
 *
 * @param schema OpenAPI schema to validate
 * @returns Validation result (including error information if any) and alternative operation IDs
 */
export async function validateSchema(schema: any): Promise<{
  valid: boolean;
  errors: (string | ErrorObject)[];
  alternativeIds: Record<string, string>;
}> {
  try {
    // Detect schema version
    const version = detectOpenApiVersion(schema);

    // Validate schema using @scalar/openapi-parser
    // Note: This library supports both 3.1.0 and 3.0.0
    const result = await validate(schema);

    // Additional validation for operation ID uniqueness
    const { errors: idErrors, alternativeIds } = validateOperationIds(schema);

    // Additional version-specific validation can be implemented here
    const versionSpecificErrors: string[] = [];

    return {
      valid:
        result.valid &&
        idErrors.length === 0 &&
        versionSpecificErrors.length === 0,
      errors: [...(result.errors || []), ...idErrors, ...versionSpecificErrors],
      alternativeIds,
    };
  } catch (error: any) {
    return {
      valid: false,
      errors: [error.message],
      alternativeIds: {},
    };
  }
}
