import { describe, it, expect } from "bun:test";
import { StdioServerTransport } from "../../src/mcp";

describe("MCP Transport Module", () => {
  describe("Exports", () => {
    it("should export StdioServerTransport", () => {
      // Verify that StdioServerTransport is exported
      expect(StdioServerTransport).toBeDefined();
    });
  });
});
