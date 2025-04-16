import { z, type ZodTypeAny, type ZodRawShape } from "zod";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
// Assuming this converter function exists and handles OpenAPI 3.1 Schema Objects
import { convertOpenAPISchemaToZod } from "./converters/schemaConverter";

// Set of headers to exclude (case-insensitive)
const EXCLUDED_HEADERS = new Set([
  "authorization",
  "content-type",
  "accept",
  // Add other headers inappropriate for LLM generation if needed
]);

/**
 * Generates a structured input schema (Zod object shape) for an MCP Tool
 * based on an OpenAPI 3.1 Operation Object.
 *
 * Parameters are grouped by their location (`pathParameters`, `queryParameters`, `headerParameters`),
 * and the request body is included under the `requestBody` key.
 * Assumes the OperationObject and its components have been fully dereferenced.
 *
 * @param {OpenAPIV3_1.OperationObject} operation - The dereferenced OpenAPI 3.1 Operation Object.
 * @returns {ZodRawShape} A Zod object shape (`Record<string, ZodTypeAny>`) suitable for `z.object()`.
 */
export function createInputSchemaFromOperation(
  operation: OpenAPIV3_1.OperationObject,
): ZodRawShape {
  const pathSchemaMap: ZodRawShape = {};
  const querySchemaMap: ZodRawShape = {};
  const headerSchemaMap: ZodRawShape = {};
  const requiredQuery: string[] = [];
  const requiredHeader: string[] = [];

  // 1. Process Parameters (path, query, header)
  if (operation.parameters) {
    operation.parameters.forEach((param) => {
      // Ensure parameter is a ParameterObject (already dereferenced)
      if (!param || typeof param !== "object" || !("in" in param)) {
        // Skip if it's somehow a ReferenceObject or invalid
        console.error("Skipping unexpected or unresolved parameter:", param);
        return;
      }

      const paramObj = param as OpenAPIV3_1.ParameterObject;
      const paramName = paramObj.name;
      if (!paramName) {
        console.error("Skipping parameter due to missing name:", param);
        return;
      }

      // Check if the parameter is defined using 'schema'
      // NOTE: Currently ignoring parameters defined using 'content'. Handling these
      // would require choosing a media type and extracting the schema from there.
      if (
        !paramObj.schema ||
        typeof paramObj.schema !== "object" ||
        Array.isArray(paramObj.schema)
      ) {
        // Skip if schema is missing, a boolean (true/false schema in 3.1), or not an object
        // If boolean schemas or 'content' based parameters need support, this logic needs expansion.
        console.error(
          `Skipping parameter "${paramName}" due to missing or unsupported schema/content definition.`,
        );
        return;
      }

      // We expect schema to be SchemaObject after dereferencing and type check
      const schemaObj = paramObj.schema as OpenAPIV3_1.SchemaObject;
      let zodSchema: ZodTypeAny;

      try {
        zodSchema = convertOpenAPISchemaToZod(schemaObj);
        if (paramObj.description) {
          zodSchema = zodSchema.describe(paramObj.description);
        }
      } catch (error) {
        console.error(
          `Failed to convert schema for parameter "${paramName}":`,
          error,
        );
        // Fallback to z.any() if conversion fails
        zodSchema = z
          .any()
          .describe(
            paramObj.description ||
              `Parameter ${paramName} (schema conversion failed)`,
          );
      }

      switch (paramObj.in) {
        case "path":
          // Path parameters are always required within the pathParameters object.
          pathSchemaMap[paramName] = zodSchema;
          // Path parameters *must* be required per OpenAPI spec, but we don't track requiredPath
          // because the entire pathParameters object is always required if it exists.
          break;
        case "query":
          // Query parameters are optional unless explicitly required.
          querySchemaMap[paramName] = paramObj.required
            ? zodSchema
            : zodSchema.optional();
          if (paramObj.required) {
            requiredQuery.push(paramName);
          }
          break;
        case "header":
          // Header parameters are optional unless explicitly required.
          // Exclude common/sensitive headers.
          if (!EXCLUDED_HEADERS.has(paramName.toLowerCase())) {
            headerSchemaMap[paramName] = paramObj.required
              ? zodSchema
              : zodSchema.optional();
            if (paramObj.required) {
              requiredHeader.push(paramName);
            }
          }
          break;
        case "cookie":
          // Ignore cookie parameters as per requirement.
          break;
        default:
          console.warn(
            `Unknown parameter location "${paramObj.in}" for parameter "${paramName}". Skipping.`,
          );
          break;
      }
    });
  }

  // 2. Process Request Body
  let requestBodySchema: ZodTypeAny | null = null;
  let isRequestBodyRequired = false;

  if (
    operation.requestBody &&
    typeof operation.requestBody === "object" &&
    "content" in operation.requestBody
  ) {
    const requestBodyObj =
      operation.requestBody as OpenAPIV3_1.RequestBodyObject;
    isRequestBodyRequired = requestBodyObj.required === true;

    // Prefer application/json, fallback to first defined media type
    const mediaTypeKey = "application/json";
    let mediaType = requestBodyObj.content?.[mediaTypeKey];

    if (!mediaType) {
      const firstKey = Object.keys(requestBodyObj.content ?? {})[0];
      if (firstKey) {
        mediaType = requestBodyObj.content?.[firstKey];
        console.warn(
          `Request body media type "${mediaTypeKey}" not found. Falling back to "${firstKey}".`,
        );
      }
    }

    if (
      mediaType &&
      mediaType.schema &&
      typeof mediaType.schema === "object" &&
      !Array.isArray(mediaType.schema)
    ) {
      // We expect schema to be SchemaObject after dereferencing and type check
      const schemaObj = mediaType.schema as OpenAPIV3_1.SchemaObject;
      try {
        requestBodySchema = convertOpenAPISchemaToZod(schemaObj);
        const description =
          requestBodyObj.description ||
          schemaObj.description ||
          "The request body.";
        requestBodySchema = requestBodySchema.describe(description);
      } catch (error) {
        console.error(`Failed to convert request body schema:`, error);
        // Fallback to z.any() if conversion fails
        requestBodySchema = z
          .any()
          .describe(
            requestBodyObj.description ||
              "The request body (schema conversion failed).",
          );
      }
    } else if (mediaType) {
      console.error(
        `Skipping request body: Media type "${mediaTypeKey}" (or fallback) found, but schema is missing, boolean, or not an object.`,
      );
    } else {
      console.error(
        "Skipping request body: No suitable media type found in requestBody.content.",
      );
    }
  } else if (operation.requestBody) {
    console.error(
      "Skipping request body: Invalid or unresolved requestBody object structure.",
    );
  }

  // --- 3. Construct the final ZodRawShape ---
  const finalSchemaShape: ZodRawShape = {};

  if (Object.keys(pathSchemaMap).length > 0) {
    // Path parameters group is always required if path parameters exist.
    finalSchemaShape.pathParameters = z
      .object(pathSchemaMap)
      .describe("Parameters required in the URL path.");
  }

  if (Object.keys(querySchemaMap).length > 0) {
    let queryObj = z
      .object(querySchemaMap)
      .describe("Parameters provided in the query string.");
    // If no query parameters are explicitly required, the whole group is optional.
    finalSchemaShape.queryParameters =
      requiredQuery.length > 0 ? queryObj : queryObj.optional();
  }

  if (Object.keys(headerSchemaMap).length > 0) {
    let headerObj = z
      .object(headerSchemaMap)
      .describe(
        "Allowed parameters provided in the request headers (excluding common auth/content headers).",
      );
    // If no allowed header parameters are explicitly required, the whole group is optional.
    finalSchemaShape.headerParameters =
      requiredHeader.length > 0 ? headerObj : headerObj.optional();
  }

  if (requestBodySchema) {
    // Apply optional modifier based on the requestBody's required field.
    finalSchemaShape.requestBody = isRequestBodyRequired
      ? requestBodySchema
      : requestBodySchema.optional();
    // Description should already be added during conversion.
  }

  return finalSchemaShape;
}
