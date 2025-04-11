import type { ServerConfig } from "../config";
import type { Operation, ToolResponse } from "../types";
import { AxiosError } from "axios";

/**
 * Request processing for tool execution
 *
 * @param client OpenAPI client
 * @param operationId Operation ID to execute
 * @param params Request parameters
 * @param operation Operation details
 * @param config Server configuration
 * @returns Tool execution result
 */
export async function executeApiRequest(
  client: any,
  operationId: string,
  params: Record<string, any>,
  operation: Operation,
  config: ServerConfig,
): Promise<ToolResponse> {
  try {
    // Parameter preprocessing
    const processedParams = preprocessParameters(params, operation);

    // Execute API request
    const response = await client[operationId](processedParams);

    // Format response data
    return formatSuccessResponse(response.data);
  } catch (error: unknown) {
    // Error handling
    return formatErrorResponse(error, operationId);
  }
}

/**
 * Build request URL
 * Uses BASE_URL from environment variables instead of OpenAPI spec servers info
 *
 * @param path API path
 * @param params Parameters
 * @param operation Operation details
 * @param config Server configuration
 * @returns Constructed request URL
 */
export function buildRequestUrl(
  path: string,
  params: Record<string, any>,
  operation: Operation,
  config: ServerConfig,
): string {
  // Path parameter replacement
  let pathWithParams = path;
  const pathParams =
    operation.parameters?.filter((param) => param.in === "path") || [];

  for (const param of pathParams) {
    if (param.name && params[param.name] !== undefined) {
      pathWithParams = pathWithParams.replace(
        `{${param.name}}`,
        encodeURIComponent(String(params[param.name])),
      );
    }
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  const queryParamsList =
    operation.parameters?.filter((param) => param.in === "query") || [];

  for (const param of queryParamsList) {
    if (param.name && params[param.name] !== undefined) {
      // Special handling for array parameters
      if (Array.isArray(params[param.name])) {
        for (const value of params[param.name]) {
          queryParams.append(param.name, String(value));
        }
      } else {
        queryParams.append(param.name, String(params[param.name]));
      }
    }
  }

  const queryString = queryParams.toString();

  // Use BASE_URL from environment variables (ignoring OpenAPI spec servers info)
  return `${config.baseUrl}${pathWithParams}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Parameter preprocessing
 * Process parameters according to OpenAPI specification
 *
 * @param params Original parameters
 * @param operation Operation details
 * @returns Processed parameters
 */
function preprocessParameters(
  params: Record<string, any>,
  operation: Operation,
): Record<string, any> {
  const processedParams = { ...params };

  // Special handling for file type parameters
  if (operation.parameters) {
    for (const param of operation.parameters) {
      if (
        param.name &&
        param.schema?.type === "string" &&
        param.schema?.format === "binary" &&
        processedParams[param.name]
      ) {
        // Binary data processing (implement as needed)
        // Example: FormData construction for file uploads
      }
    }
  }

  return processedParams;
}

/**
 * Format success response
 *
 * @param data Response data
 * @returns Formatted tool response
 */
function formatSuccessResponse(data: any): ToolResponse {
  // Apply appropriate formatting based on data type
  if (typeof data === "object" && data !== null) {
    // JSON object
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } else if (typeof data === "string") {
    // Text data
    return {
      content: [
        {
          type: "text",
          text: data,
        },
      ],
    };
  } else {
    // Other data types
    return {
      content: [
        {
          type: "text",
          text: String(data),
        },
      ],
    };
  }
}

/**
 * Format error response
 *
 * @param error Error object
 * @param operationId Operation ID where error occurred
 * @returns Formatted error response
 */
function formatErrorResponse(
  error: unknown,
  operationId: string,
): ToolResponse {
  // Axios-specific error handling
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    return {
      content: [
        {
          type: "text",
          text: `API Error (${statusCode}): ${
            typeof responseData === "object"
              ? JSON.stringify(responseData, null, 2)
              : responseData || error.message
          }`,
        },
      ],
      isError: true,
    };
  }

  // General error handling
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Error executing ${operationId}:`, error);

  return {
    content: [
      {
        type: "text",
        text: `Error: ${message}`,
      },
    ],
    isError: true,
  };
}
