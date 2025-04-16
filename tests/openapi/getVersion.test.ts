import { describe, it, expect } from "vitest";
import { getVersion } from "../../src/openapi/versions/getVersion";

describe("getVersion", () => {
  it("returns '3.0' for OpenAPI 3.0.x schema", () => {
    const schema = { openapi: "3.0.2" };
    expect(getVersion(schema as any)).toBe("3.0");
  });

  it("returns '3.1' for OpenAPI 3.1.x schema", () => {
    const schema = { openapi: "3.1.0" };
    expect(getVersion(schema as any)).toBe("3.1");
  });

  it("throws if openapi property is missing", () => {
    const schema = { info: {} };
    expect(() => getVersion(schema as any)).toThrow(
      "Invalid OpenAPI schema object or missing 'openapi' version string.",
    );
  });

  it("throws if openapi version is unsupported", () => {
    const schema = { openapi: "2.0.0" };
    expect(() => getVersion(schema as any)).toThrow(
      "Unsupported OpenAPI version: 2.0.0. Only versions 3.0.x and 3.1.x are supported.",
    );
  });

  it("throws if schema is null", () => {
    expect(() => getVersion(null as any)).toThrow(
      "Invalid OpenAPI schema object or missing 'openapi' version string.",
    );
  });

  it("throws if schema is undefined", () => {
    expect(() => getVersion(undefined as any)).toThrow(
      "Invalid OpenAPI schema object or missing 'openapi' version string.",
    );
  });

  it("throws if schema is an empty object", () => {
    expect(() => getVersion({} as any)).toThrow(
      "Invalid OpenAPI schema object or missing 'openapi' version string.",
    );
  });
});
