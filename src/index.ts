import { parseCliArgs } from "./cli/args";
import { loadConfig } from "./config";
import { loadOpenApiSpec, createOpenApiClient } from "./openapi";
import { McpServer, StdioServerTransport } from "./mcp";
import { buildToolsFromOpenApi } from "./tools";

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

    // Generate OpenAPI client (using BASE_URL and HEADERS from env vars)
    const client = await createOpenApiClient(validatedSchema, config);

    // Generate and register MCP tools from OpenAPI schema
    await buildToolsFromOpenApi(server, validatedSchema, client, config);

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
