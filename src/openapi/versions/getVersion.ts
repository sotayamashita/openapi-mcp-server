import type { OpenAPIV3, OpenAPIV3_1 } from "@scalar/openapi-types";

/**
 * Supported OpenAPI major/minor versions.
 */
export type SupportedOpenApiVersion = "3.0" | "3.1";

/**
 * Checks if the provided object is a valid OpenAPI schema with an 'openapi' string property.
 * @param schema The object to check.
 * @returns True if valid, false otherwise.
 */
function isValidOpenApiSchema(schema: any): boolean {
  return (
    !!schema && typeof schema === "object" && typeof schema.openapi === "string"
  );
}

/**
 * Checks if the provided OpenAPI schema object has a supported version (3.0.x or 3.1.x).
 * Throws an error if the version is missing, invalid, or unsupported.
 *
 * @param {any} schema - The potentially dereferenced OpenAPI schema object. It should have an 'openapi' property.
 * @throws {Error} If the openapi version string is missing, invalid, or not '3.0.x' or '3.1.x'.
 * @returns {SupportedOpenApiVersion} The detected major.minor version string ("3.0" or "3.1").
 */
export function getVersion(
  schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
): SupportedOpenApiVersion {
  if (!isValidOpenApiSchema(schema)) {
    throw new Error(
      "Invalid OpenAPI schema object or missing 'openapi' version string.",
    );
  }

  const versionString: string = schema.openapi!;

  // Check if the version string matches the expected formats
  if (versionString.startsWith("3.0.")) {
    return "3.0";
  } else if (versionString.startsWith("3.1.")) {
    return "3.1";
  } else {
    // Throw an error for unsupported versions
    throw new Error(
      `Unsupported OpenAPI version: ${versionString}. Only versions 3.0.x and 3.1.x are supported.`,
    );
  }
}
