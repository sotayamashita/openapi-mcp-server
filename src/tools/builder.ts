import { z } from "zod";
import type { OpenAPI, OpenAPIV3_1 } from "openapi-types";
import { McpServer } from "../mcp/server";
import type { ServerConfig } from "../config";
import type { Operation, Parameter } from "../types";
import { extractOperationIds } from "../openapi/client";
import { executeApiRequest } from "./executor";
import { detectOpenApiVersion } from "../openapi/schema";

/**
 * Generates and registers MCP tools from OpenAPI schema
 *
 * @param server MCP server instance
 * @param schema Validated OpenAPI schema
 * @param client Initialized OpenAPI client
 * @param config Server configuration
 * @returns Number of registered tools
 */
export async function buildToolsFromOpenApi(
  server: McpServer,
  schema: OpenAPI.Document,
  client: any,
  config: ServerConfig,
): Promise<number> {
  try {
    // Detect OpenAPI version
    const apiVersion = detectOpenApiVersion(schema);

    // Extract all operation IDs from OpenAPI schema
    const operationIds = extractOperationIds(schema);

    if (operationIds.length === 0) {
      console.warn("No operation IDs found in the OpenAPI schema");
      return 0;
    }

    // Register each operation as an MCP tool
    let registeredTools = 0;

    for (const operationId of operationIds) {
      // Get operation details
      const operation = findOperationById(schema, operationId, apiVersion);

      if (!operation) {
        console.warn(`Operation details not found for ID: ${operationId}`);
        continue;
      }

      // Build parameter schema
      const paramSchema = buildParameterSchema(operation, apiVersion);

      // Generate tool description
      const description =
        operation.description ||
        operation.summary ||
        `API operation: ${operationId}`;

      // Register tool
      server.tool(
        operationId,
        description,
        paramSchema,
        async (params: Record<string, any>) => {
          return executeApiRequest(
            client,
            operationId,
            params,
            operation,
            config,
          );
        },
      );

      registeredTools++;
    }

    console.error(`Registered ${registeredTools} tools from OpenAPI schema`);
    return registeredTools;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to build tools from OpenAPI schema: ${message}`);
  }
}

/**
 * Find operation details by ID from OpenAPI schema
 *
 * @param schema OpenAPI schema
 * @param operationId Operation ID to search for
 * @param apiVersion OpenAPI version
 * @returns Operation details or undefined
 */
export function findOperationById(
  schema: OpenAPI.Document,
  operationId: string,
  apiVersion: string,
): Operation | undefined {
  if (!schema.paths) {
    return undefined;
  }

  // Search in paths
  for (const [path, pathItem] of Object.entries(schema.paths)) {
    if (!pathItem) continue;

    // Extract path-level parameters
    const rawPathParameters =
      "parameters" in pathItem ? pathItem.parameters || [] : [];
    // Convert to Parameter type
    const pathParameters = rawPathParameters as Parameter[];

    for (const [method, operation] of Object.entries(pathItem)) {
      if (
        operation &&
        typeof operation === "object" &&
        "operationId" in operation &&
        operation.operationId === operationId
      ) {
        // Clone operation object
        const operationWithPath = {
          ...(operation as Operation),
          path,
          method,
        };

        // Merge path parameters with operation parameters if any exist
        if (pathParameters.length > 0) {
          const operationParameters = operationWithPath.parameters || [];
          operationWithPath.parameters = [
            ...pathParameters,
            ...operationParameters,
          ];
        }

        return operationWithPath;
      }
    }
  }

  // Search in webhooks (OpenAPI 3.1.0 feature only)
  if (apiVersion === "3.1.0" && "webhooks" in schema && schema.webhooks) {
    const webhooks = (schema as OpenAPIV3_1.Document).webhooks;
    for (const [webhookKey, pathItem] of Object.entries(webhooks || {})) {
      if (!pathItem) continue;

      // Extract webhook parameters
      const rawWebhookParameters =
        "parameters" in pathItem ? pathItem.parameters || [] : [];
      // Convert to Parameter type
      const webhookParameters = rawWebhookParameters as Parameter[];

      for (const [method, operation] of Object.entries(pathItem)) {
        if (
          operation &&
          typeof operation === "object" &&
          "operationId" in operation &&
          operation.operationId === operationId
        ) {
          // Clone operation object with webhook path
          const operationWithPath = {
            ...(operation as Operation),
            path: `webhook:${webhookKey}`,
            method,
          };

          // Merge webhook parameters with operation parameters if any exist
          if (webhookParameters.length > 0) {
            const operationParameters = operationWithPath.parameters || [];
            operationWithPath.parameters = [
              ...webhookParameters,
              ...operationParameters,
            ];
          }

          return operationWithPath;
        }
      }
    }
  }

  return undefined;
}

/**
 * Build parameter schema
 * Generate Zod schema from OpenAPI parameter definitions
 *
 * @param operation Operation details
 * @param apiVersion OpenAPI version
 * @returns Zod schema object
 */
export function buildParameterSchema(
  operation: Operation,
  apiVersion: string,
): Record<string, z.ZodType> {
  const paramSchema: Record<string, z.ZodType> = {};

  // Parameter processing
  if (operation.parameters && Array.isArray(operation.parameters)) {
    for (const param of operation.parameters) {
      if (!param.name) {
        continue;
      }

      // Build schema based on parameter type
      let zodType: z.ZodType;

      // Case where schema is directly defined (both 3.0 and 3.1)
      if (param.schema) {
        zodType = buildZodTypeFromSchema(param.schema, apiVersion);
      }
      // Media type definition using content (more explicit in 3.1.0)
      else if (apiVersion === "3.1.0" && "content" in param && param.content) {
        // Use schema from first media type
        const mediaTypeValues = Object.values(param.content);
        const firstMediaType =
          mediaTypeValues.length > 0 ? mediaTypeValues[0] : null;

        if (firstMediaType && firstMediaType.schema) {
          zodType = buildZodTypeFromSchema(firstMediaType.schema, apiVersion);
        } else {
          zodType = z.any();
        }
      } else {
        zodType = z.any();
      }

      // For required parameters
      if (param.required) {
        paramSchema[param.name] = zodType;
      } else {
        // For optional parameters
        paramSchema[param.name] = zodType.optional();
      }
    }
  }

  // Handle request body
  if (operation.requestBody) {
    const requestBody = operation.requestBody as any;

    // Try to get content type and schema from requestBody
    if (requestBody.content) {
      // Prioritize JSON content type
      const jsonContent =
        requestBody.content["application/json"] ||
        Object.values(requestBody.content)[0];

      if (jsonContent && jsonContent.schema) {
        paramSchema["body"] = buildZodTypeFromSchema(
          jsonContent.schema,
          apiVersion,
        );
      } else {
        paramSchema["body"] = z.record(z.any());
      }
    } else {
      paramSchema["body"] = z.record(z.any());
    }

    // Make request body optional if not explicitly required
    if (requestBody.required !== true) {
      paramSchema["body"] = paramSchema["body"].optional();
    }
  }

  return paramSchema;
}

/**
 * Build Zod type from OpenAPI schema
 * Supports both OpenAPI 3.0.0 and 3.1.0 schema formats
 *
 * @param schema OpenAPI schema object
 * @param apiVersion OpenAPI version
 * @returns Zod type definition
 */
function buildZodTypeFromSchema(schema: any, apiVersion: string): z.ZodType {
  if (!schema) return z.any();

  if (schema.type === "string") {
    let stringSchema = z.string();

    // Additional constraints like format, pattern
    if (schema.format === "email") stringSchema = z.string().email();
    if (schema.pattern)
      stringSchema = stringSchema.regex(new RegExp(schema.pattern));

    return stringSchema;
  } else if (schema.type === "number" || schema.type === "integer") {
    let numberSchema = z.number();

    // Minimum/maximum value constraints
    if (schema.minimum !== undefined)
      numberSchema = numberSchema.min(schema.minimum);
    if (schema.maximum !== undefined)
      numberSchema = numberSchema.max(schema.maximum);

    return numberSchema;
  } else if (schema.type === "boolean") {
    return z.boolean();
  } else if (schema.type === "array") {
    // 配列要素の型
    if (schema.items) {
      return z.array(buildZodTypeFromSchema(schema.items, apiVersion));
    }
    return z.array(z.any());
  } else if (schema.type === "object") {
    // オブジェクトのプロパティ
    if (schema.properties) {
      const shape: Record<string, z.ZodType> = {};
      const required = schema.required || [];

      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propType = buildZodTypeFromSchema(propSchema, apiVersion);
        shape[propName] = required.includes(propName)
          ? propType
          : propType.optional();
      }

      return z.object(shape);
    }
    return z.record(z.any());
  }

  // default
  return z.any();
}
