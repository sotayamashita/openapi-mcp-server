import { describe, test, expect } from "bun:test";
import { PathsSchema } from "../../../../../src/openapi/versions/3.0.0/schemas/processed/paths";
import { PathItemSchema } from "../../../../../src/openapi/versions/3.0.0/schemas/processed/path-item";
import { OperationSchema } from "../../../../../src/openapi/versions/3.0.0/schemas/processed/operation";
import { ResponsesSchema } from "../../../../../src/openapi/versions/3.0.0/schemas/processed/responses";
import { ResponseSchema } from "../../../../../src/openapi/versions/3.0.0/schemas/processed/response";
import { ParameterSchema } from "../../../../../src/openapi/versions/3.0.0/schemas/processed/parameter";

describe("OpenAPI 3.0.0 Paths and Operations", () => {
  describe("Paths Schema", () => {
    test("should validate valid paths object", () => {
      const validPaths = {
        "/pets": {
          get: {
            summary: "List all pets",
            operationId: "listPets",
            responses: {
              "200": {
                description: "A paged array of pets",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            format: "int64",
                          },
                          name: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = PathsSchema.safeParse(validPaths);
      expect(result.success).toBe(true);
    });
  });

  describe("Path Item Schema", () => {
    test("should validate valid path item object", () => {
      const validPathItem = {
        summary: "Pet operations",
        description: "Operations for working with pets",
        get: {
          summary: "List all pets",
          operationId: "listPets",
          responses: {
            "200": {
              description: "A paged array of pets",
            },
          },
        },
        post: {
          summary: "Create a pet",
          operationId: "createPet",
          responses: {
            "201": {
              description: "Pet created",
            },
          },
        },
      };

      const result = PathItemSchema.safeParse(validPathItem);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalPathItem = {
        get: {
          responses: {
            "200": {
              description: "Success",
            },
          },
        },
      };

      const result = PathItemSchema.safeParse(minimalPathItem);
      expect(result.success).toBe(true);
    });
  });

  describe("Operation Schema", () => {
    test("should validate valid operation object", () => {
      const validOperation = {
        tags: ["pet"],
        summary: "List all pets",
        description: "Returns all pets from the system",
        operationId: "listPets",
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "How many items to return at one time",
            schema: {
              type: "integer",
              format: "int32",
            },
          },
        ],
        responses: {
          "200": {
            description: "A paged array of pets",
          },
        },
      };

      const result = OperationSchema.safeParse(validOperation);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalOperation = {
        responses: {
          "200": {
            description: "Success",
          },
        },
      };

      const result = OperationSchema.safeParse(minimalOperation);
      expect(result.success).toBe(true);
    });

    test("should fail without responses", () => {
      const invalidOperation = {
        operationId: "listPets",
      };

      const result = OperationSchema.safeParse(invalidOperation);
      expect(result.success).toBe(false);
    });
  });

  describe("Parameter Schema", () => {
    test("should validate valid parameter object", () => {
      const validParameter = {
        name: "limit",
        in: "query",
        description: "How many items to return at one time",
        required: false,
        schema: {
          type: "integer",
          format: "int32",
        },
      };

      const result = ParameterSchema.safeParse(validParameter);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalParameter = {
        name: "id",
        in: "path",
      };

      const result = ParameterSchema.safeParse(minimalParameter);
      expect(result.success).toBe(true);
    });

    test("should fail without required fields", () => {
      const invalidParameter = {
        description: "Pet ID",
      };

      const result = ParameterSchema.safeParse(invalidParameter);
      expect(result.success).toBe(false);
    });
  });

  describe("Response Schema", () => {
    test("should validate valid response object", () => {
      const validResponse = {
        description: "A paged array of pets",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    format: "int64",
                  },
                  name: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      };

      const result = ResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    test("should validate with only description", () => {
      const minimalResponse = {
        description: "Success",
      };

      const result = ResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });

    test("should fail without description", () => {
      const invalidResponse = {
        content: {
          "application/json": {
            schema: {
              type: "string",
            },
          },
        },
      };

      const result = ResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });
});
