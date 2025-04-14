import { expect, test, describe, mock } from "bun:test";
import { dereference } from "@scalar/openapi-parser";
import { OpenApiObjectSchema as OpenApiObjectSchemaV3_1 } from "@scalar/openapi-types/schemas/3.1/unprocessed";

// Mock modules
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

describe("OpenAPI MCP Server", () => {
  test("can load schema from local file", async () => {
    // Mock Bun file reading
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

    // Test loading from file
    const { schema } = await dereference(mockText);
    const validatedSchema = OpenApiObjectSchemaV3_1.parse(schema);

    expect(validatedSchema.info?.title).toBe("TestAPI");
    expect(validatedSchema.info?.version).toBe("1.0.0");

    // Reset mock
    // @ts-ignore
    global.Bun.file = originalFile;
  });

  test("can load schema from URL", async () => {
    // Save original fetch
    const originalFetch = global.fetch;

    // Mock fetch
    // @ts-ignore: Partial mock
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

    // Test loading from URL
    const response = await fetch("https://example.com/api.json");
    const text = await response.text();
    const { schema } = await dereference(text);
    const validatedSchema = OpenApiObjectSchemaV3_1.parse(schema);

    expect(validatedSchema.info?.title).toBe("RemoteAPI");
    expect(validatedSchema.info?.version).toBe("2.0.0");

    // Reset mock
    global.fetch = originalFetch;
  });
});
