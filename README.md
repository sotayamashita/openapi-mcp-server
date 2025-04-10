# openapi-mcp-server

## Installation

### Running on Claude Desktop

To use an MCP server with Claude Desktop, add it to your configuration:

```bash
# macOS/Linux
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

```json
{
  "mcpServer": {
    "openapi-mcp-server": {
      "command": "bun",
      "args": [
        "/aboopenapi-mcp-server/src/index.ts",
        // OpenAPI/Swagger spec URL or absolute file path
        "/aboopenapi-mcp-server/demo/openapi.yml"
      ],
      "env": {
        "BASE_URL": "http://localhost:3000",
        "HEADERS": "{\"Authorization\": \"Bearer token_****\"}"
      }
    }
  }
}
```

_[🔍 Comprehensive Guide: How to Use MCP Server with Claude Desktop | Model Context Protocol](https://modelcontextprotocol.io/quickstart/user)_
