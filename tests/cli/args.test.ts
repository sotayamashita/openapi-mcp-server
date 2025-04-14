import { describe, it, expect, afterEach, spyOn, beforeEach } from "bun:test";
import { parseCliArgs } from "../../src/cli/args";
import * as util from "node:util";

// More precise type for parseArgs return value
type MockParseArgsResult = {
  values: Record<string, string | undefined>;
  positionals: string[];
};

describe("CLI Arguments Parser", () => {
  // Explicit type definition for mock
  let parseArgsSpy: ReturnType<typeof spyOn<typeof util, "parseArgs">>;

  // Sample paths for testing different scenarios
  const testPaths = {
    localFile: "test-openapi.json",
    remoteUrl: "https://example.com/openapi.json",
    relativePath: "./schemas/openapi.yaml",
    absolutePath: "/home/user/schemas/openapi.json",
    withSpaces: "file with spaces.json",
    withSpecialChars: "schema@v2.0.0.json",
    withNonAscii: "api/v1/schema.yaml",
  };

  beforeEach(() => {
    // Initialize mock before each test
    parseArgsSpy = spyOn(util, "parseArgs");
  });

  afterEach(() => {
    // Reset mock after each test
    parseArgsSpy.mockRestore();
  });

  // Helper to create a mock result for parseArgs
  function createMockResult(apiValue?: string): MockParseArgsResult {
    const values: Record<string, string | undefined> = {};
    if (apiValue !== undefined) {
      values.api = apiValue;
    }
    return { values, positionals: [] };
  }

  describe("Path parsing", () => {
    it("should correctly parse local file path", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.localFile) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.localFile);
      expectCorrectParseArgsCall();
    });

    it("should correctly parse remote URL", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.remoteUrl) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.remoteUrl);
      expectCorrectParseArgsCall();
    });

    it("should correctly parse relative path", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.relativePath) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.relativePath);
      expectCorrectParseArgsCall();
    });

    it("should correctly parse absolute path", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.absolutePath) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.absolutePath);
      expectCorrectParseArgsCall();
    });
  });

  describe("Special character handling", () => {
    it("should handle paths with spaces", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.withSpaces) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.withSpaces);
    });

    it("should handle paths with special characters", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.withSpecialChars) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.withSpecialChars);
    });

    it("should handle paths with non-ASCII characters", () => {
      // Setup
      parseArgsSpy.mockImplementation(
        () => createMockResult(testPaths.withNonAscii) as any,
      );

      // Execute
      const result = parseCliArgs();

      // Verify
      expect(result.openApiSpecPath).toBe(testPaths.withNonAscii);
    });
  });

  describe("Error handling", () => {
    it("should throw an error when --api argument is missing", () => {
      // Setup - no api value
      parseArgsSpy.mockImplementation(() => createMockResult() as any);

      // Verify error is thrown with correct message
      expect(() => parseCliArgs()).toThrow(
        "OpenAPI specification path is required (--api=<path>)",
      );
    });

    it("should throw an error when --api argument is empty", () => {
      // Setup - empty string for api
      parseArgsSpy.mockImplementation(() => createMockResult("") as any);

      // Verify error is thrown with correct message
      expect(() => parseCliArgs()).toThrow(
        "OpenAPI specification path is required (--api=<path>)",
      );
    });
  });

  // Helper function to verify parseArgs was called with correct parameters
  function expectCorrectParseArgsCall() {
    expect(parseArgsSpy).toHaveBeenCalledWith({
      args: process.argv,
      options: {
        api: {
          type: "string",
          required: true,
        },
      },
      strict: false,
      allowPositionals: true,
    });
  }
});
