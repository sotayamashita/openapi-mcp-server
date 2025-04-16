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
 * @param {OpenAPIV3_1.ParameterObject[]} pathLevelParameters - Path-level parameters (from PathItemObject), default: []
 * @returns {ZodRawShape} A Zod object shape (`Record<string, ZodTypeAny>`) suitable for `z.object()`.
 */
export function createInputSchemaFromOperation(
  operation: OpenAPIV3_1.OperationObject,
  pathLevelParameters: OpenAPIV3_1.ParameterObject[] = [],
): ZodRawShape {
  const pathSchemaMap: ZodRawShape = {};
  const querySchemaMap: ZodRawShape = {};
  const headerSchemaMap: ZodRawShape = {};
  const requiredQuery: string[] = [];
  const requiredHeader: string[] = [];

  // Merge path-level and operation-level parameters (operation.parameters takes precedence)
  const mergedParameters: OpenAPIV3_1.ParameterObject[] = [
    ...pathLevelParameters,
    ...((operation.parameters as OpenAPIV3_1.ParameterObject[] | undefined) ??
      []),
  ];
  const seen = new Set<string>();
  // Remove duplicates by name+in (operation.parameters has priority)
  const dedupedParameters = mergedParameters
    .reverse()
    .filter((param) => {
      if (
        !param ||
        typeof param !== "object" ||
        !("name" in param) ||
        !("in" in param)
      )
        return false;
      const key = `${param.in}:${param.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .reverse();

  // Process parameters (path, query, header)
  dedupedParameters.forEach((param) => {
    if (!param || typeof param !== "object" || !("in" in param)) return;
    const paramObj = param as OpenAPIV3_1.ParameterObject;
    if (!paramObj.name || !paramObj.schema) return;
    const paramName = paramObj.name;
    if (
      !paramObj.schema ||
      typeof paramObj.schema !== "object" ||
      Array.isArray(paramObj.schema)
    )
      return;
    const schemaObj = paramObj.schema as OpenAPIV3_1.SchemaObject;
    let zodSchema: ZodTypeAny;
    try {
      zodSchema = convertOpenAPISchemaToZod(schemaObj);
      if (paramObj.description) {
        zodSchema = zodSchema.describe(paramObj.description);
      }
    } catch (error) {
      zodSchema = z
        .any()
        .describe(
          paramObj.description ||
            `Parameter ${paramName} (schema conversion failed)`,
        );
    }
    switch (paramObj.in) {
      case "path":
        pathSchemaMap[paramName] = zodSchema;
        break;
      case "query":
        querySchemaMap[paramName] = paramObj.required
          ? zodSchema
          : zodSchema.optional();
        if (paramObj.required) requiredQuery.push(paramName);
        break;
      case "header":
        if (!EXCLUDED_HEADERS.has(paramName.toLowerCase())) {
          headerSchemaMap[paramName] = paramObj.required
            ? zodSchema
            : zodSchema.optional();
          if (paramObj.required) requiredHeader.push(paramName);
        }
        break;
      // 'cookie' parameters are ignored for now
    }
  });

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
