/**
 * Test that path-level parameters are included in the input schema for the operation.
 */
import { describe, it, expect } from "vitest";
import { createInputSchemaFromOperation } from "../../../../src/openapi/versions/3.0/createInputSchema";
import type { OpenAPIV3 } from "@scalar/openapi-types";

// Simulate dereferenced OpenAPI path item and operation
const pathLevelParameters: OpenAPIV3.ParameterObject[] = [
  {
    name: "userId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
];

const operation: OpenAPIV3.OperationObject = {
  operationId: "getUserById",
  summary: "Get user by ID",
  description: "Returns a single user by ID",
  responses: {},
};

/**
 * This test simulates the real OpenAPI bug: path-level parameters are ignored if not merged into operation.parameters.
 * Expected: inputSchema should include pathParameters.userId as required string, but current implementation will fail.
 */
describe("createInputSchemaFromOperation (path-level parameters)", () => {
  it("should include path-level parameters in the input schema (userId required)", () => {
    const inputSchema = createInputSchemaFromOperation(
      operation,
      pathLevelParameters,
    );
    expect(inputSchema.pathParameters).toBeDefined();
    // @ts-expect-error: shape is internal
    expect(inputSchema.pathParameters.shape.userId).toBeDefined();
    // @ts-expect-error: _def is internal
    expect(inputSchema.pathParameters.shape.userId._def.typeName).toBe(
      "ZodString",
    );
  });
});
