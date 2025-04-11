import { describe, it, expect, mock } from "bun:test";
import {
  createOpenApiClient,
  extractOperationIds,
} from "../../src/openapi/client";
import type { OpenAPIV3_1 } from "openapi-types";
import type { ServerConfig } from "../../src/config";
import path from "node:path";
import fs from "node:fs";

// openapi-client-axiosモジュールをモック
mock.module("openapi-client-axios", () => {
  return {
    OpenAPIClientAxios: function (options: any) {
      return {
        init: async () => ({ api: {} }),
        options,
      };
    },
  };
});

// テスト用のOpenAPIドキュメント
const createTestSchema = (): OpenAPIV3_1.Document => {
  return {
    openapi: "3.1.0",
    info: {
      title: "Test API",
      version: "1.0.0",
    },
    paths: {
      "/users": {
        get: {
          operationId: "getUsers",
          responses: {
            "200": {
              description: "OK",
            },
          },
        },
        post: {
          operationId: "createUser",
          responses: {
            "201": {
              description: "Created",
            },
          },
        },
      },
      "/users/{id}": {
        get: {
          operationId: "getUserById",
          responses: {
            "200": {
              description: "OK",
            },
          },
        },
      },
      "/products": {
        get: {
          // operationIdなし
          responses: {
            "200": {
              description: "OK",
            },
          },
        },
      },
    },
    components: {},
  };
};

// テスト用のサーバー設定
const testConfig: ServerConfig = {
  baseUrl: "https://test-api.example.com",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "test-api-key",
  },
};

describe("OpenAPI Client Module", () => {
  describe("createOpenApiClient", () => {
    it("should create a client with correct configuration", async () => {
      const schema = createTestSchema();
      const client = await createOpenApiClient(schema, testConfig);

      // クライアントが作成されることを確認
      expect(client).toBeDefined();
      expect(client.api).toBeDefined();
    });

    it("should throw an error when client initialization fails", async () => {
      // 一時的にOpenAPIClientAxiosを失敗させるようにモック
      mock.module("openapi-client-axios", () => {
        return {
          OpenAPIClientAxios: function () {
            return {
              init: () => {
                throw new Error("Initialization failed");
              },
            };
          },
        };
      });

      const schema = createTestSchema();
      await expect(createOpenApiClient(schema, testConfig)).rejects.toThrow(
        /Failed to initialize OpenAPI client/,
      );
    });
  });

  describe("extractOperationIds", () => {
    it("should extract all operation IDs from schema", () => {
      const schema = createTestSchema();
      const operationIds = extractOperationIds(schema);

      expect(operationIds).toBeArrayOfSize(3);
      expect(operationIds).toContain("getUsers");
      expect(operationIds).toContain("createUser");
      expect(operationIds).toContain("getUserById");
    });

    it("should return empty array for schema without paths", () => {
      const schema: OpenAPIV3_1.Document = {
        openapi: "3.1.0",
        info: {
          title: "Empty API",
          version: "1.0.0",
        },
        components: {},
      };
      const operationIds = extractOperationIds(schema);
      expect(operationIds).toBeArrayOfSize(0);
    });

    it("should handle operations without operationId", () => {
      const schema = createTestSchema();

      // pathsオブジェクトを取得し、productsパスのgetオペレーションにアクセス
      const paths = schema.paths || {};
      const productsPath = paths["/products"] as OpenAPIV3_1.PathItemObject;
      const getOperation = productsPath?.get as OpenAPIV3_1.OperationObject;

      // operationIdが含まれていないことを確認
      expect(getOperation).toBeDefined();
      expect(getOperation.operationId).toBeUndefined();

      // operationIdsが3つだけ（operationIdがあるもののみ）抽出されることを確認
      const operationIds = extractOperationIds(schema);
      expect(operationIds).toBeArrayOfSize(3);
    });

    it("should handle non-operation fields in path item", () => {
      // パスアイテム内の操作ではないフィールドを含むスキーマ
      const schema: OpenAPIV3_1.Document = {
        openapi: "3.1.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {
          "/users": {
            summary: "User endpoints",
            description: "Endpoints for user management",
            parameters: [],
            get: {
              operationId: "getUsers",
              responses: {
                "200": {
                  description: "OK",
                },
              },
            },
          },
        },
        components: {},
      };

      const operationIds = extractOperationIds(schema);
      expect(operationIds).toBeArrayOfSize(1);
      expect(operationIds).toContain("getUsers");
    });

    it("should handle null pathItem values", () => {
      const schema: OpenAPIV3_1.Document = {
        openapi: "3.1.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {
          "/users": undefined,
        },
        components: {},
      };

      const operationIds = extractOperationIds(schema);
      expect(operationIds).toBeArrayOfSize(0);
    });
  });
});
