import { parseArgs } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { dereference } from "@scalar/openapi-parser";
import { OpenApiObjectSchema as OpenApiObjectSchemaV3_1 } from "@scalar/openapi-types/schemas/3.1/unprocessed";
import { OpenAPIClientAxios } from "openapi-client-axios";
import { z } from "zod";
import type { OpenAPIV3_1 } from "openapi-types";

// Load environment variables
dotenv.config();

// Parse command line arguments
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    api: {
      type: "string", // OpenAPI spec URL or file path
    },
  },
});

// Get API path from positional argument or --api option
const apiUrl = positionals[0] || (values.api as string);

async function startMCPServer(apiUrl: string) {
  // Check if the API is a file path or URL

  let text;
  if (/^https?:\/\//.test(apiUrl)) {
    const response = await fetch(apiUrl);
    text = await response.text();
  } else {
    const file = Bun.file(apiUrl);
    text = await file.text();
  }

  const { schema } = await dereference(text);

  const validatedSchema = OpenApiObjectSchemaV3_1.parse(schema);

  const server = new McpServer({
    name: validatedSchema?.info?.title || "oasis",
    version: validatedSchema?.info?.version || "0.0.0",
  });

  // Convert OpenAPI spec to MCP tools a.k.a register operation as MCP Server Tool
  if (validatedSchema.paths) {
    // OpenAPI Client Axiosのインスタンスを作成
    const apiClient = new OpenAPIClientAxios({
      definition: validatedSchema as OpenAPIV3_1.Document,
      axiosConfigDefaults: {
        baseURL: "http://localhost:1234",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "openapi-mcp-server",
        },
      },
    });
    const client = await apiClient.init();

    for (const [path, pathItem] of Object.entries(validatedSchema.paths)) {
      for (const [method, operation] of Object.entries(pathItem || {})) {
        if (
          typeof operation === "object" &&
          operation !== null &&
          "operationId" in operation &&
          operation.operationId
        ) {
          const operationId = operation.operationId;
          const summary =
            typeof operation.summary === "string"
              ? operation.summary
              : operationId;
          const description =
            typeof operation.description === "string"
              ? operation.description
              : summary;

          // OpenAPI パラメーターからzodスキーマを作成
          let paramSchema: Record<string, z.ZodType> = {};
          if (operation.parameters) {
            for (const param of operation.parameters) {
              if (
                typeof param === "object" &&
                param &&
                "name" in param &&
                param.name
              ) {
                // 単純化のため、すべてのパラメータをstring型として扱う
                paramSchema[param.name] = z
                  .any()
                  .describe(param.description || "");
              }
            }
          }

          // MCPツールとして登録
          server.tool(operationId, paramSchema, async (params) => {
            try {
              // HTTPメソッドとオペレーション情報を取得
              const pathEntry =
                validatedSchema.paths && validatedSchema.paths[path];
              const operationEntry =
                pathEntry &&
                Object.entries(pathEntry).find(
                  ([_, op]) =>
                    typeof op === "object" &&
                    op !== null &&
                    "operationId" in op &&
                    op.operationId === operationId,
                );
              const httpMethod = operationEntry?.[0]?.toUpperCase();
              const operation = operationEntry?.[1] as any;

              // リクエストURLを構築
              let requestUrl = "";
              if (
                validatedSchema.servers &&
                validatedSchema.servers.length > 0
              ) {
                const baseUrl = validatedSchema.servers[0].url;
                // パスパラメータを置換
                let pathWithParams = path;
                if (operation?.parameters) {
                  operation.parameters.forEach((param: any) => {
                    if (param.in === "path" && params[param.name]) {
                      pathWithParams = pathWithParams.replace(
                        `{${param.name}}`,
                        params[param.name],
                      );
                    }
                  });
                }
                requestUrl = `${baseUrl}${pathWithParams}`;

                // クエリパラメータを追加
                const queryParams: string[] = [];
                if (operation?.parameters) {
                  operation.parameters.forEach((param: any) => {
                    if (
                      param.in === "query" &&
                      params[param.name] !== undefined
                    ) {
                      queryParams.push(
                        `${param.name}=${encodeURIComponent(
                          params[param.name],
                        )}`,
                      );
                    }
                  });
                }
                if (queryParams.length > 0) {
                  requestUrl += `?${queryParams.join("&")}`;
                }
              }

              console.error(
                `Executing ${operationId} with HTTP method: ${
                  httpMethod || "unknown"
                }`,
              );
              console.error(`Request URL: ${requestUrl || "unknown"}`);
              console.error("Call", operationId, params);
              const response = await (client as any)[operationId](params);
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(response.data),
                  },
                ],
              };
            } catch (error: any) {
              console.error(`Error executing ${operationId}:`, error);
              return {
                content: [
                  {
                    type: "text",
                    text: `Error: ${error.message}`,
                  },
                ],
                isError: true,
              };
            }
          });
        }
      }
    }
  }

  // Start the MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startMCPServer(apiUrl).catch((err) => {
  console.error(err);
  process.exit(1);
});
