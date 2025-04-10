# openapi-mcp-server

[![MCP Server](https://badge.mcpx.dev?type=server "MCP Server")](https://modelcontextprotocol.io/introduction) [![Test](https://github.com/sotayamashita/openapi-mcp-server/actions/workflows/test.yml/badge.svg)](https://github.com/sotayamashita/openapi-mcp-server/actions/workflows/test.yml) ![ts](https://badgen.net/badge/-/TypeScript/blue?icon=typescript&label) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Features

🔌 **OpenAPI Integration** - Automatically converts OpenAPI/Swagger specifications into MCP tools  
🧩 **Parameter Validation** - Automatically validates API parameters using Zod

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
      ]
    }
  }
}
```

[🔍 _Comprehensive Guide: How to Use MCP Server with Claude Desktop | Model Context Protocol_](https://modelcontextprotocol.io/quickstart/user)
