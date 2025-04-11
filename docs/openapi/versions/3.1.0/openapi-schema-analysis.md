# @scalar/openapi-types/dist/schemas/3.1/processed Analysis

## 1. Directory Structure and File Composition

The directory contains the following types of files:

```mermaid
graph TD
    A[index.d.ts / index.js] --> B[Object Definition Files]
    B --> C[*.d.ts files]
    B --> D[*.js files]
    B --> E[*.d.ts.map files]

    C --> C1[OpenAPI Core Objects]
    C --> C2[Component Objects]
    C --> C3[Path and Operation Objects]
    C --> C4[Schema Objects]
    C --> C5[Security Objects]
    C --> C6[Other Supporting Objects]

    C1 --> OpenAPI[openapi-object.d.ts]
    C1 --> Info[info-object.d.ts]
    C2 --> Components[components-object.d.ts]
    C3 --> Paths[paths-object.d.ts]
    C3 --> PathItem[path-item-object.d.ts]
    C3 --> Operation[operation-object.d.ts]
    C4 --> Schema[schema-object.d.ts]
    C5 --> Security[security-scheme-object.d.ts]
    C6 --> Server[server-object.d.ts]
    C6 --> Tag[tag-object.d.ts]
```

Files follow these naming patterns:

- `xxx-object.d.ts`: TypeScript type definitions
- `xxx-object.js`: Implementation files
- `xxx-object.d.ts.map`: Source map files

## 2. Definition of Main Schema Objects

All schema objects are defined using the [Zod](https://github.com/colinhacks/zod) library.

```mermaid
graph TD
    A[OpenAPI Object Hierarchy] --> B[OpenApiObjectSchema]
    B --> C[InfoObjectSchema]
    B --> D[PathsObjectSchema]
    B --> E[ComponentsObjectSchema]
    B --> F[Other Objects]

    E --> E1[schemas]
    E --> E2[responses]
    E --> E3[parameters]
    E --> E4[requestBodies]
    E --> E5[Other Components]

    D --> D1[path definitions]
    D1 --> D2[PathItemObjectSchema]
    D2 --> D3[OperationObjectSchema]
    D3 --> D4[Parameters/Request/Response]
```

Example of schema object definition (OpenApiObjectSchema):

```typescript
// Type definition
type OpenApiObject = {
  openapi: string;
  info: z.infer<typeof InfoObjectSchema>;
  jsonSchemaDialect?: string;
  servers?: z.infer<typeof ServerObjectSchema>[];
  paths?: z.infer<typeof PathsObjectSchema>;
  // ...other properties
};

// Zod schema
const OpenApiObjectSchema = z
  .object({
    openapi: z.string().regex(/^3\.1\.\d+$/),
    info: InfoObjectSchema,
    // ...other property definitions
  })
  .passthrough();
```

Key features of SchemaObjectSchema (JSON Schema + OpenAPI extensions):

- JSON Schema standard fields (type, format, properties, items, etc.)
- OpenAPI-specific extensions (example, readOnly, writeOnly, etc.)
- Recursive type definitions (using z.lazy())
- Composition (allOf, oneOf, anyOf)

## 3. Import Structure and Module Division

```mermaid
graph TD
    A[index.js / index.d.ts] --> B[Entry Point]
    B --> C[Exports All Schemas]

    D[Each Schema File] --> E[Imports Dependent Schemas]
    E --> F[z.lazy for Circular References]

    G[Hierarchical Structure] --> H[Top Level: OpenApiObjectSchema]
    H --> I[Lower Level: Component Schemas]
    I --> J[Lowest Level: Primitive Types]
```

Key points about module division:

1. Each object is defined in a dedicated file (following the single responsibility principle)
2. Interdependent objects are imported as needed
3. All objects are exported from index.js, allowing package users to access them through this entry point
4. Circular references are resolved using `z.lazy(() => SomeSchema)`
5. Complex objects (e.g., path-item-object) are divided into multiple files as needed (e.g., path-item-object-without-callbacks.js)

Example of key imports:

```typescript
// OpenAPI object
import { z } from "zod";
import { ComponentsObjectSchema } from "./components-object.js";
import { InfoObjectSchema } from "./info-object.js";
// ...other imports

// Components object
import { z } from "zod";
import { SchemaObjectSchema } from "./schema-object.js";
import { ResponseObjectSchema } from "./response-object.js";
// ...other imports
```

This structure allows for clear separation of each component in the OpenAPI 3.1 specification and enables type-safe schema validation.
