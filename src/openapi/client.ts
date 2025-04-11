import { OpenAPIClientAxios } from "openapi-client-axios";
import type { OpenAPIV3_1 } from "openapi-types";
import type { ServerConfig } from "../config";
import { detectOpenApiVersion } from "./schema";

/**
 * Creates an OpenAPI client
 * Always uses the BASE_URL specified in environment variables and ignores the servers information in the OpenAPI spec
 * OpenAPI 3.0.0と3.1.0の両方に対応
 *
 * @param schema Validated OpenAPI schema
 * @param config Server configuration (baseUrl and headers)
 * @returns Initialized OpenAPI client
 */
export async function createOpenApiClient(
  schema: OpenAPIV3_1.Document,
  config: ServerConfig,
) {
  // スキーマのバージョンを検出
  const version = detectOpenApiVersion(schema);

  // バージョンに応じた設定調整が必要な場合はここで実装
  const clientOptions: any = {
    definition: schema,
    axiosConfigDefaults: {
      baseURL: config.baseUrl,
      headers: config.headers,
    },
  };

  // バージョン固有の設定を適用
  if (version === "3.0.0") {
    // OpenAPI 3.0.0固有の設定
    // console.info("Using OpenAPI 3.0.0 client configuration");
    // 必要に応じて設定を追加
  } else if (version === "3.1.0") {
    // OpenAPI 3.1.0固有の設定
    // console.info("Using OpenAPI 3.1.0 client configuration");
    // 必要に応じて設定を追加
  }

  // Ignore OpenAPI spec servers information and always use environment variable BASE_URL
  const apiClient = new OpenAPIClientAxios(clientOptions);

  try {
    // Initialize client
    const client = await apiClient.init();
    return client;
  } catch (error: any) {
    throw new Error(`Failed to initialize OpenAPI client: ${error.message}`);
  }
}

/**
 * Extracts a list of operation IDs from the OpenAPI schema
 * OpenAPI 3.0.0と3.1.0の両方に対応
 *
 * @param schema OpenAPI schema
 * @returns List of operation IDs
 */
export function extractOperationIds(schema: OpenAPIV3_1.Document): string[] {
  const operationIds: string[] = [];
  const version = detectOpenApiVersion(schema);

  if (!schema.paths) {
    return operationIds;
  }

  // バージョンに関わらず共通の処理を使用
  // OpenAPI 3.0.0と3.1.0はpathsとoperationIdの構造が基本的に同じ
  for (const [path, pathItem] of Object.entries(schema.paths)) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (
        typeof operation === "object" &&
        operation !== null &&
        "operationId" in operation &&
        operation.operationId
      ) {
        operationIds.push(operation.operationId);
      }
    }
  }

  return operationIds;
}
