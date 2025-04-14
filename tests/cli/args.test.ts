import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { parseCliArgs } from "../../src/cli/args";
import * as util from "node:util";

describe("CLI Arguments Parser", () => {
  // Store mock
  let parseArgsSpy: any;

  afterEach(() => {
    // Reset state after test
    if (parseArgsSpy) {
      parseArgsSpy.mockRestore();
    }
  });

  it("should correctly parse file path with --api argument", () => {
    // Mock node:util's parseArgs function
    parseArgsSpy = spyOn(util, "parseArgs").mockImplementation(() => {
      return {
        values: { api: "test-openapi.json" },
        positionals: [],
      } as any;
    });

    // Execute the function under test
    const result = parseCliArgs();

    // Verify results
    expect(result.openApiSpecPath).toBe("test-openapi.json");
    expect(parseArgsSpy).toHaveBeenCalled();
    expect(parseArgsSpy).toHaveBeenCalledTimes(1);
  });

  it("should correctly parse URL with --api argument", () => {
    // Mock node:util's parseArgs function
    parseArgsSpy = spyOn(util, "parseArgs").mockImplementation(() => {
      return {
        values: { api: "https://example.com/openapi.json" },
        positionals: [],
      } as any;
    });

    // Execute the function under test
    const result = parseCliArgs();

    // Verify results
    expect(result.openApiSpecPath).toBe("https://example.com/openapi.json");
    expect(parseArgsSpy).toHaveBeenCalled();
  });

  it("should throw error when --api argument is missing", () => {
    // Mock node:util's parseArgs function (without api argument)
    parseArgsSpy = spyOn(util, "parseArgs").mockImplementation(() => {
      return {
        values: {}, // no api argument
        positionals: [],
      } as any;
    });

    // Verify error is thrown
    expect(() => parseCliArgs()).toThrow(
      "OpenAPI specification path is required",
    );
    expect(parseArgsSpy).toHaveBeenCalled();
  });
});
