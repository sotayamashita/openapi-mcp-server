import { describe, it, expect, mock, spyOn } from "bun:test";
import { buildToolsFromOpenApi } from "../../src/tools/builder";
import { McpServer } from "../../src/mcp/server";
import type { OpenAPI } from "openapi-types";
import type { ServerConfig } from "../../src/config";

// Mock implementation of McpServer
const createMockServer = () => {
  const tools = new Map<string, any>();

  const server = {
    tool: mock(
      (name: string, description: string, paramSchema: any, executor: any) => {
        tools.set(name, {
          name,
          description,
          paramSchema,
          executor,
        });
        return server;
      },
    ),
    getTools: () => tools,
  };

  return server as unknown as McpServer & { getTools: () => Map<string, any> };
};

// Mock OpenAPI client for testing
const createMockClient = () => {
  return {
    getUsers: async () => ({
      data: [{ id: "1", name: "Test User" }],
    }),
    createUser: async () => ({
      data: { id: "2", name: "New User" },
    }),
    getUserById: async () => ({
      data: { id: "1", name: "Test User" },
    }),
  };
};

// Test OpenAPI schema
const createTestSchema = (): OpenAPI.Document => {
  return {
    openapi: "3.1.0",
    info: {
      title: "Test API",
      version: "1.0.0",
    },
    paths: {
      "/users": {
        get: {
          operationId: "getUsers",
          summary: "Get users",
          description: "Get a list of users",
          parameters: [
            {
              name: "limit",
              in: "query",
              description: "Maximum number of users to return",
              required: false,
              schema: {
                type: "integer",
              },
            },
          ],
          responses: {},
        },
        post: {
          operationId: "createUser",
          summary: "Create user",
          responses: {},
        },
      },
      "/users/{id}": {
        get: {
          operationId: "getUserById",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {},
        },
      },
    },
  };
};

// Test configuration
const testConfig: ServerConfig = {
  baseUrl: "https://test-api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
};

describe("Tools Builder Module", () => {
  it("should build tools from OpenAPI schema", async () => {
    // Mock console output
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(
      () => {},
    );
    const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    const server = createMockServer();
    const client = createMockClient();
    const schema = createTestSchema();

    const count = await buildToolsFromOpenApi(
      server,
      schema,
      client,
      testConfig,
    );

    // Verify correct number of tools registered
    expect(count).toBe(3);
    expect(server.getTools().size).toBe(3);

    // Verify specific tools are registered
    expect(server.getTools().has("getUsers")).toBe(true);
    expect(server.getTools().has("createUser")).toBe(true);
    expect(server.getTools().has("getUserById")).toBe(true);

    // Verify tool description and parameters
    const getUsersTool = server.getTools().get("getUsers");
    expect(getUsersTool.description).toBe("Get a list of users");
    expect(Object.keys(getUsersTool.paramSchema)).toContain("limit");

    // Reset spies
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("should handle empty operationIds", async () => {
    // Customize schema paths
    const schema = createTestSchema();
    schema.paths = {};

    const server = createMockServer();
    const client = createMockClient();

    // Mock console output
    const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    const count = await buildToolsFromOpenApi(
      server,
      schema,
      client,
      testConfig,
    );

    // Verify no tools are registered
    expect(count).toBe(0);
    expect(server.getTools().size).toBe(0);

    // Verify warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No operation IDs found in the OpenAPI schema",
    );

    consoleWarnSpy.mockRestore();
  });

  it("should handle errors during tool building", async () => {
    const server = createMockServer();
    const client = createMockClient();

    // Set schema to null to trigger error
    const schema = null as unknown as OpenAPI.Document;

    await expect(
      buildToolsFromOpenApi(server, schema, client, testConfig),
    ).rejects.toThrow(/Failed to build tools from OpenAPI schema/);
  });
});
