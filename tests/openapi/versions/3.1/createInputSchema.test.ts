/**
 * Test that path-level parameters are included in the input schema for the operation (OpenAPI 3.1).
 */
import { describe, it, expect } from "vitest";
import { createInputSchemaFromOperation } from "../../../../src/openapi/versions/3.1/createInputSchema";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

// Simulate dereferenced OpenAPI path item and operation
const pathLevelParameters: OpenAPIV3_1.ParameterObject[] = [
  {
    name: "userId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
];

const operation: OpenAPIV3_1.OperationObject = {
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
describe("createInputSchemaFromOperation (path-level parameters, OpenAPI 3.1)", () => {
  it("should include path-level parameters in the input schema (userId required)", () => {
    // Pass pathLevelParameters to createInputSchemaFromOperation
    const inputSchema = createInputSchemaFromOperation(
      operation,
      pathLevelParameters,
    );
    // Expected: pathParameters and userId should be included
    expect(
      inputSchema.pathParameters &&
        // @ts-expect-error: shape is internal
        inputSchema.pathParameters.shape.userId,
    ).toBeDefined();
  });
});
