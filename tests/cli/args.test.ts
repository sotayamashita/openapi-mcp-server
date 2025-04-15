import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseCliArgs, type CliOptions } from "../../src/cli/args";

describe("parseCliArgs", () => {
  const originalArgv = process.argv;
  let errorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console.error to suppress output during tests and allow checks
    errorMock = vi.spyOn(console, "error").mockImplementation(() => {});
    // Reset argv before each test
    process.argv = [...originalArgv.slice(0, 2)]; // Keep node executable and script path
  });

  afterEach(() => {
    // Restore original implementations after each test
    vi.restoreAllMocks();
    process.argv = originalArgv;
  });

  it("parses file path provided with --api argument", () => {
    const specPath = "./openapi.yaml";
    process.argv.push("--api", specPath);

    const options: CliOptions = parseCliArgs();
    expect(options).toEqual({ openApiSpecPath: specPath });
  });

  it("parses URL provided with --api argument", () => {
    const specUrl = "https://example.com/openapi.yaml";
    process.argv.push("--api", specUrl);

    const options: CliOptions = parseCliArgs();
    expect(options).toEqual({ openApiSpecPath: specUrl });
  });

  it("handles equals sign format (--api=value)", () => {
    const specPath = "https://example.com/spec.json";
    process.argv.push(`--api=${specPath}`);

    const options: CliOptions = parseCliArgs();
    expect(options).toEqual({ openApiSpecPath: specPath });
  });

  it("throws error when --api argument is missing", () => {
    expect(() => parseCliArgs()).toThrow(
      "The --api=<spec_path_or_url> argument is required.",
    );
  });

  it("throws error when --api argument has no value", () => {
    process.argv.push("--api");
    expect(() => parseCliArgs()).toThrow(
      "Option '--api <value>' argument missing",
    );
  });
});
