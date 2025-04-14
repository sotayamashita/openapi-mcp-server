import { describe, it, expect, mock, spyOn } from "bun:test";
import { buildToolsFromOpenApi } from "../../src/tools/builder";
import {
  buildParameterSchema,
  findOperationById,
} from "../../src/tools/builder";
import { McpServer } from "../../src/mcp/server";
import type { OpenAPI } from "openapi-types";
import type { ServerConfig } from "../../src/config";
import type { Operation } from "../../src/types";
import { detectOpenApiVersion } from "../../src/openapi/schema";

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
const createTestSchema = (version = "3.1.0"): OpenAPI.Document => {
  return {
    openapi: version,
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
        get: {
          operationId: "getUserById",
          responses: {},
        },
      },
    },
  };
};

// Create test schema with webhooks (OpenAPI 3.1.0 only)
const createTestSchemaWithWebhooks = (): OpenAPI.Document => {
  const schema = createTestSchema("3.1.0");
  return {
    ...schema,
    webhooks: {
      "new-user": {
        post: {
          operationId: "webhookNewUser",
          description: "Webhook for new user creation",
          parameters: [
            {
              name: "token",
              in: "header",
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

// 3.1.0のコンテンツベースのパラメータタイプ
interface ContentBasedParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie" | "body";
  required?: boolean;
  content: {
    [mediaType: string]: {
      schema?: any;
    };
  };
}

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

    // Verify path-level parameters are included
    const getUserByIdTool = server.getTools().get("getUserById");
    expect(Object.keys(getUserByIdTool.paramSchema)).toContain("id");

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

  describe("buildParameterSchema", () => {
    it("should build parameter schema from operation parameters", () => {
      const operation: Operation = {
        operationId: "testOperation",
        parameters: [
          {
            name: "limit",
            in: "query",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "filter",
            in: "query",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "tags",
            in: "query",
            required: false,
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          {
            name: "active",
            in: "query",
            required: false,
            schema: {
              type: "boolean",
            },
          },
        ],
      };

      // Get API version (OpenAPI 3.0.0 for default test)
      const apiVersion = "3.0.0";
      const paramSchema = buildParameterSchema(operation, apiVersion);

      // Verify all parameters are included
      expect(Object.keys(paramSchema)).toContain("limit");
      expect(Object.keys(paramSchema)).toContain("filter");
      expect(Object.keys(paramSchema)).toContain("tags");
      expect(Object.keys(paramSchema)).toContain("active");

      // Verify required and optional parameters
      expect(paramSchema.limit.isOptional()).toBe(false);
      expect(paramSchema.filter.isOptional()).toBe(true);
    });

    it("should handle OpenAPI 3.0.0 parameters correctly", () => {
      // OpenAPI 3.0.0 path parameters
      const operation: Operation = {
        operationId: "getUserById",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
      };

      const paramSchema = buildParameterSchema(operation, "3.0.0");

      // Verify parameters are correctly parsed
      expect(Object.keys(paramSchema)).toContain("userId");
      expect(paramSchema.userId.isOptional()).toBe(false);
    });

    it("should handle OpenAPI 3.1.0 content-based parameters correctly", () => {
      // OpenAPI 3.1.0 content-based parameter
      const operation: Operation = {
        operationId: "searchItems",
        parameters: [
          {
            name: "filter",
            in: "query",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string" },
                  },
                },
              },
            },
          } as ContentBasedParameter,
        ],
      };

      const paramSchema = buildParameterSchema(operation, "3.1.0");

      // Verify content-based parameter is correctly parsed
      expect(Object.keys(paramSchema)).toContain("filter");
      expect(paramSchema.filter.isOptional()).toBe(false);
    });

    it("should handle requestBody correctly", () => {
      const operation: Operation = {
        operationId: "createUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                },
              },
            },
          },
        },
      };

      const paramSchema = buildParameterSchema(operation, "3.1.0");

      // Verify body parameter is included
      expect(Object.keys(paramSchema)).toContain("body");
    });

    it("should handle empty parameters", () => {
      const operation: Operation = {
        operationId: "emptyParams",
        // No parameters
      };

      const paramSchema = buildParameterSchema(operation, "3.0.0");

      // Verify empty object is returned
      expect(Object.keys(paramSchema).length).toBe(0);
    });

    it("should handle parameters without schema", () => {
      const operation: Operation = {
        operationId: "testOperation",
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            // No schema property
          },
        ],
      };

      const paramSchema = buildParameterSchema(operation, "3.0.0");

      // Verify parameter is included
      expect(Object.keys(paramSchema)).toContain("query");
    });
  });

  describe("findOperationById", () => {
    it("should find operation and include path-level parameters", () => {
      // Skip if findOperationById is not exported
      if (!findOperationById) {
        console.warn("findOperationById is not exported, skipping test");
        return;
      }

      const schema = createTestSchema();
      const apiVersion = detectOpenApiVersion(schema);
      const operation = findOperationById(schema, "getUserById", apiVersion);

      // Verify operation was found
      expect(operation).toBeDefined();
      expect(operation?.operationId).toBe("getUserById");
      expect(operation?.path).toBe("/users/{id}");

      // Verify path parameters were included
      expect(operation?.parameters).toBeDefined();
      expect(operation?.parameters?.length).toBe(1);
      expect(operation?.parameters?.[0].name).toBe("id");
      expect(operation?.parameters?.[0].in).toBe("path");
      expect(operation?.parameters?.[0].required).toBe(true);
    });

    it("should merge path-level and operation-level parameters", () => {
      // Skip if findOperationById is not exported
      if (!findOperationById) {
        console.warn("findOperationById is not exported, skipping test");
        return;
      }

      // Create schema with both path and operation parameters
      const schema: OpenAPI.Document = {
        openapi: "3.1.0",
        info: { title: "Test API", version: "1.0.0" },
        paths: {
          "/items/{itemId}": {
            parameters: [
              {
                name: "itemId",
                in: "path",
                required: true,
                schema: { type: "string" },
              },
            ],
            get: {
              operationId: "getItemById",
              parameters: [
                {
                  name: "fields",
                  in: "query",
                  required: false,
                  schema: { type: "string" },
                },
              ],
              responses: {}, // Add empty responses object to satisfy OpenAPI.OperationObject
            },
          },
        },
      };

      const apiVersion = detectOpenApiVersion(schema);
      const operation = findOperationById(schema, "getItemById", apiVersion);

      // Verify operation was found
      expect(operation).toBeDefined();

      // Verify both parameters were included
      expect(operation?.parameters).toBeDefined();
      expect(operation?.parameters?.length).toBe(2);

      // Find parameters by name
      const pathParam = operation?.parameters?.find(
        (p: any) => p.name === "itemId",
      );
      const queryParam = operation?.parameters?.find(
        (p: any) => p.name === "fields",
      );

      expect(pathParam).toBeDefined();
      expect(pathParam?.in).toBe("path");
      expect(pathParam?.required).toBe(true);

      expect(queryParam).toBeDefined();
      expect(queryParam?.in).toBe("query");
      expect(queryParam?.required).toBe(false);
    });

    it("should find operations in webhooks for OpenAPI 3.1.0", () => {
      // Skip if findOperationById is not exported
      if (!findOperationById) {
        console.warn("findOperationById is not exported, skipping test");
        return;
      }

      const schema = createTestSchemaWithWebhooks();
      const apiVersion = detectOpenApiVersion(schema);
      const operation = findOperationById(schema, "webhookNewUser", apiVersion);

      // Verify webhook operation was found
      expect(operation).toBeDefined();
      expect(operation?.operationId).toBe("webhookNewUser");
      expect(operation?.path).toContain("webhook:");
      expect(operation?.method).toBe("post");

      // Verify webhook parameters were included
      expect(operation?.parameters).toBeDefined();
      expect(operation?.parameters?.length).toBe(1);
      expect(operation?.parameters?.[0].name).toBe("token");
      expect(operation?.parameters?.[0].in).toBe("header");
    });
  });
});
