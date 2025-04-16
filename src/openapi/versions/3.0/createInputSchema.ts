import { z, type ZodTypeAny } from "zod";
import type { OpenAPIV3 } from "@scalar/openapi-types";
import type { ZodSchemaMap } from "./types";
import { convertRequestBodyToZod } from "./converters/requestBodyConverter";
import { convertOpenAPISchemaToZod } from "./converters/schemaConverter";

// List of excluded header names (lowercase)
const EXCLUDED_HEADERS = new Set([
  "authorization",
  "content-type",
  "accept",
  // Add other excluded headers as needed
]);

/**
 * Generate a structured inputSchema (ZodRawShape) from OpenAPI 3.0 OperationObject,
 * separating parameters by their 'in' location (path, query, header) and requestBody.
 *
 * @param operation OpenAPI OperationObject
 * @param pathLevelParameters Path-level parameters (from PathItemObject), default: []
 * @returns Map representing the Zod object shape for the tool's inputSchema.
 */
export function createInputSchemaFromOperation(
  operation: OpenAPIV3.OperationObject,
  pathLevelParameters: OpenAPIV3.ParameterObject[] = [],
): Record<string, ZodTypeAny> {
  const pathSchemaMap: ZodSchemaMap = {};
  const querySchemaMap: ZodSchemaMap = {};
  const headerSchemaMap: ZodSchemaMap = {};
  const requiredPath: string[] = [];
  const requiredQuery: string[] = [];
  const requiredHeader: string[] = [];

  // Merge path-level and operation-level parameters (operation.parameters takes precedence)
  const mergedParameters: OpenAPIV3.ParameterObject[] = [
    ...pathLevelParameters,
    ...((operation.parameters as OpenAPIV3.ParameterObject[] | undefined) ??
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
    if (!param || typeof param !== "object") return;
    if (!("in" in param)) return;
    const paramObj = param as OpenAPIV3.ParameterObject;
    if (!paramObj.name || !paramObj.schema) return;
    const paramName = paramObj.name;
    if (!paramObj.schema || !("type" in paramObj.schema)) return;
    const schemaObj = paramObj.schema as OpenAPIV3.SchemaObject;
    const zodSchema = convertOpenAPISchemaToZod(schemaObj);
    switch (paramObj.in) {
      case "path":
        pathSchemaMap[paramName] = zodSchema;
        requiredPath.push(paramName);
        break;
      case "query":
        querySchemaMap[paramName] = paramObj.required
          ? zodSchema
          : zodSchema.optional();
        if (paramObj.required) {
          requiredQuery.push(paramName);
        }
        break;
      case "header":
        if (!EXCLUDED_HEADERS.has(paramName.toLowerCase())) {
          headerSchemaMap[paramName] = paramObj.required
            ? zodSchema
            : zodSchema.optional();
          if (paramObj.required) {
            requiredHeader.push(paramName);
          }
        }
        break;
      // 'cookie' parameters are ignored for now
    }
  });

  // Process request body
  const bodySchema = convertRequestBodyToZod(operation.requestBody);
  const isRequestBodyRequired =
    operation.requestBody && "required" in operation.requestBody
      ? (operation.requestBody as OpenAPIV3.RequestBodyObject).required === true
      : false;

  // --- Construct the final ZodRawShape ---
  const finalSchemaShape: Record<string, ZodTypeAny> = {};

  if (Object.keys(pathSchemaMap).length > 0) {
    finalSchemaShape.pathParameters = z
      .object(pathSchemaMap)
      .describe("Parameters required in the URL path.");
  }

  if (Object.keys(querySchemaMap).length > 0) {
    let queryObj = z
      .object(querySchemaMap)
      .describe("Parameters provided in the query string.");
    finalSchemaShape.queryParameters =
      requiredQuery.length > 0 ? queryObj : queryObj.optional();
  }

  if (Object.keys(headerSchemaMap).length > 0) {
    let headerObj = z
      .object(headerSchemaMap)
      .describe("Parameters provided in the request headers.");
    finalSchemaShape.headerParameters =
      requiredHeader.length > 0 ? headerObj : headerObj.optional();
  }

  if (bodySchema) {
    const describedBodySchema = bodySchema.describe(
      (operation.requestBody &&
        "description" in operation.requestBody &&
        operation.requestBody.description) ||
        "The request body.",
    );
    finalSchemaShape.requestBody = isRequestBodyRequired
      ? describedBodySchema
      : describedBodySchema.optional();
  }

  return finalSchemaShape;
}
