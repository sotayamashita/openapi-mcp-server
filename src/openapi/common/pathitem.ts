/**
 * Returns an array of operationIds for valid HTTP methods in a PathItemObject.
 * Only HTTP methods defined by OpenAPI are considered.
 *
 * @param pathItem - The OpenAPI PathItemObject
 * @returns Array of operationIds (string or undefined)
 */
export const OPENAPI_HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

export function getOperationIdsFromPathItem(
  pathItem: any,
): Array<string | undefined> {
  const ids: Array<string | undefined> = [];
  for (const method of OPENAPI_HTTP_METHODS) {
    const operation = pathItem[method];
    if (!operation) continue;
    ids.push((operation as any).operationId);
  }
  return ids;
}
