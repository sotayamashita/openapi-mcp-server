import { describe, test, expect } from "bun:test";
import {
  parseOpenApi,
  safeParseOpenApi,
} from "../../../../src/openapi/versions/3.0.0/parser";

describe("OpenAPI 3.0.0 Parser", () => {
  describe("parseOpenApi", () => {
    test("should parse valid OpenAPI 3.0.0 document", () => {
      const validDoc = {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = parseOpenApi(validDoc);
      expect(result).toEqual(validDoc);
    });

    test("should throw for invalid OpenAPI version", () => {
      const invalidDoc = {
        openapi: "2.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {},
      };

      expect(() => parseOpenApi(invalidDoc)).toThrow();
    });

    test("should throw for missing required fields", () => {
      const invalidDoc = {
        openapi: "3.0.0",
        // Missing info
        paths: {},
      };

      expect(() => parseOpenApi(invalidDoc)).toThrow();
    });
  });

  describe("safeParseOpenApi", () => {
    test("should successfully parse valid document", () => {
      const validDoc = {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = safeParseOpenApi(validDoc);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validDoc);
    });

    test("should return error details for invalid document", () => {
      const invalidDoc = {
        openapi: "3.0.0",
        // Missing info
        paths: {},
      };

      const result = safeParseOpenApi(invalidDoc);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
