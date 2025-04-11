import { describe, it, expect, mock, spyOn } from "bun:test";
import { buildToolsFromOpenApi } from "../../src/tools/builder";
import { McpServer } from "../../src/mcp/server";
import type { OpenAPIV3_1 } from "openapi-types";
import type { ServerConfig } from "../../src/config";
import type { ToolResponse } from "../../src/types";

// McpServerのモック実装
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

// テスト用のOpenAPIクライアントモック
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

// テスト用のOpenAPI スキーマ
const createTestSchema = (): OpenAPIV3_1.Document => {
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

// テスト用の設定
const testConfig: ServerConfig = {
  baseUrl: "https://test-api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
};

describe("Tools Builder Module", () => {
  it("should build tools from OpenAPI schema", async () => {
    // コンソール出力をモック
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

    // 正しい数のツールが登録されたか確認
    expect(count).toBe(3);
    expect(server.getTools().size).toBe(3);

    // 特定のツールが登録されているか確認
    expect(server.getTools().has("getUsers")).toBe(true);
    expect(server.getTools().has("createUser")).toBe(true);
    expect(server.getTools().has("getUserById")).toBe(true);

    // ツールの説明とパラメータが正しいか確認
    const getUsersTool = server.getTools().get("getUsers");
    expect(getUsersTool.description).toBe("Get a list of users");
    expect(Object.keys(getUsersTool.paramSchema)).toContain("limit");

    // スパイをリセット
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("should handle empty operationIds", async () => {
    // スキーマのpathsをカスタマイズ
    const schema = createTestSchema();
    schema.paths = {};

    const server = createMockServer();
    const client = createMockClient();

    // コンソール出力をモック
    const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    const count = await buildToolsFromOpenApi(
      server,
      schema,
      client,
      testConfig,
    );

    // ツールが登録されていないことを確認
    expect(count).toBe(0);
    expect(server.getTools().size).toBe(0);

    // 警告が出力されたことを確認
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No operation IDs found in the OpenAPI schema",
    );

    consoleWarnSpy.mockRestore();
  });

  it("should handle errors during tool building", async () => {
    const server = createMockServer();
    const client = createMockClient();

    // エラーを発生させるためにschemaをnullに
    const schema = null as unknown as OpenAPIV3_1.Document;

    await expect(
      buildToolsFromOpenApi(server, schema, client, testConfig),
    ).rejects.toThrow(/Failed to build tools from OpenAPI schema/);
  });
});
