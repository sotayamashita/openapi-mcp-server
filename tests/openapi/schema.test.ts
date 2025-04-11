import { describe, it, expect } from "bun:test";
import {
  createParameterSchema,
  validateOperationIds,
  generateOperationId,
  validateSchema,
} from "../../src/openapi/schema";
import type { OpenApiParameter } from "../../src/openapi/schema";
import { z } from "zod";

describe("OpenAPI Schema Module", () => {
  describe("createParameterSchema", () => {
    it("should create parameter schema from OpenAPI parameters", () => {
      const parameters: OpenApiParameter[] = [
        {
          name: "limit",
          description: "Maximum number of items",
          in: "query",
          required: true,
          schema: { type: "integer" },
        },
        {
          name: "filter",
          description: "Filter string",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "id",
          description: "Item ID",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "active",
          description: "Active status",
          in: "query",
          required: false,
          schema: { type: "boolean" },
        },
      ];

      const schema = createParameterSchema(parameters);

      // Ensure all parameters are included
      expect(Object.keys(schema)).toEqual(["limit", "filter", "id", "active"]);

      // Check parameter types
      expect(schema.limit instanceof z.ZodNumber).toBe(true);
      expect(schema.filter instanceof z.ZodOptional).toBe(true);
      expect(schema.id instanceof z.ZodString).toBe(true);
      expect(schema.active instanceof z.ZodOptional).toBe(true);

      // Check optional params unwrapping
      if (schema.filter instanceof z.ZodOptional) {
        expect(schema.filter.unwrap() instanceof z.ZodString).toBe(true);
      }

      // Validate with sample data
      expect(() => schema.limit.parse(10)).not.toThrow();
      expect(() => schema.limit.parse("abc")).toThrow();
      expect(() => schema.id.parse("123")).not.toThrow();
      expect(() => schema.active.parse(undefined)).not.toThrow();
      expect(() => schema.active.parse(true)).not.toThrow();

      // Description checks (using safeParse for reflection)
      expect(schema.limit.description).toBe("Maximum number of items");
      if (schema.filter instanceof z.ZodOptional) {
        expect(schema.filter.unwrap().description).toBe("Filter string");
      }
    });

    it("should handle empty or undefined parameters", () => {
      expect(Object.keys(createParameterSchema([]))).toEqual([]);
      expect(Object.keys(createParameterSchema(undefined))).toEqual([]);
    });

    it("should skip parameters without names", () => {
      const parameters: OpenApiParameter[] = [
        { name: "valid" },
        { name: "" },
        { description: "Invalid parameter" } as OpenApiParameter,
      ];

      const schema = createParameterSchema(parameters);
      expect(Object.keys(schema)).toEqual(["valid"]);
    });
  });

  describe("generateOperationId", () => {
    it("should generate operation ID from path and method", () => {
      expect(generateOperationId("/users", "get")).toBe("getUsers");
      expect(generateOperationId("/users/{id}", "get")).toBe("getUsersById");
      expect(
        generateOperationId("/users/{userId}/posts/{postId}", "post"),
      ).toBe("postUsersByUserIdPostsByPostId");
      expect(generateOperationId("/api/v1/items", "delete")).toBe(
        "deleteApiV1Items",
      );
      expect(generateOperationId("/data-points/current", "get")).toBe(
        "getDataPointsCurrent",
      );
    });

    it("should handle special characters and formats", () => {
      expect(generateOperationId("/", "get")).toBe("get");
      expect(generateOperationId("//double-slash", "post")).toBe(
        "postDoubleSlash",
      );
      expect(generateOperationId("/with-hyphen", "put")).toBe("putWithHyphen");
      expect(generateOperationId("/with_underscore", "patch")).toBe(
        "patchWithUnderscore",
      );
    });
  });

  describe("validateOperationIds", () => {
    it("should return empty errors for valid schema", () => {
      const schema = {
        paths: {
          "/users": {
            get: { operationId: "getUsers" },
            post: { operationId: "createUser" },
          },
          "/users/{id}": {
            get: { operationId: "getUserById" },
          },
        },
      };

      const result = validateOperationIds(schema);
      expect(result.errors).toEqual([]);
    });

    it("should detect duplicate operationIds", () => {
      const schema = {
        paths: {
          "/users": {
            get: { operationId: "getItems" },
            post: { operationId: "createUser" },
          },
          "/items": {
            get: { operationId: "getItems" }, // Duplicate
          },
        },
      };

      const result = validateOperationIds(schema);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Duplicate operationId: getItems");
    });

    it("should generate alternative IDs for operations without operationId", () => {
      const schema = {
        paths: {
          "/users": {
            get: { summary: "Get Users" }, // No operationId
          },
          "/products": {
            get: { summary: "Get Products" }, // No operationId
          },
        },
      };

      const result = validateOperationIds(schema);
      expect(result.errors).toEqual([]);
      expect(Object.keys(result.alternativeIds)).toHaveLength(2);
      expect(result.alternativeIds["GET /users"]).toBe("getUsers");
      expect(result.alternativeIds["GET /products"]).toBe("getProducts");
    });

    it("should handle empty paths", () => {
      const schema = { paths: {} };
      const result = validateOperationIds(schema);
      expect(result.errors).toEqual([]);
      expect(Object.keys(result.alternativeIds)).toHaveLength(0);
    });

    it("should handle schema without paths", () => {
      const schema = {};
      const result = validateOperationIds(schema);
      expect(result.errors).toEqual([]);
      expect(Object.keys(result.alternativeIds)).toHaveLength(0);
    });
  });

  describe("validateSchema", () => {
    it("should validate a valid schema", async () => {
      const schema = {
        openapi: "3.1.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {
          "/users": {
            get: { operationId: "getUsers" },
          },
        },
      };

      const result = await validateSchema(schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return errors for invalid schema", async () => {
      // This is a very simple test - in real tests you would check more specific validation errors
      const schema = {
        // Missing required fields like info, paths
      };

      const result = await validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
