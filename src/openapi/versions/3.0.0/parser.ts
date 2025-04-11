import { OpenApiObjectSchema, type OpenApiObject } from "./schemas/processed";

/**
 * OpenAPI 3.0.0ドキュメントをパースして検証する
 *
 * @param document OpenAPIドキュメント
 * @returns 検証されたOpenAPI 3.0.0ドキュメント
 * @throws スキーマ検証に失敗した場合
 */
export function parseOpenApi(document: unknown): OpenApiObject {
  // Zodスキーマを使用して検証
  const validatedDoc = OpenApiObjectSchema.parse(document);
  return processOpenApi(validatedDoc);
}

/**
 * 検証されたOpenAPI 3.0.0ドキュメントを処理する
 *
 * @param validatedDoc 検証済みのOpenAPI 3.0.0ドキュメント
 * @returns 処理されたOpenAPI 3.0.0ドキュメント
 */
function processOpenApi(validatedDoc: OpenApiObject): OpenApiObject {
  // ここに追加の処理ロジックを実装
  // 例: 参照解決、追加検証など

  return validatedDoc;
}

/**
 * OpenAPI 3.0.0ドキュメントをパースして検証する（安全版）
 * エラーをスローせず、結果オブジェクトを返す
 *
 * @param document OpenAPIドキュメント
 * @returns 検証結果と検証されたドキュメント（成功時）
 */
export function safeParseOpenApi(document: unknown): {
  success: boolean;
  data?: OpenApiObject;
  error?: any;
} {
  try {
    // Zodスキーマを使用して検証
    const result = OpenApiObjectSchema.safeParse(document);

    if (result.success) {
      return {
        success: true,
        data: processOpenApi(result.data),
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
