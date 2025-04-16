import { z, type ZodTypeAny } from "zod";
import type { OpenAPIV3 } from "@scalar/openapi-types";
import type { ZodSchemaMap } from "./types";
import { convertRequestBodyToZod } from "./converters/requestBodyConverter";
import { convertOpenAPISchemaToZod } from "./converters/schemaConverter";

// 除外するヘッダー名のリスト (小文字)
const EXCLUDED_HEADERS = new Set([
  "authorization",
  "content-type",
  "accept",
  // 必要に応じて他の除外ヘッダーを追加
]);

/**
 * Generate a structured inputSchema (ZodRawShape) from OpenAPI 3.0 OperationObject,
 * separating parameters by their 'in' location (path, query, header) and requestBody.
 *
 * @param operation OpenAPI OperationObject
 * @returns Map representing the Zod object shape for the tool's inputSchema.
 */
export function createInputSchemaFromOperation(
  operation: OpenAPIV3.OperationObject,
): Record<string, ZodTypeAny> {
  const pathSchemaMap: ZodSchemaMap = {};
  const querySchemaMap: ZodSchemaMap = {};
  const headerSchemaMap: ZodSchemaMap = {};
  const requiredPath: string[] = [];
  const requiredQuery: string[] = [];
  const requiredHeader: string[] = [];

  // Process parameters (path, query, header)
  if (operation.parameters) {
    operation.parameters.forEach((param) => {
      // Skip ReferenceObjects for now
      // because it expect the param will be resolved beforehand
      // by dereference of '@scalar/openapi-parser'
      if (!param || typeof param !== "object") return;

      // Type assertion after check
      if (!("in" in param)) return;
      const paramObj = param as OpenAPIV3.ParameterObject;

      if (!paramObj.name || !paramObj.schema) return; // Skip params without name or schema

      const paramName = paramObj.name;
      // Ensure schema is SchemaObject
      if (!paramObj.schema || !("type" in paramObj.schema)) return;
      const schemaObj = paramObj.schema as OpenAPIV3.SchemaObject;

      const zodSchema = convertOpenAPISchemaToZod(schemaObj);

      switch (paramObj.in) {
        case "path":
          // Path parameters are always required
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
          // Exclude common/sensitive headers
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
  }

  // Process request body
  const bodySchema = convertRequestBodyToZod(operation.requestBody);
  const isRequestBodyRequired =
    operation.requestBody && "required" in operation.requestBody
      ? (operation.requestBody as OpenAPIV3.RequestBodyObject).required === true
      : false;

  // --- Construct the final ZodRawShape ---
  const finalSchemaShape: Record<string, ZodTypeAny> = {};

  if (Object.keys(pathSchemaMap).length > 0) {
    // Path parameters are structurally always required if they exist
    finalSchemaShape.pathParameters = z
      .object(pathSchemaMap)
      .describe("Parameters required in the URL path.");
  }

  if (Object.keys(querySchemaMap).length > 0) {
    let queryObj = z
      .object(querySchemaMap)
      .describe("Parameters provided in the query string.");
    // If no query parameters are explicitly required, the whole group is optional
    finalSchemaShape.queryParameters =
      requiredQuery.length > 0 ? queryObj : queryObj.optional();
  }

  if (Object.keys(headerSchemaMap).length > 0) {
    let headerObj = z
      .object(headerSchemaMap)
      .describe("Parameters provided in the request headers.");
    // If no header parameters are explicitly required, the whole group is optional
    finalSchemaShape.headerParameters =
      requiredHeader.length > 0 ? headerObj : headerObj.optional();
  }

  if (bodySchema) {
    // Add describe if not already added by converter
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
