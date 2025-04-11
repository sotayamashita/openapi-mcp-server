import type { ZodType } from "zod";

/**
 * MCP タイプの定義
 */

/**
 * MCPツールのコンテンツ型
 */
export interface ToolContentItem {
  type: string;
  text?: string;
  [key: string]: any;
}

/**
 * MCPツールのレスポンス型
 */
export interface ToolResponse {
  content: ToolContentItem[];
  isError?: boolean;
}

/**
 * ツール実行関数の型
 * パラメータを受け取り、ToolResponseを返すPromiseを返す関数
 */
export type ToolExecutor<T extends Record<string, any>> = (
  params: T,
) => Promise<ToolResponse>;

/**
 * MCP SDK互換のツール関数型
 */
export type ToolFunction = (
  params: Record<string, any>,
) => Promise<ToolResponse>;

/**
 * パラメータの型
 */
export interface Parameter {
  name: string;
  description?: string;
  in: "path" | "query" | "header" | "cookie" | "body";
  required?: boolean;
  schema?: any;
}

/**
 * OpenAPIオペレーション型
 */
export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  [key: string]: any;
}
