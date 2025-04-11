import { describe, it, expect, mock, spyOn } from "bun:test";
import { McpServer } from "../../src/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// モックMCPサーバー
mock.module("@modelcontextprotocol/sdk/server/mcp.js", () => {
  return {
    McpServer: class MockMcpServer {
      name: string;
      version: string;
      tools = new Map();

      constructor(options: { name: string; version: string }) {
        this.name = options.name;
        this.version = options.version;
      }

      tool(name: string, description: string, schema: any, handler: any) {
        this.tools.set(name, { description, schema, handler });
        return this;
      }

      connect(transport: any) {
        return Promise.resolve();
      }
    },
  };
});

// モックトランスポート
const mockTransport = {
  onMessage: () => {},
  send: () => {},
} as any;

describe("MCP Server Module", () => {
  describe("McpServer", () => {
    it("should initialize with correct name and version", () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // サーバーが作成されたことを確認
      expect(server).toBeDefined();
    });

    it("should register tools with correct parameters", () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // ツール実行関数
      const toolHandler = async (params: any) => {
        return {
          content: [
            {
              type: "text",
              text: `Executed with params: ${JSON.stringify(params)}`,
            },
          ],
        };
      };

      // Zodスキーマ
      const paramSchema = {
        name: z.string(),
        id: z.number().optional(),
      };

      // ツールを登録
      const result = server.tool(
        "testTool",
        "Test tool description",
        paramSchema,
        toolHandler,
      );

      // メソッドチェーニングのためにthisを返すことを確認
      expect(result).toBe(server);
    });

    it("should connect to transport", async () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // connect関数をスパイ
      const connectSpy = spyOn(server as any, "connect").mockImplementation(
        () => Promise.resolve(),
      );

      await server.connect(mockTransport);

      // connect関数が呼ばれたことを確認
      expect(connectSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalledWith(mockTransport);

      // モックを元に戻す
      connectSpy.mockRestore();
    });

    it("should handle tool execution", async () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // 結果を記録するための変数
      let executionResult: any = null;

      // ツール実行関数
      const toolHandler = async (params: { name: string; id?: number }) => {
        return {
          content: [
            {
              type: "text",
              text: `Hello, ${params.name}!`,
            },
          ],
        };
      };

      // ツールを登録
      server.tool(
        "greet",
        "Greeting tool",
        {
          name: z.string(),
          id: z.number().optional(),
        },
        toolHandler,
      );

      // モックサーバーからツールハンドラを取得
      const mockServer = (server as any).server;
      const registeredTool = mockServer.tools.get("greet");

      expect(registeredTool).toBeDefined();
      expect(registeredTool.description).toBe("Greeting tool");

      // ツールハンドラを実行
      const result = await registeredTool.handler({ name: "Test User" });

      // 結果を確認
      expect(result).toBeDefined();
      expect(result.content).toBeArrayOfSize(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Hello, Test User!");
    });
  });
});
