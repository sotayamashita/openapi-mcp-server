import { describe, test, expect } from "bun:test";
import fs from "node:fs";
import path from "path";
import yaml from "js-yaml";
import {
  parseOpenApi,
  safeParseOpenApi,
} from "../../../../../src/openapi/versions/3.0.0/parser";

const fixturesPath = path.resolve(__dirname, "../../../fixtures/3.0.0");

describe("OpenAPI 3.0.0 Parser Integration Tests", () => {
  describe("Basic API Parsing", () => {
    test("should successfully parse the PetStore API example", () => {
      // Read and parse the fixture file
      const petStoreYaml = fs.readFileSync(
        path.join(fixturesPath, "petstore.yaml"),
        "utf8",
      );
      const petStoreContent = yaml.load(petStoreYaml);

      // Parse the OpenAPI document
      const result = parseOpenApi(petStoreContent);

      // Basic validation of the parsed document
      expect(result).toBeDefined();
      expect(result.openapi).toBe("3.0.0");
      expect(result.info.title).toBe("Swagger Petstore");
      expect(result.paths).toBeDefined();
      expect(result.paths["/pets"]).toBeDefined();
      expect(result.paths["/pets"].get).toBeDefined();
      expect(result.paths["/pets"].post).toBeDefined();
      expect(result.paths["/pets/{petId}"]).toBeDefined();

      // Check components
      expect(result.components).toBeDefined();
      if (result.components) {
        expect(result.components.schemas).toBeDefined();
        if (result.components.schemas) {
          expect(result.components.schemas.Pet).toBeDefined();
        }
      }
    });
  });

  describe("Invalid Schema Detection", () => {
    test("should throw for document with missing required info", () => {
      // Read and parse the fixture file
      const invalidYaml = fs.readFileSync(
        path.join(fixturesPath, "invalid-missing-info.yaml"),
        "utf8",
      );
      const invalidContent = yaml.load(invalidYaml);

      // Parsing should throw an error
      expect(() => parseOpenApi(invalidContent)).toThrow();

      // Safe parsing should return an error object
      const safeResult = safeParseOpenApi(invalidContent);
      expect(safeResult.success).toBe(false);
      expect(safeResult.error).toBeDefined();
    });

    test("should throw for document with incorrect version", () => {
      // Read and parse the fixture file
      const invalidYaml = fs.readFileSync(
        path.join(fixturesPath, "invalid-version.yaml"),
        "utf8",
      );
      const invalidContent = yaml.load(invalidYaml);

      // Parsing should throw an error
      expect(() => parseOpenApi(invalidContent)).toThrow();

      // Safe parsing should return an error object
      const safeResult = safeParseOpenApi(invalidContent);
      expect(safeResult.success).toBe(false);
      expect(safeResult.error).toBeDefined();
    });
  });
});
