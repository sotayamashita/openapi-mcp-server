import { describe, it, expect, beforeAll } from "bun:test";
import { loadOpenApiSpec } from "../../../../../src/openapi/parser";
import path from "node:path";
import fs from "node:fs";
import type { OpenAPIV3_1 } from "openapi-types";

describe("OpenAPI 3.0.0認証パターン", () => {
  let schema: OpenAPIV3_1.Document;

  beforeAll(async () => {
    // 認証パターンのスキーマをロードする
    const specPath = path.join(
      "tests",
      "openapi",
      "fixtures",
      "3.0.0",
      "authentication-patterns.yaml",
    );

    // ファイルが存在することを確認
    expect(fs.existsSync(specPath)).toBe(true);

    schema = await loadOpenApiSpec(specPath);
  });

  it("スキーマがOpenAPI 3.0.0として正しく解析されること", async () => {
    expect(schema).toBeDefined();
    expect(schema.openapi).toBe("3.0.0");
    expect(schema.info.title).toBe("Authentication Patterns API");
  });

  it("securitySchemesが正しく定義されていること", () => {
    // components.securitySchemesが存在することを確認
    expect(schema.components?.securitySchemes).toBeDefined();
    const securitySchemes = schema.components?.securitySchemes || {};

    // Basic認証
    expect(securitySchemes.basicAuth).toBeDefined();
    expect((securitySchemes.basicAuth as any)?.type).toBe("http");
    expect((securitySchemes.basicAuth as any)?.scheme).toBe("basic");

    // Bearer認証
    expect(securitySchemes.bearerAuth).toBeDefined();
    expect((securitySchemes.bearerAuth as any)?.type).toBe("http");
    expect((securitySchemes.bearerAuth as any)?.scheme).toBe("bearer");
    expect((securitySchemes.bearerAuth as any)?.bearerFormat).toBe("JWT");

    // Digest認証
    expect(securitySchemes.digestAuth).toBeDefined();
    expect((securitySchemes.digestAuth as any)?.type).toBe("http");
    expect((securitySchemes.digestAuth as any)?.scheme).toBe("digest");

    // APIキー（ヘッダー）
    expect(securitySchemes.apiKeyHeader).toBeDefined();
    expect((securitySchemes.apiKeyHeader as any)?.type).toBe("apiKey");
    expect((securitySchemes.apiKeyHeader as any)?.in).toBe("header");
    expect((securitySchemes.apiKeyHeader as any)?.name).toBe("X-API-Key");

    // APIキー（クエリ）
    expect(securitySchemes.apiKeyQuery).toBeDefined();
    expect((securitySchemes.apiKeyQuery as any)?.type).toBe("apiKey");
    expect((securitySchemes.apiKeyQuery as any)?.in).toBe("query");
    expect((securitySchemes.apiKeyQuery as any)?.name).toBe("api_key");

    // APIキー（Cookie）
    expect(securitySchemes.apiKeyCookie).toBeDefined();
    expect((securitySchemes.apiKeyCookie as any)?.type).toBe("apiKey");
    expect((securitySchemes.apiKeyCookie as any)?.in).toBe("cookie");
    expect((securitySchemes.apiKeyCookie as any)?.name).toBe("SESSIONID");
  });

  it("パスが認証要件を正しく定義していること", () => {
    // パスが存在することを確認
    expect(schema.paths).toBeDefined();
    const paths = schema.paths || {};

    // Basic認証のエンドポイント
    expect(paths["/auth/basic"]).toBeDefined();
    expect(paths["/auth/basic"]?.get?.security).toContainEqual({
      basicAuth: [],
    });

    // Bearer認証のエンドポイント
    expect(paths["/auth/bearer"]).toBeDefined();
    expect(paths["/auth/bearer"]?.get?.security).toContainEqual({
      bearerAuth: [],
    });

    // Digest認証のエンドポイント
    expect(paths["/auth/digest"]).toBeDefined();
    expect(paths["/auth/digest"]?.get?.security).toContainEqual({
      digestAuth: [],
    });

    // APIキー（ヘッダー）のエンドポイント
    expect(paths["/auth/apikey/header"]).toBeDefined();
    expect(paths["/auth/apikey/header"]?.get?.security).toContainEqual({
      apiKeyHeader: [],
    });

    // APIキー（クエリ）のエンドポイント
    expect(paths["/auth/apikey/query"]).toBeDefined();
    expect(paths["/auth/apikey/query"]?.get?.security).toContainEqual({
      apiKeyQuery: [],
    });

    // APIキー（Cookie）のエンドポイント
    expect(paths["/auth/apikey/cookie"]).toBeDefined();
    expect(paths["/auth/apikey/cookie"]?.get?.security).toContainEqual({
      apiKeyCookie: [],
    });
  });

  it("複数の認証方式が正しく定義されていること", () => {
    const paths = schema.paths || {};

    // 複数の認証方式のいずれかを使用するエンドポイント
    expect(paths["/auth/multiple-options"]).toBeDefined();
    const multipleSecurity =
      paths["/auth/multiple-options"]?.get?.security || [];
    expect(multipleSecurity).toHaveLength(3);
    expect(multipleSecurity).toContainEqual({ basicAuth: [] });
    expect(multipleSecurity).toContainEqual({ bearerAuth: [] });
    expect(multipleSecurity).toContainEqual({ apiKeyHeader: [] });

    // 複数の認証方式をすべて組み合わせて使用するエンドポイント
    expect(paths["/auth/combined"]).toBeDefined();
    const combinedSecurity = paths["/auth/combined"]?.get?.security || [];
    expect(combinedSecurity).toHaveLength(1);
    expect(combinedSecurity[0]).toHaveProperty("bearerAuth");
    expect(combinedSecurity[0]).toHaveProperty("apiKeyHeader");
  });
});
