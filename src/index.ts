import { dereference } from "@scalar/openapi-parser";
import { parseCliArgs } from "./cli/args";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import packageJson from "../package.json";
import { type OpenAPIV3, type OpenAPIV3_1 } from "@scalar/openapi-types";
import { z } from "zod";
import { loadConfig } from "./config";
import { mapMcpArgsToAxiosParams as mapMcpArgsToAxiosParams3_0 } from "./openapi/versions/3.0/argumentMapper";
import { mapMcpArgsToAxiosParams as mapMcpArgsToAxiosParams3_1 } from "./openapi/versions/3.1/argumentMapper";
import { createInputSchemaFromOperation as createInputSchemaFromOperation3_0 } from "./openapi/versions/3.0/createInputSchema";
import { createInputSchemaFromOperation as createInputSchemaFromOperation3_1 } from "./openapi/versions/3.1/createInputSchema";
import OpenAPIClientAxios from "openapi-client-axios";
import { AxiosError, type AxiosResponse } from "axios";
import { getOperationIdsFromPathItem } from "./openapi/common/pathitem";

import {
  getVersion,
  type SupportedOpenApiVersion,
} from "./openapi/versions/getVersion";

async function load(openApiSpecPath: string) {
  if (/^https?:\/\//.test(openApiSpecPath)) {
    const response = await fetch(openApiSpecPath);
    return await response.text();
  }
  const file = Bun.file(openApiSpecPath);
  return await file.text();
}

