import { describe, it, expect, beforeAll, mock } from "bun:test";
import { loadOpenApiSpec } from "../../src/openapi/parser";
import fs from "node:fs";
import path from "node:path";
import type { OpenAPIV3_1, OpenAPIV3 } from "openapi-types";

// Create required directories before tests
beforeAll(() => {
  try {
    fs.mkdirSync(path.join("tests", "openapi", "fixtures"), {
      recursive: true,
    });
  } catch (error) {
    // Ignore if directory already exists
  }
});

describe("OpenAPI Parser Module", () => {
  describe("loadOpenApiSpec", () => {
    it("should load and parse a valid OpenAPI 3.1.0 spec from file", async () => {
      // Create mock test file in 3.1.0 format
      const specPath = path.join(
        "tests",
        "openapi",
        "fixtures",
        "simple-api-3.1.0.json",
      );
      const specContent = JSON.stringify({
        openapi: "3.1.0",
        info: { title: "Test API", version: "1.0.0" },
        paths: {
          "/users": {
            get: { operationId: "getUsers" },
          },
        },
      });
      fs.writeFileSync(specPath, specContent);

      const schema = await loadOpenApiSpec(specPath);

      expect(schema).toBeDefined();
      expect(schema.info?.title).toBe("Test API");
      expect((schema as OpenAPIV3.Document).openapi).toBe("3.1.0");

      // Type-safe access
      const paths = schema.paths || {};
      const usersPath = paths["/users"];
      expect(usersPath).toBeDefined();

      // Using as assertion for type safety
      const getUsersOperation = usersPath?.get as OpenAPIV3_1.OperationObject;
      expect(getUsersOperation?.operationId).toBe("getUsers");
    });

    it("should load and parse a valid OpenAPI 3.0.0 spec from file", async () => {
      // Create mock test file in 3.0.0 format
      const specPath = path.join(
        "tests",
        "openapi",
        "fixtures",
        "simple-api-3.0.0.json",
      );
      const specContent = JSON.stringify({
        openapi: "3.0.0",
        info: { title: "Test API 3.0", version: "1.0.0" },
        paths: {
          "/users": {
            get: { operationId: "getUsers" },
          },
        },
      });
      fs.writeFileSync(specPath, specContent);

      const schema = await loadOpenApiSpec(specPath);

      expect(schema).toBeDefined();
      expect(schema.info?.title).toBe("Test API 3.0");
      expect((schema as OpenAPIV3.Document).openapi).toBe("3.0.0");

      // Type-safe access
      const paths = schema.paths || {};
      const usersPath = paths["/users"];
      expect(usersPath).toBeDefined();

      // Using as assertion for type safety
      const getUsersOperation = usersPath?.get as OpenAPIV3_1.OperationObject;
      expect(getUsersOperation?.operationId).toBe("getUsers");
    });

    it("should generate operationIds for paths without them", async () => {
      const specPath = path.join(
        "tests",
        "openapi",
        "fixtures",
        "simple-api.json",
      );
      const schema = await loadOpenApiSpec(specPath);

      // Type-safe access
      const paths = schema.paths || {};
      const productsPath = paths["/products"];
      expect(productsPath).toBeDefined();

      // Using as assertion for type safety
      const getProductsOperation =
        productsPath?.get as OpenAPIV3_1.OperationObject;
      expect(getProductsOperation?.operationId).toBeDefined();
      expect(getProductsOperation?.operationId).toBe("getProducts");
    });

    it("should throw an error for empty spec path", async () => {
      await expect(loadOpenApiSpec("")).rejects.toThrow("cannot be empty");
    });

    it("should handle validation errors for invalid schemas", async () => {
      // Redirect console.warn to capture warnings
      const originalWarn = console.warn;
      const mockWarn = mock((message: string, ...args: any[]) => {});
      console.warn = mockWarn;

      try {
        const specPath = path.join(
          "tests",
          "openapi",
          "fixtures",
          "invalid-missing-info.json",
        );
        const schema = await loadOpenApiSpec(specPath);

        // Even with validation errors, it should return the schema
        expect(schema).toBeDefined();
        expect(schema.paths).toBeDefined();

        // Should log warnings for validation errors
        expect(mockWarn).toHaveBeenCalled();
      } finally {
        // Restore console.warn
        console.warn = originalWarn;
      }
    });

    it("should detect duplicate operationIds", async () => {
      // Redirect console.warn to capture warnings
      const originalWarn = console.warn;
      const mockWarn = mock((message: string, ...args: any[]) => {});
      console.warn = mockWarn;

      try {
        const specPath = path.join(
          "tests",
          "openapi",
          "fixtures",
          "invalid-duplicate-operationid.json",
        );
        const schema = await loadOpenApiSpec(specPath);

        // Should load the schema even with duplicates
        expect(schema).toBeDefined();

        // Should log warnings about duplicate operationIds
        expect(mockWarn).toHaveBeenCalled();

        // Safely get mock call arguments
        const calls = mockWarn.mock.calls;
        if (calls.length > 0 && calls[0].length > 1) {
          const callArg = calls[0][1];
          // Runtime check for array
          if (Array.isArray(callArg)) {
            // At least one error should be about duplicate operationId
            const hasDuplicateError = callArg.some(
              (error: any) =>
                typeof error === "string" &&
                error.includes("Duplicate operationId"),
            );
            expect(hasDuplicateError).toBe(true);
          }
        }
      } finally {
        // Restore console.warn
        console.warn = originalWarn;
      }
    });

    it("should throw an error for non-existent file", async () => {
      await expect(loadOpenApiSpec("non-existent-file.json")).rejects.toThrow();
    });

    it("should handle URL-based spec paths with OpenAPI 3.1.0", async () => {
      // Mock fetch for URL-based spec
      const originalFetch = global.fetch;

      // Type extension for Bun.mock
      const mockedFetch = mock(
        (url: string): Promise<Response> =>
          Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                JSON.stringify({
                  openapi: "3.1.0",
                  info: { title: "URL API", version: "1.0.0" },
                  paths: {},
                }),
              ),
          } as Response),
      );

      global.fetch = mockedFetch as unknown as typeof fetch;

      try {
        const schema = await loadOpenApiSpec(
          "https://example.com/api-spec.json",
        );
        expect(schema).toBeDefined();
        expect(schema.info?.title).toBe("URL API");
        expect((schema as OpenAPIV3.Document).openapi).toBe("3.1.0");
      } finally {
        // Restore fetch
        global.fetch = originalFetch;
      }
    });

    it("should handle URL-based spec paths with OpenAPI 3.0.0", async () => {
      // Mock fetch for URL-based spec
      const originalFetch = global.fetch;

      // Type extension for Bun.mock
      const mockedFetch = mock(
        (url: string): Promise<Response> =>
          Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                JSON.stringify({
                  openapi: "3.0.0",
                  info: { title: "URL API 3.0", version: "1.0.0" },
                  paths: {},
                }),
              ),
          } as Response),
      );

      global.fetch = mockedFetch as unknown as typeof fetch;

      try {
        const schema = await loadOpenApiSpec(
          "https://example.com/api-spec-3.0.json",
        );
        expect(schema).toBeDefined();
        expect(schema.info?.title).toBe("URL API 3.0");
        expect((schema as OpenAPIV3.Document).openapi).toBe("3.0.0");
      } finally {
        // Restore fetch
        global.fetch = originalFetch;
      }
    });

    it("should throw an error for failed URL fetch", async () => {
      // Mock fetch for failed URL fetch
      const originalFetch = global.fetch;

      // Type extension for Bun.mock
      const mockedFetch = mock(
        (url: string): Promise<Response> =>
          Promise.resolve({
            ok: false,
            statusText: "Not Found",
          } as Response),
      );

      global.fetch = mockedFetch as unknown as typeof fetch;

      try {
        await expect(
          loadOpenApiSpec("https://example.com/not-found.json"),
        ).rejects.toThrow("Not Found");
      } finally {
        // Restore fetch
        global.fetch = originalFetch;
      }
    });
  });
});
