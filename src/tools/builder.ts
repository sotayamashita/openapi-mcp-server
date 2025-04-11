import { z } from "zod";
import type { OpenAPIV3_1 } from "openapi-types";
import { McpServer } from "../mcp/server";
import type { ServerConfig } from "../config";
import type { Operation } from "../types";
import { extractOperationIds } from "../openapi/client";
import { executeApiRequest } from "./executor";

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
  schema: OpenAPIV3_1.Document,
  client: any,
  config: ServerConfig,
): Promise<number> {
  try {
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
      const operation = findOperationById(schema, operationId);

      if (!operation) {
        console.warn(`Operation details not found for ID: ${operationId}`);
        continue;
      }

      // Build parameter schema
      const paramSchema = buildParameterSchema(operation);

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
 * @returns Operation details or undefined
 */
function findOperationById(
  schema: OpenAPIV3_1.Document,
  operationId: string,
): Operation | undefined {
  if (!schema.paths) {
    return undefined;
  }

  for (const [path, pathItem] of Object.entries(schema.paths)) {
    if (!pathItem) continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (
        operation &&
        typeof operation === "object" &&
        "operationId" in operation &&
        operation.operationId === operationId
      ) {
        // Add path and method information
        return {
          ...(operation as Operation),
          path,
          method,
        };
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
 * @returns Zod schema object
 */
function buildParameterSchema(operation: Operation): Record<string, z.ZodType> {
  const paramSchema: Record<string, z.ZodType> = {};

  if (!operation.parameters || !Array.isArray(operation.parameters)) {
    return paramSchema;
  }

  for (const param of operation.parameters) {
    if (!param.name) {
      continue;
    }

    // Build schema based on parameter type
    let zodType: z.ZodType;

    if (param.schema?.type === "string") {
      zodType = z.string();
    } else if (
      param.schema?.type === "number" ||
      param.schema?.type === "integer"
    ) {
      zodType = z.number();
    } else if (param.schema?.type === "boolean") {
      zodType = z.boolean();
    } else if (param.schema?.type === "array") {
      // Consider element type for array types
      if (param.schema.items?.type === "string") {
        zodType = z.array(z.string());
      } else if (
        param.schema.items?.type === "number" ||
        param.schema.items?.type === "integer"
      ) {
        zodType = z.array(z.number());
      } else if (param.schema.items?.type === "boolean") {
        zodType = z.array(z.boolean());
      } else {
        zodType = z.array(z.any());
      }
    } else if (param.schema?.type === "object") {
      zodType = z.record(z.any());
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

  // Handle request body (simple implementation)
  if (operation.requestBody) {
    const requestBody = operation.requestBody as any;
    if (requestBody.content?.["application/json"]?.schema) {
      paramSchema["body"] = z.record(z.any()).optional();
    }
  }

  return paramSchema;
}