async function runServer() {
  // CLI module: Parse command line arguments
  const { openApiSpecPath } = parseCliArgs();

  // Load OpenAPI Spec
  const openApiSpecText = await load(openApiSpecPath);

  // Validate OpenAPI Spec
  // It supports 2.0, 3.0.0 and 3.1.0
  const { schema, errors } = await dereference(openApiSpecText);

  // Throw an error if the OpenAPI spec is invalid
  if (errors && errors.length > 0) {
    throw new Error("Invalid OpenAPI spec");
  }

  let openApiVersion: SupportedOpenApiVersion;
  try {
    openApiVersion = getVersion(
      schema as OpenAPIV3.Document | OpenAPIV3_1.Document,
    );
  } catch (error) {
    throw new Error("Invalid OpenAPI spec");
  }

  let openApiDoc: OpenAPIV3.Document | OpenAPIV3_1.Document;
  if (openApiVersion === "3.0") {
    openApiDoc = schema as OpenAPIV3.Document;
  } else if (openApiVersion === "3.1") {
    openApiDoc = schema as OpenAPIV3_1.Document;
  } else {
    throw new Error("Unexpected validated OpenAPI version.");
  }

  // Initialize MCP Server
  const server = new McpServer({
    name: openApiDoc?.info?.title ?? "OpenAPI MCP Server",
    version: openApiDoc?.info?.version ?? packageJson.version,
  });

  // Register Tools
  if (!openApiDoc || !openApiDoc.paths) {
    throw new Error("Invalid or missing paths in OpenAPI spec");
  }

  const config = loadConfig();

  const clientOptions: any = {
    definition: schema,
    axiosConfigDefaults: {
      baseURL: config.baseUrl,
      headers: config.headers,
    },
  };

  const apiClient = new OpenAPIClientAxios(clientOptions);
  const apiClientInstance = await apiClient.init();

  for (const [path, pathItem] of Object.entries(openApiDoc.paths)) {
    if (!pathItem) continue;

    // Extract path-level parameters
    const pathLevelParameters = pathItem.parameters || [];

    // Use getOperationIdsFromPathItem to get all operationIds for valid HTTP methods
    const operationIds = getOperationIdsFromPathItem(pathItem);
    for (const operationId of operationIds) {
      if (!operationId) continue;
      // Find the corresponding operation object
      let operation = null;
      const httpMethods = [
        "get",
        "put",
        "post",
        "delete",
        "options",
        "head",
        "patch",
        "trace",
      ];
      for (const method of httpMethods) {
        if (pathItem[method]?.operationId === operationId) {
          operation = pathItem[method];
          break;
        }
      }
      if (!operation) continue;

      let description;
      if (openApiVersion === "3.0") {
        const op = operation as OpenAPIV3.OperationObject;
        description =
          op.description || op.summary || `API operation for ${operationId}`;
      } else if (openApiVersion === "3.1") {
        const op = operation as OpenAPIV3_1.OperationObject;
        description =
          op.description || op.summary || `API operation for ${operationId}`;
      } else {
        throw new Error("Unexpected validated OpenAPI version.");
      }

      let inputSchema;
      let argMapper;
      if (openApiVersion === "3.0") {
        inputSchema = createInputSchemaFromOperation3_0(
          operation as OpenAPIV3.OperationObject,
          pathLevelParameters as OpenAPIV3.ParameterObject[],
        );
        argMapper = mapMcpArgsToAxiosParams3_0;
      } else if (openApiVersion === "3.1") {
        inputSchema = createInputSchemaFromOperation3_1(
          operation as OpenAPIV3_1.OperationObject,
          pathLevelParameters as OpenAPIV3_1.ParameterObject[],
        );
        argMapper = mapMcpArgsToAxiosParams3_1;
      } else {
        console.error(
          `Skipping operation ${operationId}: Unsupported OpenAPI version for tool generation logic.`,
        );
        continue;
      }

      const inputType = z.object(inputSchema);

      // Register tool to MCP Server
      server.tool(
        operationId,
        description,
        inputSchema,
        async (
          args: z.infer<typeof inputType>,
        ): Promise<{ isError?: boolean; content: any[] }> => {
          try {
            // Map MCP arguments to Axios parameters
            const mappedArgs = argMapper(args);

            // Create final headers
            const finalHeaders = { ...(mappedArgs.config?.headers || {}) };

            // Create call parameters
            const callParameters = mappedArgs.parameters;
            const callData = mappedArgs.data;
            const callConfig = {
              params: mappedArgs.config?.params,
              headers:
                Object.keys(finalHeaders).length > 0 ? finalHeaders : undefined,
            };

            // Call the API
            const response: AxiosResponse = await apiClientInstance[
              operationId
            ](callParameters, callData, callConfig);
            return formatSuccessResponse(response.data);
          } catch (error) {
            return formatFailureResponse(error);
          }
        },
      );
    }
  }

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * Represents the structure of a successful MCP Tool result.
 * Based on McpSchema.CallToolResult but simplified for this context.
 */
interface McpSuccessResult {
  /** The content payload, typically containing the tool's output. */
  content: Array<
    | { type: "text"; text: string }
    | { type: "image"; data: string; mimeType: string }
    | { type: "audio"; data: string; mimeType: string }
    | { type: "resource"; resource: any }
  >; // Use more specific types if needed
  /** Indicates that the tool execution was successful. */
  isError: false;
}

/**
 * Represents the structure of a failed MCP Tool result.
 * Based on McpSchema.CallToolResult but simplified for this context.
 */
interface McpFailureResult {
  /** The content payload, typically containing the error details. */
  content: Array<
    | { type: "text"; text: string }
    | { type: "image"; data: string; mimeType: string }
    | { type: "audio"; data: string; mimeType: string }
    | { type: "resource"; resource: any }
  >; // Use more specific types if needed
  /** Indicates that the tool execution failed. */
  isError: true;
}

/**
 * Formats a successful Axios API response data into the MCP Tool success result format.
 * It processes the `data` property of the Axios response.
 *
 * @param {any} responseData - The data returned by the successful API call (typically `axiosResponse.data`).
 * @returns {McpSuccessResult} An object representing the successful MCP tool result.
 */
function formatSuccessResponse(responseData: any): McpSuccessResult {
  let responseText: string;

  // Handle null or undefined response data
  if (responseData === undefined || responseData === null) {
    responseText = "(No content returned)";
  }
  // Handle string response data
  else if (typeof responseData === "string") {
    responseText = responseData;
  }
  // Handle object or array response data
  else if (typeof responseData === "object") {
    try {
      // Stringify objects/arrays with indentation for readability
      responseText = JSON.stringify(responseData, null, 2);
    } catch (e) {
      // Handle potential circular references or other stringify errors
      console.error("Failed to stringify success response data:", e);
      responseText = "[Could not stringify response object]";
    }
  }
  // Handle other primitive types (number, boolean)
  else {
    responseText = String(responseData);
  }

  // Return the formatted MCP success result
  return {
    content: [
      { type: "text", text: responseText },
      // Note: You could potentially add other content types here
      // based on the response headers or data structure if needed.
    ],
    isError: false,
  };
}

/**
 * Formats an error (potentially an AxiosError) into the MCP Tool failure result format.
 * It extracts relevant information like status code and response data from AxiosErrors.
 *
 * @param {unknown} error - The error object caught during the API call.
 * @returns {McpFailureResult} An object representing the failed MCP tool result.
 */
function formatFailureResponse(error: unknown): McpFailureResult {
  let errorMessage: string;

  // Check if it's an AxiosError to extract more details
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || "N/A"; // Get status code or 'N/A'
    const responseData = error.response?.data;
    let errorDetails: string;

    // Format response data if available
    if (responseData) {
      errorDetails =
        typeof responseData === "object"
          ? JSON.stringify(responseData, null, 2) // Stringify objects/arrays
          : String(responseData); // Convert others to string
    } else {
      // If no response data, use the Axios error message
      errorDetails = error.message;
    }
    errorMessage = `API Error (${statusCode}): ${errorDetails}`;
  }
  // Check if it's a standard Error object
  else if (error instanceof Error) {
    errorMessage = `Error: ${error.message}`;
  }
  // Handle other unknown error types
  else {
    try {
      errorMessage = `Unknown error: ${JSON.stringify(error, null, 2)}`;
    } catch (e) {
      errorMessage = `Unknown error: ${String(error)}`;
    }
  }

  // Return the formatted MCP failure result
  return {
    content: [
      {
        type: "text",
        text: errorMessage,
      },
    ],
    isError: true,
  };
}

runServer().catch((error: any) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
