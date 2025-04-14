import type { ZodType } from "zod";

/**
 * MCP Type Definitions
 */

/**
 * MCP Tool Content Type
 */
export interface ToolContentItem {
  type: string;
  text?: string;
  [key: string]: any;
}

/**
 * MCP Tool Response Type
 */
export interface ToolResponse {
  content: ToolContentItem[];
  isError?: boolean;
}

/**
 * Tool Execution Function Type
 * A function that takes parameters and returns a Promise of ToolResponse
 */
export type ToolExecutor<T extends Record<string, any>> = (
  params: T,
) => Promise<ToolResponse>;

/**
 * MCP SDK Compatible Tool Function Type
 */
export type ToolFunction = (
  params: Record<string, any>,
) => Promise<ToolResponse>;

/**
 * Parameter Type
 */
export interface Parameter {
  name: string;
  description?: string;
  in: "path" | "query" | "header" | "cookie" | "body";
  required?: boolean;
  schema?: any;
}

/**
 * OpenAPI Operation Type
 */
export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  [key: string]: any;
}
