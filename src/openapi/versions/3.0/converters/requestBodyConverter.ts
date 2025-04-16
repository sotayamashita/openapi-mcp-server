import type { ZodTypeAny } from "zod";
import type { OpenAPIV3 } from "@scalar/openapi-types";
import { convertOpenAPISchemaToZod } from "./schemaConverter";

/**
 * Generate Zod type from content object
 * @param content OpenAPI content (map of media types)
 * @param required Whether the request body is required
 * @returns Converted Zod type, null if no content
 */
function processContentObject(
  content: Record<string, OpenAPIV3.MediaTypeObject> | undefined,
  required: boolean = false,
): ZodTypeAny | null {
  if (!content) return null;

  // Prefer JSON, otherwise use first media type
  const mediaType = content["application/json"] || Object.values(content)[0];

  if (!mediaType || !mediaType.schema) return null;

  const bodySchema = convertOpenAPISchemaToZod(
    mediaType.schema as OpenAPIV3.SchemaObject,
  );
  return required ? bodySchema : bodySchema.optional();
}

/**
 * Convert request body to Zod type
 * @param requestBody Request body object
 * @returns Converted Zod type, null if no request body
 */
export function convertRequestBodyToZod(
  requestBody:
    | OpenAPIV3.RequestBodyObject
    | OpenAPIV3.ReferenceObject
    | undefined,
): ZodTypeAny | null {
  // If no request body or it's a Reference object
  if (!requestBody || !("content" in requestBody)) return null;

  const requestBodyObj = requestBody as OpenAPIV3.RequestBodyObject;
  const required = requestBodyObj.required === true;

  return processContentObject(requestBodyObj.content, required);
}
