/**
 * Unit test for getOperationIdsFromPathItem.
 * Ensures that only HTTP method operations are considered and path-level parameters are ignored.
 */
import { describe, it, expect } from "vitest";
import { getOperationIdsFromPathItem } from "../../../src/openapi/common/pathitem";

// Minimal mock of a PathItemObject with path-level parameters and valid operations
const pathItem: any = {
  parameters: [
    {
      name: "userId",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  get: {
    operationId: "getUserById",
    summary: "Get user by ID",
    description: "Returns a single user by ID",
    responses: {},
  },
  put: {
    operationId: "updateUser",
    summary: "Update user",
    description: "Updates a user",
    responses: {},
  },
  // parameters property is not an operation
};

describe("getOperationIdsFromPathItem", () => {
  it("returns only operationIds for HTTP methods, ignoring non-operation properties", () => {
    const ids = getOperationIdsFromPathItem(pathItem);
    expect(ids).toEqual(["getUserById", "updateUser"]);
  });
});
