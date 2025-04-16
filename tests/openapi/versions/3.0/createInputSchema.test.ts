/**
 * Test that path-level parameters are included in the input schema for the operation (OpenAPI 3.0).
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
  // Note: parameters is intentionally omitted to simulate the scenario
};

/**
 * This test verifies that path-level parameters are correctly included in the input schema,
 * even when they are not explicitly defined in operation.parameters.
 * Expected: inputSchema should include pathParameters.userId
 */
describe("createInputSchemaFromOperation (path-level parameters, OpenAPI 3.0)", () => {
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
