import { z } from "zod";
import type { OpenAPIV3_1 } from "openapi-types";
import { parseCliArgs } from "./cli/args";
import { loadConfig } from "./config";
import {
  loadOpenApiSpec,
  createOpenApiClient,
  createParameterSchema,
} from "./openapi";
import { McpServer, StdioServerTransport } from "./mcp";

/**
 * Main entry point for MCP server
 * Builds MCP server from OpenAPI spec and exposes it as tools
 */
async function main() {
  try {
    // CLI module: Parse command line arguments
    const { openApiSpecPath } = parseCliArgs();

    // Config module: Load settings from environment variables
    const config = loadConfig();

    // OpenAPI module: Load and validate spec
    const validatedSchema = await loadOpenApiSpec(openApiSpecPath);

    // Initialize MCP server
    const server = new McpServer({
      name: validatedSchema?.info?.title || "oasis",
      version: validatedSchema?.info?.version || "0.0.0",
    });

    // Generate MCP tools from OpenAPI spec
    if (validatedSchema.paths) {
      // Generate OpenAPI client (using BASE_URL and HEADERS from env vars)
      const client = await createOpenApiClient(validatedSchema, config);

      // Register each path and operation as MCP tool
      for (const [path, pathItem] of Object.entries(validatedSchema.paths)) {
        for (const [method, operation] of Object.entries(pathItem || {})) {
          if (
            typeof operation === "object" &&
            operation !== null &&
            "operationId" in operation &&
            operation.operationId
          ) {
            const operationId = operation.operationId;
            const summary = operation.summary || operationId;
            const description = operation.description || summary;

            // Generate Zod schema from OpenAPI parameters
            let paramSchema: Record<string, z.ZodType> = {};
            if (operation.parameters) {
              // Convert parameters to OpenAPIParameter type
              const parameters = operation.parameters
                .filter(
                  (param: any) =>
                    param && typeof param === "object" && "name" in param,
                )
                .map((param: any) => ({
                  name: param.name,
                  description: param.description,
                  in: param.in,
                  required: param.required,
                  schema: param.schema,
                }));

              paramSchema = createParameterSchema(parameters);
            }

            // Register as MCP tool
            server.tool(
              operationId, // Tool name
              description, // Tool description
              paramSchema, // Parameter schema
              async (params) => {
                try {
                  // Get HTTP method and operation info
                  const pathEntry =
                    validatedSchema.paths && validatedSchema.paths[path];
                  const operationEntry =
                    pathEntry &&
                    Object.entries(pathEntry).find(
                      ([_, op]) =>
                        typeof op === "object" &&
                        op !== null &&
                        "operationId" in op &&
                        op.operationId === operationId,
                    );
                  const httpMethod = operationEntry?.[0]?.toUpperCase();
                  const operation = operationEntry?.[1] as any;

                  // Build request URL (using BASE_URL from env vars)
                  let requestUrl = "";

                  // Replace path parameters
                  let pathWithParams = path;
                  if (operation?.parameters) {
                    operation.parameters.forEach((param: any) => {
                      if (param.in === "path" && params[param.name]) {
                        pathWithParams = pathWithParams.replace(
                          `{${param.name}}`,
                          params[param.name],
                        );
                      }
                    });
                  }

                  // Use BASE_URL from environment variables
                  requestUrl = `${config.baseUrl}${pathWithParams}`;

                  // Add query parameters
                  const queryParams: string[] = [];
                  if (operation?.parameters) {
                    operation.parameters.forEach((param: any) => {
                      if (
                        param.in === "query" &&
                        params[param.name] !== undefined
                      ) {
                        queryParams.push(
                          `${param.name}=${encodeURIComponent(params[param.name])}`,
                        );
                      }
                    });
                  }
                  if (queryParams.length > 0) {
                    requestUrl += `?${queryParams.join("&")}`;
                  }

                  // Log tool execution
                  console.error(
                    `Executing ${operationId} with HTTP method: ${
                      httpMethod || "unknown"
                    }`,
                  );
                  console.error(`Request URL: ${requestUrl || "unknown"}`);
                  console.error("Parameters:", params);

                  // Execute API request
                  const response = await (client as any)[operationId](params);

                  // Return response in MCP format
                  return {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify(response.data),
                      },
                    ],
                  };
                } catch (error: any) {
                  // Error handling and logging
                  console.error(`Error executing ${operationId}:`, error);
                  return {
                    content: [
                      {
                        type: "text",
                        text: `Error: ${error.message}`,
                      },
                    ],
                    isError: true,
                  };
                }
              },
            );
          }
        }
      }
    }

    // Connect using stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server connected and ready");
  } catch (error: any) {
    // Handle fatal errors
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run application
main();
