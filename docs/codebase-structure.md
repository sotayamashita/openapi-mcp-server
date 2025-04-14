# Codebase Structure

The codebase follows a modular organization pattern with clear separation of concerns:

```
src/
├── cli/              # Command-line interface
│   ├── args.ts       # CLI arguments processing
│   └── index.ts      # CLI entry point
├── config/           # Configuration management
│   └── index.ts      # Environment variables and settings
├── mcp/              # MCP protocol implementation
│   ├── server.ts     # MCP server core functionality
│   └── transport.ts  # Transport layer abstraction
├── openapi/          # OpenAPI specification handling
│   ├── client.ts     # OpenAPI client generation
│   ├── parser.ts     # Spec parsing and validation
│   └── schema.ts     # Schema validation and conversion
├── tools/            # MCP tools management
│   ├── builder.ts    # Tool generation from OpenAPI
│   └── executor.ts   # Tool execution and response handling
├── types/            # Type definitions
│   └── index.ts      # Common type declarations
└── index.ts          # Application entry point
```

## Module Responsibilities

- **CLI Module**: Handles command-line arguments and user interaction
- **Config Module**: Manages environment variables (BASE_URL, HEADERS) and configuration validation
- **MCP Module**: Implements the Model Context Protocol server and transport layers
- **OpenAPI Module**: Processes OpenAPI specifications, generates clients, and validates schemas
- **Tools Module**: Converts OpenAPI operations to MCP tools and handles their execution
- **Types Module**: Provides common type definitions across the application

## Proposed OpenAPI 3.0.0 Implementation Structure

For the OpenAPI 3.0.0 implementation, we propose the following directory structure:

```
src/
└── openapi/                     # OpenAPI specification handling
    ├── common/                  # Version-agnostic shared code
    │   └── utils.ts             # Common helper functions
    ├── versions/                # Version-specific implementations
    │   └── 3.0.0/               # OpenAPI 3.0.0 specific implementation
    │       ├── schemas/         # 3.0.0 schema definitions
    │       │   └── processed/   # Processed schema types
    │       │       └── index.ts # Processed schema type definitions
    │       └── parser.ts        # 3.0.0 parser implementation
    ├── schema.ts                # Entry point with version selection logic
    ├── parser.ts                # Version-aware facade forwarding to appropriate parser
    └── client.ts                # Version-independent client implementation
```

### Notes on Implementation Approach:

- OpenAPI 3.1.0 is already implemented in `node_modules/@scalar/openapi-types/dist/schemas/3.1/processed` and will be used directly
- The new 3.0.0 implementation will mirror the structure of the 3.1.0 implementation
- The schema.ts entry point will detect version and route to either:
  - The custom 3.0.0 implementation for OpenAPI 3.0.0 documents
  - The existing `@scalar/openapi-types` implementation for 3.1.0 documents
- This approach ensures clean separation while leveraging existing code

### Benefits of this structure:

- Clear separation of version-specific implementations
- Prevents duplication by leveraging existing 3.1.0 implementation
- Centralizes version selection logic
- Easily extensible for future OpenAPI versions
- Maintains backward compatibility with existing code
