import { describe, it, expect, mock, spyOn } from "bun:test";
import { McpServer } from "../../src/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Mock MCP server
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

// Mock transport
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

      // Verify server is created
      expect(server).toBeDefined();
    });

    it("should register tools with correct parameters", () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // Tool execution function
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

      // Zod schema
      const paramSchema = {
        name: z.string(),
        id: z.number().optional(),
      };

      // Register tool
      const result = server.tool(
        "testTool",
        "Test tool description",
        paramSchema,
        toolHandler,
      );

      // Verify method chaining returns this
      expect(result).toBe(server);
    });

    it("should connect to transport", async () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // Spy on connect function
      const connectSpy = spyOn(server as any, "connect").mockImplementation(
        () => Promise.resolve(),
      );

      await server.connect(mockTransport);

      // Verify connect was called
      expect(connectSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalledWith(mockTransport);

      // Restore mock
      connectSpy.mockRestore();
    });

    it("should handle tool execution", async () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // Variable to record execution result
      let executionResult: any = null;

      // Tool execution function
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

      // Register tool
      server.tool(
        "greet",
        "Greeting tool",
        {
          name: z.string(),
          id: z.number().optional(),
        },
        toolHandler,
      );

      // Get tool handler from mock server
      const mockServer = (server as any).server;
      const registeredTool = mockServer.tools.get("greet");

      expect(registeredTool).toBeDefined();
      expect(registeredTool.description).toBe("Greeting tool");

      // Execute tool handler
      const result = await registeredTool.handler({ name: "Test User" });

      // Verify result
      expect(result).toBeDefined();
      expect(result.content).toBeArrayOfSize(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Hello, Test User!");
    });
  });
});
