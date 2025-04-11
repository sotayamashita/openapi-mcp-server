import { McpServer as ProtocolServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ZodType } from "zod";
import type { ToolExecutor } from "../types";

// Re-export transport types
export { StdioServerTransport };

/**
 * MCP Server Configuration Options
 */
export interface McpServerOptions {
  name: string;
  version: string;
}

/**
 * MCP Server Class
 * A wrapper around MCP Protocol SDK that provides a user-friendly interface
 */
export class McpServer {
  private server: ProtocolServer;

  /**
   * Initialize MCP Server
   * @param options Server configuration options
   */
  constructor(options: McpServerOptions) {
    this.server = new ProtocolServer({
      name: options.name,
      version: options.version,
    });
  }

  /**
   * Register a tool with the server
   * @param name Tool name
   * @param description Tool description
   * @param paramSchema Parameter schema (Zod format)
   * @param executor Tool execution function
   * @returns this (for method chaining)
   */
  public tool<T extends Record<string, any>>(
    name: string,
    description: string,
    paramSchema: Record<string, ZodType>,
    executor: ToolExecutor<T>,
  ): this {
    // Use simple wrapper to avoid type mismatch with MCP SDK
    this.server.tool(
      name,
      description,
      paramSchema,
      // @ts-ignore Ignore type mismatch between ToolExecutor return type and SDK expected type
      async (params: Record<string, any>) => {
        return await executor(params as T);
      },
    );

    return this;
  }

  /**
   * Connect server using transport layer
   * @param transport Server transport
   * @returns Promise that resolves when connection is established
   */
  public async connect(transport: any): Promise<void> {
    await this.server.connect(transport);
  }
}
