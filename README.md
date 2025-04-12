# openapi-mcp-server

[![MCP Server](https://badge.mcpx.dev?type=server "MCP Server")](https://modelcontextprotocol.io/introduction) [![Test](https://github.com/sotayamashita/openapi-mcp-server/actions/workflows/test.yml/badge.svg)](https://github.com/sotayamashita/openapi-mcp-server/actions/workflows/test.yml) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The openapi-mcp-server is a powerful bridge between OpenAPI specifications and AI assistants using the Model Context Protocol (MCP). It automatically converts any OpenAPI/Swagger API specification into MCP tools that can be used by AI assistants like Claude Desktop. This enables AI assistants to seamlessly interact with your APIs, making them capable of performing real-world actions through your services without requiring custom integrations.

## Features

🔌 **OpenAPI Integration**

- Automatically converts OpenAPI/Swagger specifications into MCP tools

🧩 **Parameter Validation**

- Automatically validates API parameters using Zod

📚 **Multiple OpenAPI Versions**

- Support for OpenAPI v3.0.0 and v3.1.0

🔐 **Authentication Support**:

- HTTP authentication schemes:
  - Basic authentication
  - Bearer token authentication (JWT)
  - Other HTTP schemes as defined by [RFC 7235](https://tools.ietf.org/html/rfc7235)
- API keys:
  - Header-based API keys

## Limitations

⚠️ **Version Support**:

- [ ] OpenAPI v2.0 (Swagger) is not currently supported

⚠️ **Authentication Limitations**:

- [ ] OAuth 2.0 authentication is not supported
- [ ] OpenID Connect Discovery is not supported
- [ ] Query parameter-based API keys are not supported
- [ ] Cookie-based authentication is not supported

## Installation

```bash
# Clone the repository
git clone https://github.com/sotayamashita/openapi-mcp-server.git
cd openapi-mcp-server

# Install dependencies
bun install
```

## Usage

You can run the server by providing an OpenAPI specification URL or file path:

```bash
# Using a local file
bun run src/index.ts ./path/to/openapi.yml

# Using a URL
bun run src/index.ts --api https://example.com/api-spec.json
```

## Configuration

### Environment Variables

- **`BASE_URL`**

  - Required: Yes
  - Description: API endpoint. [Server Object](https://swagger.io/specification#server-object)'s URL

- **`HEADERS`**
  - Required: No
  - Default: `{"Content-Type": "application/json","User-Agent": "openapi-mcp-server"}`
  - Description: Custom headers that will overwrite default headers

### Claude Desktop Integration

To use this MCP server with Claude Desktop:

1. Open your Claude Desktop configuration file:

   ```bash
   # macOS/Linux
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Add the following configuration:
   ```json
   {
     "mcpServer": {
       "openapi-mcp-server": {
         "command": "bun",
         "args": [
           "/path/to/openapi-mcp-server/src/index.ts",
           "/path/to/openapi-mcp-server/demo/openapi.yml"
         ],
         "env": {
           "BASE_URL": "https://api.example.com/v1/",
           "HEADERS": "{\"Authorization\": \"Bearer ****\"}"
         }
       }
     }
   }
   ```

For more detailed instructions, see the [MCP quickstart guide](https://modelcontextprotocol.io/quickstart/user).

### Cursor Integration

To use this MCP server with Cursor as Global:

1. Open Cursor
2. Open Cursor Settings > MCP
3. Click "+ Add new global MCP Server"
4. Add the following configuration:
   ```json
   {
     "mcpServer": {
       "openapi-mcp-server": {
         "command": "bun",
         "args": [
           "/path/to/openapi-mcp-server/src/index.ts",
           "/path/to/openapi-mcp-server/demo/openapi.yml"
         ],
         "env": {
           "BASE_URL": "https://api.example.com/v1/",
           "HEADERS": "{\"Authorization\": \"Bearer ****\"}"
         }
       }
     }
   }
   ```

For more detailed instructions, see the [Cursor's Model Context Protocol](https://docs.cursor.com/context/model-context-protocol#mcp-resources).

## Development

### Development Commands

```bash
# Run simple api server for test using simple demo/openapi.yml
bun start:server

# Run @modelcontextprotocol/inspector
bun start:inspector

# Run simple api server and @modelcontextprotocol/inspector concurrently
bun start

# Run tests
bun test

# Run tests with watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Format code
bun run format
```

### Codebase Structure

For details on the codebase structure and module responsibilities, see [Codebase Structure](./docs/codebase-structure.md).
