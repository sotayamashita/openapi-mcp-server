import { describe, test, expect } from "bun:test";
import {
  OpenApiObjectSchema,
  InfoSchema,
  ContactSchema,
  LicenseSchema,
  ServerSchema,
  TagSchema,
  ExternalDocumentationSchema,
  SecurityRequirementSchema,
} from "../../../../../src/openapi/versions/3.0.0/schemas/processed";

describe("OpenAPI 3.0.0 Basic Schemas", () => {
  describe("Contact Schema", () => {
    test("should validate valid contact object", () => {
      const validContact = {
        name: "API Support",
        url: "https://example.com/support",
        email: "support@example.com",
      };

      const result = ContactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    test("should validate with only optional fields", () => {
      const minimalContact = {
        name: "API Support",
      };

      const result = ContactSchema.safeParse(minimalContact);
      expect(result.success).toBe(true);
    });

    test("should fail with invalid email", () => {
      const invalidContact = {
        name: "API Support",
        email: "not-an-email",
      };

      const result = ContactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });
  });

  describe("License Schema", () => {
    test("should validate valid license object", () => {
      const validLicense = {
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      };

      const result = LicenseSchema.safeParse(validLicense);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalLicense = {
        name: "Apache 2.0",
      };

      const result = LicenseSchema.safeParse(minimalLicense);
      expect(result.success).toBe(true);
    });

    test("should fail with missing name", () => {
      const invalidLicense = {
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      };

      const result = LicenseSchema.safeParse(invalidLicense);
      expect(result.success).toBe(false);
    });
  });

  describe("Info Schema", () => {
    test("should validate valid info object", () => {
      const validInfo = {
        title: "Sample API",
        version: "1.0.0",
        description: "A sample API",
        termsOfService: "https://example.com/terms/",
        contact: {
          name: "API Support",
          url: "https://example.com/support",
          email: "support@example.com",
        },
        license: {
          name: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.html",
        },
      };

      const result = InfoSchema.safeParse(validInfo);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalInfo = {
        title: "Sample API",
        version: "1.0.0",
      };

      const result = InfoSchema.safeParse(minimalInfo);
      expect(result.success).toBe(true);
    });

    test("should fail with missing title", () => {
      const invalidInfo = {
        version: "1.0.0",
      };

      const result = InfoSchema.safeParse(invalidInfo);
      expect(result.success).toBe(false);
    });
  });

  describe("Server Schema", () => {
    test("should validate valid server object", () => {
      const validServer = {
        url: "https://api.example.com/v1",
        description: "Production server",
        variables: {
          port: {
            default: "8443",
            enum: ["8443", "443"],
            description: "The port",
          },
        },
      };

      const result = ServerSchema.safeParse(validServer);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalServer = {
        url: "https://api.example.com/v1",
      };

      const result = ServerSchema.safeParse(minimalServer);
      expect(result.success).toBe(true);
    });
  });

  describe("External Documentation Schema", () => {
    test("should validate valid external docs object", () => {
      const validExternalDocs = {
        url: "https://example.com/docs",
        description: "Find more info here",
      };

      const result = ExternalDocumentationSchema.safeParse(validExternalDocs);
      expect(result.success).toBe(true);
    });

    test("should validate with only required fields", () => {
      const minimalExternalDocs = {
        url: "https://example.com/docs",
      };

      const result = ExternalDocumentationSchema.safeParse(minimalExternalDocs);
      expect(result.success).toBe(true);
    });
  });

  // 基本的なOpenAPIオブジェクトテスト
  describe("OpenAPI Schema", () => {
    test("should validate minimal valid OpenAPI object", () => {
      const minimalOpenApi = {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = OpenApiObjectSchema.safeParse(minimalOpenApi);
      expect(result.success).toBe(true);
    });

    test("should fail with invalid openapi version", () => {
      const invalidOpenApi = {
        openapi: "2.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = OpenApiObjectSchema.safeParse(invalidOpenApi);
      expect(result.success).toBe(false);
    });
  });
});
