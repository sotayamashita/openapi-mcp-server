import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadConfig } from "../../src/config/index";

const ORIGINAL_ENV = process.env;

describe("loadConfig", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  it("throws error when BASE_URL is not set", () => {
    delete process.env.BASE_URL;
    expect(() => loadConfig()).toThrow(
      "BASE_URL environment variable is required",
    );
  });

  it("uses default values when HEADERS is not set", () => {
    process.env.BASE_URL = "https://example.com";
    delete process.env.HEADERS;
    const config = loadConfig();
    expect(config).toEqual({
      baseUrl: "https://example.com",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "openapi-mcp-server",
      },
    });
  });

  it("merges headers when HEADERS is a valid JSON string", () => {
    process.env.BASE_URL = "https://example.com";
    process.env.HEADERS = JSON.stringify({ Authorization: "Bearer token" });
    const config = loadConfig();
    expect(config).toEqual({
      baseUrl: "https://example.com",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "openapi-mcp-server",
        Authorization: "Bearer token",
      },
    });
  });

  it("uses default values and logs error when HEADERS is invalid JSON", () => {
    process.env.BASE_URL = "https://example.com";
    process.env.HEADERS = "{invalid json}";
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const config = loadConfig();
    expect(config).toEqual({
      baseUrl: "https://example.com",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "openapi-mcp-server",
      },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid HEADERS format"),
    );
  });
});
