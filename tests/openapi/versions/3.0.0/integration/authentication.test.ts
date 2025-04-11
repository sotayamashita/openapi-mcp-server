import { describe, it, expect, beforeAll } from "bun:test";
import { loadOpenApiSpec } from "../../../../../src/openapi/parser";
import path from "node:path";
import fs from "node:fs";
import type { OpenAPIV3_1 } from "openapi-types";

describe("OpenAPI 3.0.0 Authentication Patterns", () => {
  let schema: OpenAPIV3_1.Document;

  beforeAll(async () => {
    // Load authentication patterns schema
    const specPath = path.join(
      "tests",
      "openapi",
      "fixtures",
      "3.0.0",
      "authentication-patterns.yaml",
    );

    // Verify file exists
    expect(fs.existsSync(specPath)).toBe(true);

    schema = await loadOpenApiSpec(specPath);
  });

  it("should correctly parse schema as OpenAPI 3.0.0", async () => {
    expect(schema).toBeDefined();
    expect(schema.openapi).toBe("3.0.0");
    expect(schema.info.title).toBe("Authentication Patterns API");
  });

  it("should correctly define securitySchemes", () => {
    // Verify components.securitySchemes exists
    expect(schema.components?.securitySchemes).toBeDefined();
    const securitySchemes = schema.components?.securitySchemes || {};

    // Basic Authentication
    expect(securitySchemes.basicAuth).toBeDefined();
    expect((securitySchemes.basicAuth as any)?.type).toBe("http");
    expect((securitySchemes.basicAuth as any)?.scheme).toBe("basic");

    // Bearer Authentication
    expect(securitySchemes.bearerAuth).toBeDefined();
    expect((securitySchemes.bearerAuth as any)?.type).toBe("http");
    expect((securitySchemes.bearerAuth as any)?.scheme).toBe("bearer");
    expect((securitySchemes.bearerAuth as any)?.bearerFormat).toBe("JWT");

    // Digest Authentication
    expect(securitySchemes.digestAuth).toBeDefined();
    expect((securitySchemes.digestAuth as any)?.type).toBe("http");
    expect((securitySchemes.digestAuth as any)?.scheme).toBe("digest");

    // API Key (Header)
    expect(securitySchemes.apiKeyHeader).toBeDefined();
    expect((securitySchemes.apiKeyHeader as any)?.type).toBe("apiKey");
    expect((securitySchemes.apiKeyHeader as any)?.in).toBe("header");
    expect((securitySchemes.apiKeyHeader as any)?.name).toBe("X-API-Key");

    // API Key (Query)
    expect(securitySchemes.apiKeyQuery).toBeDefined();
    expect((securitySchemes.apiKeyQuery as any)?.type).toBe("apiKey");
    expect((securitySchemes.apiKeyQuery as any)?.in).toBe("query");
    expect((securitySchemes.apiKeyQuery as any)?.name).toBe("api_key");

    // API Key (Cookie)
    expect(securitySchemes.apiKeyCookie).toBeDefined();
    expect((securitySchemes.apiKeyCookie as any)?.type).toBe("apiKey");
    expect((securitySchemes.apiKeyCookie as any)?.in).toBe("cookie");
    expect((securitySchemes.apiKeyCookie as any)?.name).toBe("SESSIONID");
  });

  it("should correctly define authentication requirements for paths", () => {
    // Verify paths exist
    expect(schema.paths).toBeDefined();
    const paths = schema.paths || {};

    // Basic Authentication endpoint
    expect(paths["/auth/basic"]).toBeDefined();
    expect(paths["/auth/basic"]?.get?.security).toContainEqual({
      basicAuth: [],
    });

    // Bearer Authentication endpoint
    expect(paths["/auth/bearer"]).toBeDefined();
    expect(paths["/auth/bearer"]?.get?.security).toContainEqual({
      bearerAuth: [],
    });

    // Digest Authentication endpoint
    expect(paths["/auth/digest"]).toBeDefined();
    expect(paths["/auth/digest"]?.get?.security).toContainEqual({
      digestAuth: [],
    });

    // API Key (Header) endpoint
    expect(paths["/auth/apikey/header"]).toBeDefined();
    expect(paths["/auth/apikey/header"]?.get?.security).toContainEqual({
      apiKeyHeader: [],
    });

    // API Key (Query) endpoint
    expect(paths["/auth/apikey/query"]).toBeDefined();
    expect(paths["/auth/apikey/query"]?.get?.security).toContainEqual({
      apiKeyQuery: [],
    });

    // API Key (Cookie) endpoint
    expect(paths["/auth/apikey/cookie"]).toBeDefined();
    expect(paths["/auth/apikey/cookie"]?.get?.security).toContainEqual({
      apiKeyCookie: [],
    });
  });

  it("should correctly define multiple authentication methods", () => {
    const paths = schema.paths || {};

    // Endpoint using any of multiple authentication methods
    expect(paths["/auth/multiple-options"]).toBeDefined();
    const multipleSecurity =
      paths["/auth/multiple-options"]?.get?.security || [];
    expect(multipleSecurity).toHaveLength(3);
    expect(multipleSecurity).toContainEqual({ basicAuth: [] });
    expect(multipleSecurity).toContainEqual({ bearerAuth: [] });
    expect(multipleSecurity).toContainEqual({ apiKeyHeader: [] });

    // Endpoint requiring combination of multiple authentication methods
    expect(paths["/auth/combined"]).toBeDefined();
    const combinedSecurity = paths["/auth/combined"]?.get?.security || [];
    expect(combinedSecurity).toHaveLength(1);
    expect(combinedSecurity[0]).toHaveProperty("bearerAuth");
    expect(combinedSecurity[0]).toHaveProperty("apiKeyHeader");
  });
});
