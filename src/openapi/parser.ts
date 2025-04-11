import { dereference } from "@scalar/openapi-parser";
import { OpenApiObjectSchema as OpenApiObjectSchemaV3_1 } from "@scalar/openapi-types/schemas/3.1/unprocessed";
import type { OpenAPIV3_1 } from "openapi-types";
import { validateSchema } from "./schema";

/**
 * Loads, parses and validates an OpenAPI specification
 * @param specPath Path or URL to the OpenAPI specification
 * @returns Parsed and validated OpenAPI schema
 * @throws When loading or parsing fails
 */
export async function loadOpenApiSpec(
  specPath: string,
): Promise<OpenAPIV3_1.Document> {
  if (!specPath) {
    throw new Error("OpenAPI specification path cannot be empty");
  }

  let text: string;
  try {
    // Determine if URL or file path and load accordingly
    if (/^https?:\/\//.test(specPath)) {
      const response = await fetch(specPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }
      text = await response.text();
    } else {
      const file = Bun.file(specPath);
      text = await file.text();
    }

    // Parse and dereference schema
    const { schema } = await dereference(text);

    // Validate schema
    let validatedSchema: any = schema;
    try {
      validatedSchema = OpenApiObjectSchemaV3_1.parse(schema);
    } catch (error) {
      console.error("OpenAPI schema parsing warnings:", error);
      // Continue with the original schema
    }

    // Validate and generate alternative operation IDs
    const { valid, errors, alternativeIds } =
      await validateSchema(validatedSchema);

    if (!valid) {
      console.warn("OpenAPI schema validation warnings:", errors);
    }

    // Apply alternative operation IDs
    if (validatedSchema.paths && Object.keys(alternativeIds).length > 0) {
      for (const [path, pathItem] of Object.entries(validatedSchema.paths)) {
        for (const [method, operation] of Object.entries(pathItem || {})) {
          if (
            typeof operation === "object" &&
            operation !== null &&
            ![
              "$ref",
              "summary",
              "description",
              "servers",
              "parameters",
            ].includes(method)
          ) {
            // OpenAPIのオペレーションオブジェクトとして扱う
            const opObj = operation as { operationId?: string };

            if (!opObj.operationId) {
              const operationKey = `${method.toUpperCase()} ${path}`;
              if (alternativeIds[operationKey]) {
                console.info(
                  `Adding generated operationId: ${alternativeIds[operationKey]} for ${operationKey}`,
                );
                opObj.operationId = alternativeIds[operationKey];
              }
            }
          }
        }
      }
    }

    return validatedSchema as OpenAPIV3_1.Document;
  } catch (error: any) {
    throw new Error(`Failed to parse OpenAPI spec: ${error.message}`);
  }
}
