import { describe, it, expect } from "bun:test";
import { McpServer, StdioServerTransport } from "../../src/mcp";
import { z } from "zod";

describe("MCP Module Integration", () => {
  describe("Exports", () => {
    it("should export McpServer", () => {
      expect(McpServer).toBeDefined();
      expect(typeof McpServer).toBe("function");
    });

    it("should export StdioServerTransport", () => {
      expect(StdioServerTransport).toBeDefined();
      expect(typeof StdioServerTransport).toBe("function");
    });
  });

  describe("Module API consistency", () => {
    it("should create server instances with proper API", () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // Check if required methods exist
      expect(server.tool).toBeDefined();
      expect(typeof server.tool).toBe("function");
      expect(server.connect).toBeDefined();
      expect(typeof server.connect).toBe("function");
    });

    it("should have expected method signatures", () => {
      const server = new McpServer({
        name: "TestAPI",
        version: "1.0.0",
      });

      // Check if tool method returns instance for method chaining
      const result = server.tool(
        "test",
        "test description",
        { param: z.string() },
        async () => ({ content: [] }),
      );

      expect(result).toBe(server);
    });
  });
});
