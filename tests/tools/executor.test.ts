import { describe, it, expect, mock, spyOn } from "bun:test";
import { executeApiRequest, buildRequestUrl } from "../../src/tools/executor";
import type { Operation, ToolResponse } from "../../src/types";
import type { ServerConfig } from "../../src/config";
import { AxiosError } from "axios";

// Test server configuration
const testConfig: ServerConfig = {
  baseUrl: "https://test-api.example.com",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "test-api-key",
  },
};

// Test operation
const createTestOperation = (): Operation => {
  return {
    operationId: "testOperation",
    path: "/users/{id}",
    method: "get",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
      {
        name: "fields",
        in: "query",
        required: false,
        schema: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    ],
  };
};

describe("Tools Executor Module", () => {
  describe("buildRequestUrl", () => {
    it("should build URL with path parameters correctly", () => {
      const operation = createTestOperation();
      const params = { id: "123" };

      const url = buildRequestUrl("/users/{id}", params, operation, testConfig);

      expect(url).toBe("https://test-api.example.com/users/123");
    });

    it("should build URL with query parameters correctly", () => {
      const operation = createTestOperation();
      const params = { id: "123", fields: ["name", "email"] };

      const url = buildRequestUrl("/users/{id}", params, operation, testConfig);

      expect(url).toBe(
        "https://test-api.example.com/users/123?fields=name&fields=email",
      );
    });

    it("should encode special characters in parameters", () => {
      const operation = createTestOperation();
      const params = { id: "user/123", fields: ["full name"] };

      const url = buildRequestUrl("/users/{id}", params, operation, testConfig);

      // URLSearchParams converts spaces to + (not %20)
      expect(url).toBe(
        "https://test-api.example.com/users/user%2F123?fields=full+name",
      );
    });

    it("should handle missing parameters", () => {
      const operation = createTestOperation();
      const params = {}; // missing id

      const url = buildRequestUrl("/users/{id}", params, operation, testConfig);

      // URL is still generated even with missing parameters (not replaced)
      expect(url).toBe("https://test-api.example.com/users/{id}");
    });
  });

  describe("executeApiRequest", () => {
    it("should execute API request and return formatted response", async () => {
      const operation = createTestOperation();
      const params = { id: "123" };

      // Mock API client
      const testOperationMock = mock(() =>
        Promise.resolve({
          data: { id: "123", name: "Test User" },
        }),
      );

      const client = {
        testOperation: testOperationMock,
      };

      const response = await executeApiRequest(
        client,
        "testOperation",
        params,
        operation,
        testConfig,
      );

      // Verify response format
      expect(response).toHaveProperty("content");
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");

      // Check if JSON is formatted correctly (string comparison due to null handling)
      const textContent = response.content[0].text;
      expect(textContent).not.toBe("");
      if (textContent) {
        const responseData = JSON.parse(textContent);
        expect(responseData).toHaveProperty("id", "123");
        expect(responseData).toHaveProperty("name", "Test User");
      }

      // Verify client was called
      expect(testOperationMock).toHaveBeenCalledWith(params);
    });

    it("should handle API errors correctly", async () => {
      const operation = createTestOperation();
      const params = { id: "999" };

      // Mock console error
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(
        () => {},
      );

      // Mock API client that returns error
      const errorMock = mock(() => {
        const error = new AxiosError("Not Found");
        error.response = {
          status: 404,
          data: { message: "User not found" },
          statusText: "Not Found",
          headers: {},
          config: { headers: {} } as any,
        };
        return Promise.reject(error);
      });

      const client = {
        testOperation: errorMock,
      };

      const response = await executeApiRequest(
        client,
        "testOperation",
        params,
        operation,
        testConfig,
      );

      // Verify error response format
      expect(response).toHaveProperty("content");
      expect(response).toHaveProperty("isError", true);
      const textContent = response.content[0].text;
      expect(textContent).toMatch(/API Error \(404\)/);
      expect(textContent).toMatch(/User not found/);

      consoleErrorSpy.mockRestore();
    });

    it("should handle non-Axios errors", async () => {
      const operation = createTestOperation();
      const params = { id: "123" };

      // Mock console error
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(
        () => {},
      );

      // Mock client that throws general error
      const generalErrorMock = mock(() => {
        throw new Error("General error");
      });

      const client = {
        testOperation: generalErrorMock,
      };

      const response = await executeApiRequest(
        client,
        "testOperation",
        params,
        operation,
        testConfig,
      );

      // Verify error response format
      expect(response).toHaveProperty("content");
      expect(response).toHaveProperty("isError", true);
      expect(response.content[0].text).toBe("Error: General error");

      consoleErrorSpy.mockRestore();
    });
  });
});
