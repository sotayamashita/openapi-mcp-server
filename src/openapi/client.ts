import { OpenAPIClientAxios } from "openapi-client-axios";
import type { OpenAPI } from "openapi-types";
import type { ServerConfig } from "../config";
import { detectOpenApiVersion } from "./schema";

/**
 * Creates an OpenAPI client
 * Always uses the BASE_URL specified in environment variables and ignores the servers information in the OpenAPI spec
 * Supports both OpenAPI 3.0.0 and 3.1.0
 *
 * @param schema Validated OpenAPI schema
 * @param config Server configuration (baseUrl and headers)
 * @returns Initialized OpenAPI client
 */
export async function createOpenApiClient(
  schema: OpenAPI.Document,
  config: ServerConfig,
) {
  // Detect schema version
  const version = detectOpenApiVersion(schema);

  // Configure client options
  const clientOptions: any = {
    definition: schema,
    axiosConfigDefaults: {
      baseURL: config.baseUrl,
      headers: config.headers,
    },
  };

  // Ignore OpenAPI spec servers information and always use environment variable BASE_URL
  const apiClient = new OpenAPIClientAxios(clientOptions);

  try {
    // Initialize client
    const client = await apiClient.init();
    return client;
  } catch (error: any) {
    throw new Error(`Failed to initialize OpenAPI client: ${error.message}`);
  }
}

/**
 * Extracts a list of operation IDs from the OpenAPI schema
 * Supports both OpenAPI 3.0.0 and 3.1.0
 *
 * @param schema OpenAPI schema
 * @returns List of operation IDs
 */
export function extractOperationIds(schema: OpenAPI.Document): string[] {
  const operationIds: string[] = [];

  if (!schema.paths) {
    return operationIds;
  }

  // Use common processing regardless of version
  // OpenAPI 3.0.0 and 3.1.0 have basically the same structure for paths and operationId
  for (const [path, pathItem] of Object.entries(schema.paths)) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (
        typeof operation === "object" &&
        operation !== null &&
        "operationId" in operation &&
        operation.operationId
      ) {
        operationIds.push(operation.operationId as string);
      }
    }
  }

  return operationIds;
}
