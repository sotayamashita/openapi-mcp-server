import { describe, it, expect, afterEach, beforeEach, spyOn } from "bun:test";
import { loadConfig } from "../../src/config";

describe("Config Module", () => {
  // Save original environment variables
  const originalEnv = { ...process.env };

  // Reset environment variables before each test
  beforeEach(() => {
    // Clear environment variables for testing
    delete process.env.BASE_URL;
    delete process.env.HEADERS;
  });

  // Restore environment variables after each test
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should load BASE_URL correctly", () => {
    // Set environment variables for testing
    process.env.BASE_URL = "https://api.example.com/v1";

    // Load configuration
    const config = loadConfig();

    // Verify expected values
    expect(config.baseUrl).toBe("https://api.example.com/v1");
    expect(config.headers).toEqual({
      "Content-Type": "application/json",
      "User-Agent": "openapi-mcp-server",
    });
  });

  it("should throw error when BASE_URL is not set", () => {
    // Load without setting BASE_URL
    expect(() => loadConfig()).toThrow(
      "BASE_URL environment variable is required",
    );
  });

  it("should parse HEADERS correctly", () => {
    // Set environment variables
    process.env.BASE_URL = "https://api.example.com/v1";
    process.env.HEADERS = JSON.stringify({
      Authorization: "Bearer token123",
      "X-Custom-Header": "custom-value",
    });

    // Load configuration
    const config = loadConfig();

    // Verify expected values
    expect(config.baseUrl).toBe("https://api.example.com/v1");
    expect(config.headers).toEqual({
      "Content-Type": "application/json",
      "User-Agent": "openapi-mcp-server",
      Authorization: "Bearer token123",
      "X-Custom-Header": "custom-value",
    });
  });

  it("should use default headers when HEADERS is invalid JSON", () => {
    // Set environment variables (invalid JSON)
    process.env.BASE_URL = "https://api.example.com/v1";
    process.env.HEADERS = "invalid-json";

    // Load configuration
    const config = loadConfig();

    // Verify expected values
    expect(config.baseUrl).toBe("https://api.example.com/v1");
    expect(config.headers).toEqual({
      "Content-Type": "application/json",
      "User-Agent": "openapi-mcp-server",
    });
  });

  it("should override default headers with custom ones", () => {
    // Set environment variables (overriding some headers)
    process.env.BASE_URL = "https://api.example.com/v1";
    process.env.HEADERS = JSON.stringify({
      "Content-Type": "application/xml", // Different from default
    });

    // Load configuration
    const config = loadConfig();

    // Verify expected values
    expect(config.baseUrl).toBe("https://api.example.com/v1");
    expect(config.headers).toEqual({
      "Content-Type": "application/xml", // Overridden value
      "User-Agent": "openapi-mcp-server", // Default value
    });
  });
});
