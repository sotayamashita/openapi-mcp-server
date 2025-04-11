import { describe, test, expect } from "bun:test";
import fs from "node:fs";
import path from "path";
import yaml from "js-yaml";
import { parseOpenApi } from "../../../../../src/openapi/versions/3.0.0/parser";

const fixturesPath = path.resolve(__dirname, "../../../fixtures/3.0.0");

describe("OpenAPI 3.0.0 Schema Components Integration Tests", () => {
  describe("Reference Resolution", () => {
    test("should correctly parse a document with internal references", () => {
      // Read and parse the fixture file
      const referencesYaml = fs.readFileSync(
        path.join(fixturesPath, "references.yaml"),
        "utf8",
      );
      const referencesContent = yaml.load(referencesYaml);

      // Parse the OpenAPI document
      const result = parseOpenApi(referencesContent);

      // Verify document was parsed correctly
      expect(result).toBeDefined();
      expect(result.openapi).toBe("3.0.0");
      expect(result.info.title).toBe("References API");

      // Verify paths object structure
      expect(result.paths).toBeDefined();
      expect(result.paths["/users"]).toBeDefined();
      expect(result.paths["/users"].get).toBeDefined();
      expect(result.paths["/users"].get.parameters).toBeDefined();
      expect(result.paths["/users"].get.parameters?.length).toBe(2);

      // Verify components
      expect(result.components).toBeDefined();
      if (result.components) {
        // Check parameters
        expect(result.components.parameters).toBeDefined();
        if (result.components.parameters) {
          expect(result.components.parameters.limitParam).toBeDefined();
          expect(result.components.parameters.skipParam).toBeDefined();
          expect(result.components.parameters.userIdParam).toBeDefined();
        }

        // Check schemas
        expect(result.components.schemas).toBeDefined();
        if (result.components.schemas) {
          expect(result.components.schemas.User).toBeDefined();
          expect(result.components.schemas.Address).toBeDefined();
          expect(result.components.schemas.Error).toBeDefined();

          // Verify nested references in schemas
          if (result.components.schemas.User) {
            const user = result.components.schemas.User;
            expect(user.properties).toBeDefined();
            if (user.properties) {
              expect(user.properties.address).toBeDefined();
              expect(user.properties.address.$ref).toBe(
                "#/components/schemas/Address",
              );
            }
          }
        }

        // Check responses
        expect(result.components.responses).toBeDefined();
        if (result.components.responses) {
          expect(result.components.responses.UsersResponse).toBeDefined();
          expect(result.components.responses.UserResponse).toBeDefined();
          expect(result.components.responses.BadRequest).toBeDefined();
          expect(result.components.responses.NotFound).toBeDefined();
          expect(result.components.responses.ServerError).toBeDefined();
        }
      }
    });
  });

  describe("OpenAPI 3.0.0 Specific Features", () => {
    test("should correctly parse nullable fields", () => {
      // Read and parse the fixture file
      const advancedYaml = fs.readFileSync(
        path.join(fixturesPath, "advanced-features.yaml"),
        "utf8",
      );
      const advancedContent = yaml.load(advancedYaml);

      // Parse the OpenAPI document
      const result = parseOpenApi(advancedContent);

      // Verify nullable fields
      expect(result.components).toBeDefined();
      if (result.components?.schemas) {
        // Check nullable string
        const nullableString = result.components.schemas.NullableString;
        expect(nullableString).toBeDefined();
        expect(nullableString.type).toBe("string");
        expect(nullableString.nullable).toBe(true);

        // Check nullable fields in complex objects
        const pet = result.components.schemas.Pet;
        expect(pet).toBeDefined();
        expect(pet.properties).toBeDefined();
        if (pet.properties) {
          expect(pet.properties.age).toBeDefined();
          expect(pet.properties.age.nullable).toBe(true);
          expect(pet.properties.tags).toBeDefined();
          expect(pet.properties.tags.nullable).toBe(true);
        }

        // Check nullable in nested object
        const measurements = result.components.schemas.Measurements;
        expect(measurements).toBeDefined();
        expect(measurements.properties).toBeDefined();
        if (measurements.properties) {
          expect(measurements.properties.weight).toBeDefined();
          expect(measurements.properties.weight.nullable).toBe(true);
        }
      }
    });

    test("should correctly parse discriminator", () => {
      // Read and parse the fixture file
      const advancedYaml = fs.readFileSync(
        path.join(fixturesPath, "advanced-features.yaml"),
        "utf8",
      );
      const advancedContent = yaml.load(advancedYaml);

      // Parse the OpenAPI document
      const result = parseOpenApi(advancedContent);

      // Verify discriminator
      expect(result.components).toBeDefined();
      if (result.components?.schemas) {
        const animal = result.components.schemas.Animal;
        expect(animal).toBeDefined();
        expect(animal.oneOf).toBeDefined();
        expect(animal.oneOf?.length).toBe(3);
        expect(animal.discriminator).toBeDefined();
        if (animal.discriminator) {
          expect(animal.discriminator.propertyName).toBe("type");
          expect(animal.discriminator.mapping).toBeDefined();
          if (animal.discriminator.mapping) {
            expect(animal.discriminator.mapping.dog).toBe(
              "#/components/schemas/Dog",
            );
            expect(animal.discriminator.mapping.cat).toBe(
              "#/components/schemas/Cat",
            );
            expect(animal.discriminator.mapping.bird).toBe(
              "#/components/schemas/Bird",
            );
          }
        }
      }
    });

    test("should correctly parse oneOf, anyOf, and allOf", () => {
      // Read and parse the fixture file
      const advancedYaml = fs.readFileSync(
        path.join(fixturesPath, "advanced-features.yaml"),
        "utf8",
      );
      const advancedContent = yaml.load(advancedYaml);

      // Parse the OpenAPI document
      const result = parseOpenApi(advancedContent);

      // Verify document structure
      expect(result.components).toBeDefined();
      if (result.components?.schemas) {
        // Check oneOf
        const animal = result.components.schemas.Animal;
        expect(animal).toBeDefined();
        expect(animal.oneOf).toBeDefined();
        expect(animal.oneOf?.length).toBe(3);

        // Check anyOf
        const searchResult = result.components.schemas.SearchResult;
        expect(searchResult).toBeDefined();
        expect(searchResult.properties).toBeDefined();
        if (searchResult.properties) {
          expect(searchResult.properties.result).toBeDefined();
          expect(searchResult.properties.result.anyOf).toBeDefined();
          expect(searchResult.properties.result.anyOf?.length).toBe(4);
        }

        // Check allOf
        const dog = result.components.schemas.Dog;
        expect(dog).toBeDefined();
        expect(dog.allOf).toBeDefined();
        expect(dog.allOf?.length).toBe(2);

        const cat = result.components.schemas.Cat;
        expect(cat).toBeDefined();
        expect(cat.allOf).toBeDefined();
        expect(cat.allOf?.length).toBe(2);

        const bird = result.components.schemas.Bird;
        expect(bird).toBeDefined();
        expect(bird.allOf).toBeDefined();
        expect(bird.allOf?.length).toBe(2);
      }
    });
  });
});
