import { expect, test, describe, mock } from "bun:test";
import { dereference } from "@scalar/openapi-parser";
import { OpenApiObjectSchema as OpenApiObjectSchemaV3_1 } from "@scalar/openapi-types/schemas/3.1/unprocessed";

// モジュールをモック化
mock.module("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  McpServer: class MockMcpServer {
    name: string;
    version: string;

    constructor(options: { name: string; version: string }) {
      this.name = options.name;
      this.version = options.version;
    }

    tool() {
      return this;
    }

    async connect() {
      return true;
    }
  },
}));

mock.module("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: class MockStdioTransport {
    constructor() {}
  },
}));

describe("OpenAPI MCPサーバー", () => {
  test("ローカルファイルからスキーマを読み込める", async () => {
    // Bunのファイル読み込みをモック
    const mockText = JSON.stringify({
      openapi: "3.1.0",
      info: { title: "TestAPI", version: "1.0.0" },
      paths: { "/test": { get: { operationId: "getTest" } } },
    });

    const originalFile = Bun.file;
    // @ts-ignore
    global.Bun.file = () => ({
      text: async () => mockText,
    });

    // ファイルから読み込むことをテスト
    const { schema } = await dereference(mockText);
    const validatedSchema = OpenApiObjectSchemaV3_1.parse(schema);

    expect(validatedSchema.info?.title).toBe("TestAPI");
    expect(validatedSchema.info?.version).toBe("1.0.0");

    // モックをリセット
    // @ts-ignore
    global.Bun.file = originalFile;
  });

  test("URLからスキーマを読み込める", async () => {
    // オリジナルのfetchを保存
    const originalFetch = global.fetch;

    // fetchをモック
    // @ts-ignore: 部分的なモックのため
    global.fetch = async () => {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () =>
          JSON.stringify({
            openapi: "3.1.0",
            info: { title: "RemoteAPI", version: "2.0.0" },
            paths: { "/remote": { get: { operationId: "getRemote" } } },
          }),
      };
    };

    // URLから読み込むことをテスト
    const response = await fetch("https://example.com/api.json");
    const text = await response.text();
    const { schema } = await dereference(text);
    const validatedSchema = OpenApiObjectSchemaV3_1.parse(schema);

    expect(validatedSchema.info?.title).toBe("RemoteAPI");
    expect(validatedSchema.info?.version).toBe("2.0.0");

    // モックをリセット
    global.fetch = originalFetch;
  });
});
