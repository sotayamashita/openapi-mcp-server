import dotenv from "dotenv";

/**
 * Server configuration type definition
 */
export interface ServerConfig {
  /**
   * Base URL for API endpoint
   */
  baseUrl: string;

  /**
   * HTTP headers used for API requests
   */
  headers: Record<string, string>;
}

// Default HTTP headers configuration
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "openapi-mcp-server",
};

/**
 * Load configuration from environment variables
 * @throws {Error} Throws error if BASE_URL environment variable is not set
 * @returns {ServerConfig} Configuration object
 */
export function loadConfig(): ServerConfig {
  // Load environment variables
  dotenv.config();

  // Get and validate BASE_URL (required)
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL environment variable is required");
  }

  // Parse HEADERS (JSON or default)
  let headers = DEFAULT_HEADERS;
  if (process.env.HEADERS) {
    try {
      const customHeaders = JSON.parse(process.env.HEADERS);
      headers = { ...DEFAULT_HEADERS, ...customHeaders };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Invalid HEADERS format: ${message}. Using defaults.`);
    }
  }

  return {
    baseUrl,
    headers,
  };
}
