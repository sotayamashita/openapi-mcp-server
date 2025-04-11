import { OpenAPIClientAxios } from "openapi-client-axios";
import type { OpenAPIV3_1 } from "openapi-types";
import type { ServerConfig } from "../config";

/**
 * Creates an OpenAPI client
 * Always uses the BASE_URL specified in environment variables and ignores the servers information in the OpenAPI spec
 *
 * @param schema Validated OpenAPI schema
 * @param config Server configuration (baseUrl and headers)
 * @returns Initialized OpenAPI client
 */
export async function createOpenApiClient(
  schema: OpenAPIV3_1.Document,
  config: ServerConfig,
) {
  // Ignore OpenAPI spec servers information and always use environment variable BASE_URL
  const apiClient = new OpenAPIClientAxios({
    definition: schema,
    axiosConfigDefaults: {
      baseURL: config.baseUrl,
      headers: config.headers,
    },
  });

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
 *
 * @param schema OpenAPI schema
 * @returns List of operation IDs
 */
export function extractOperationIds(schema: OpenAPIV3_1.Document): string[] {
  const operationIds: string[] = [];

  if (!schema.paths) {
    return operationIds;
  }

  for (const [path, pathItem] of Object.entries(schema.paths)) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (
        typeof operation === "object" &&
        operation !== null &&
        "operationId" in operation &&
        operation.operationId
      ) {
        operationIds.push(operation.operationId);
      }
    }
  }

  return operationIds;
}
