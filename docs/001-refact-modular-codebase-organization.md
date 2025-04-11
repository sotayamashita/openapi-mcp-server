# 001-refact-modular-codebase-organization

## Overview.

The purpose of this refactoring plan is to reorganize the `openapi-mcp-server` codebase to create a more robust, maintainable, and testable architecture. The current single file ([`src/index.ts`](https://github.com/sotayamashita/openapi-mcp-server/blob/0b085927942bbdbba97ac5a266798ad5c811a80d/src/index.ts)) has multiple responsibilities, which will be broken down appropriately by function to improve code readability and maintainability.

## Purpose

1. **Clear separation of responsibilities**: design each module to have a single responsibility 2.**Improve code reusability**: Eliminate duplicate code and increase reusability through appropriate abstraction
2. **Increased testability**: structure each module to be independently testable 4.**Error Handling Enhancements**: Implement robust error handling and validation 5.**Increased extensibility**: structure allows for easy addition and modification of future functionality

## Implementation Status

- [x] **CLI Module**.

  - [x] `src/cli/args.ts`: Implement command line argument handling.
  - [x] `src/cli/index.ts`: implementation of CLI entry points
  - [x] Tests: `tests/cli/args.test.ts` implementation
  - [x] Using CLI modules from `src/index.ts`.

- [x] **Config module**.

  - [x] `src/config/index.ts`: implementation of configuration management
    - [x] Reading and validating environment variables (BASE_URL, HEADERS)
    - [x] Design to require the BASE_URL environment variable and always use it regardless of the servers information in the OpenAPI spec.
    - [x] JSON parsing of HEADERS and provision of appropriate default values.
  - [x] Testing: implementation of `tests/config/index.test.ts`.
    - [x] Test cases with various environment variable patterns
    - [x] Test error cases.

- [x] **MCP Module**.

  - [x] `src/mcp/server.ts`: implementation of MCP server core functionality
    - [x] Initialize and configure the MCP server.
    - [x] Client Connection Management
    - [x] Tool registration and execution
    - [x] Ensure protocol compliance.
  - [x] `src/mcp/transport.ts`: Transport layer implementation.
  - [x] `src/mcp/index.ts`: Module export configuration
  - [x] tests: test implementation for MCP modules.
    - [x] `tests/mcp/server.test.ts`: Test server functions.
    - [x] `tests/mcp/transport.test.ts`: Test transport.
    - [x] `tests/mcp/index.test.ts`: Module integration tests

- [x] **OpenAPI module**.

  - [x] `src/openapi/client.ts`: implementation of client creation and management
    - [x] BASE_URL obtained from Config module is used when generating OpenAPIClient.
    - [x] Apply HEADERS retrieved from Config module to client configuration.
  - [x] `src/openapi/parser.ts`: implementation of spec parsing
    - [x] Read OpenAPI specs from a file or URL.
    - [x] Schema validation and normalization.
    - [x] Automatic generation of operationId if it does not exist.
  - [x] `src/openapi/schema.ts`: implementation of schema validation
    - [x] Schema validation functionality.
    - [x] Conversion of parameter schema to Zod format.
    - [x] operationId validation and alternate ID generation
  - [x] Testing: Test implementation for OpenAPI modules.
    - [x] `tests/openapi/schema.test.ts`: test schema-related functions.
    - [x] `tests/openapi/parser.test.ts`: Test for parser-related functions.
    - [x] `tests/openapi/client.test.ts`: Test client-related functions.

- [x] **Tools module**.

  - [x] `src/tools/builder.ts`: implement tool generation logic.
    - [x] Conversion logic from OpenAPI schema to MCP tools.
    - [x] MCP tool generation linking Config module and OpenAPI module.
  - [x] `src/tools/executor.ts`: implementation of the tool execution process.
    - [x] Use Config.baseUrl instead of OpenAPI spec servers when constructing request URLs.
    - [x] Proper handling and validation of parameters.
    - [x] Formatting of tool execution results.
  - [x] Testing: Test implementation of the Tools module.
    - [x] `tests/tools/builder.test.ts`: Test tool generation functionality.
    - [x] `tests/tools/executor.test.ts`: Testing the tool execution functionality.

- [ ] ~~**Utils module**~~.

  - [ ] ~~`src/utils/http.ts`: implementation of HTTP related utilities~~.
  - [ ] ~~`src/utils/validation.ts`: implementation of validation helpers~~
  - [ ] ~~Test: Test implementation of the Utils module~~.
  - [x] Not necessary to implement at this stage.

- [x] **Types module**.
  - [x] `src/types/index.ts`: implementation of common type definitions
    - [x] Tool-related type definitions (ToolExecutor, ToolResponse, ToolContentItem)
    - [x] OpenAPI related type definitions (Parameter, Operation)
    - [x] Ensure type compatibility with MCP SDK

## Proposed directory structure.

```
src/
├── cli/
│   ├── args.ts       # Handling of command line arguments
│   └── index.ts      # CLI entry points
├── config/
│   └── index.ts      # Configuration management (environment variables, etc.)
├── mcp/
│   ├── server.ts     # Core MCP server functions
│   └── transport.ts  # Transport layer abstraction
├── openapi/
│   ├── client.ts     # OpenAPI client generation and management
│   ├── parser.ts     # Parsing OpenAPI specs
│   └── schema.ts     # Schema verification and parsing
├── tools/
│   ├── builder.ts    # MCP tool generation logic
│   └── executor.ts   # Tool execution and result handling
├── utils/
│   ├── http.ts       # HTTP related utilities
│   └── validation.ts # Validation helper
├── types/
│   └── index.ts      # type definitions
└── index.ts           # application entry points
```

## Responsibilities for each directory

### 1. `cli/`

- `args.ts`: Process, parse and validate command line arguments
- `index.ts`: CLI entry point, manage user input and output ### 2.

### 2. `config/`

- `index.ts`: read environment variables and manage settings
  - BASE_URL: Specify API endpoint (required)
  - HEADERS: Specify custom HTTP headers (optional, in JSON format)
  - Configuration validation and provision of default values

### 3. `mcp/`.

- `server.ts`: initialize and manage MCP servers
  - Lifecycle management of MCP servers (initialization, connection, termination)
  - Provide registration interface for tools, resources, and prompts
  - Message routing and handling
- `transport.ts`: Communication layer abstraction (e.g. StdioServerTransport)
  - Abstraction of different communication methods (stdio, HTTP/SSE, etc.)
  - Implementation of bi-directional communication with clients.

### 4. `openapi/`

- `client.ts`: Create and manage OpenAPI clients
  - Client configuration using the BASE_URL environment variable
  - Custom header configuration using the HEADERS environment variable
- `parser.ts`: Parsing and dereferencing OpenAPI specs
- `schema.ts`: schema validation and conversion

### 5. `tools/`

- `builder.ts`: Logic to generate MCP tools from OpenAPI
  - Conversion from OpenAPI path and operation information to MCP tool definitions
  - Extraction of parameter type definitions and descriptions from schema
  - Tool generation considering environment settings
- `executor.ts`: Tool execution and response processing
  - Request URL construction using BASE_URL environment variable (takes precedence over OpenAPI servers information)
  - Parameter processing and request execution
  - Response conversion to MCP format

### 6.

- `http.ts`: HTTP related utility functions
- `validation.ts`: input validation helpers ### 7.

### 7. `types/`

- `index.ts`: common type definitions ### 8.

## Specific refactoring policy

### Single Responsibility Principle (SRP)

- Split the current single file by function
- Design each module to have a single responsibility
- Clarify dependencies between code and eliminate circular dependencies

### 2. DRY (Don't Repeat Yourself)

- Extract request construction logic into common utilities
- Organize parameter processing into reusable functions
- Commonize overlapping validation logic ### 4.

### 4. Separation of Concerns (SoC)

- Separation of CLI logic from server logic
- Separation of OpenAPI processing and MCP tool generation
- Separation of configuration management and execution logic

### Defensive Programming

- OpenApiSpecPath null/undefined validation
- Proper error handling of API responses
- Enhanced validation and error messages

## Implementation Plan

1. **Phase 1**: Create basic directory structure and split existing code

   - Setup directory structure
   - Implement MCP module
   - Add basic tests 2.

2. **Phase 2**: Enhance error handling and type safety

   - Strengthen validation
   - Improve error handling
   - Improve type definitions 3.

3. **Phase 3**: Improve test coverage and documentation
   - Expand unit testing
   - Add integration tests
   - Update documentation

## Expected Benefits

- **Improved Maintainability**: Clearly separated responsibilities make code easier to understand and modify.
- **Improved Quality**: Fewer bugs due to increased test coverage
- **Increased extensibility**: Easier to add new features
- **Increased development efficiency**: Modules can be developed and tested at a module-by-module level
- **Team development efficiency**: clearer code responsibility facilitates parallel development

## Additional considerations

- **Dependency Injection**: Utilize dependency injection patterns for flexible testing and mocking
- **Logging Enhancements**: Implement appropriate log levels and formats
- **Configuration Flexibility**: Externalize configuration via environment variables and configuration files
  - Proper handling of BASE_URL and HEADERS
  - Prioritize environment variable settings over servers information in OpenAPI specs
- Version control\*\*: API version control and compatibility
- **Performance Optimization**: Implement caching and other optimization techniques as needed

## Inter-module dependencies

### Core dependencies

- **MCP module**: can function independently of other modules

  - Responsible for basic protocol implementation of MCP
  - Provides tool registration interface, but does not depend on specific implementations
  - Focuses purely on MCP protocol implementation, with no knowledge of OpenAPI

- **Tools module**: depends on MCP and OpenAPI modules

  - Convert OpenAPI schema to MCP tools format
  - Register converted tools with MCP server
  - Build requests and process results when tools are executed

- **OpenAPI module**: depends on Config module
  - Client generation using environment variable settings
  - Spec analysis and validation
