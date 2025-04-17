# @openapi-mcp/server

[![MCP Server](https://badge.mcpx.dev?type=server "MCP Server")](https://modelcontextprotocol.io/introduction) [![npm version](https://badge.fury.io/js/@openapi-mcp%2Fserver.svg?icon=si%3Anpm)](https://badge.fury.io/js/@openapi-mcp%2Fserver) [![Test](https://github.com/sotayamashita/openapi-mcp-server/actions/workflows/test.yml/badge.svg)](https://github.com/sotayamashita/openapi-mcp-server/actions/workflows/test.yml) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The openapi-mcp-server is a powerful bridge between OpenAPI specifications and AI assistants using the Model Context Protocol (MCP). It automatically converts any OpenAPI/Swagger API specification into MCP tools that can be used by AI assistants like Claude Desktop. This enables AI assistants to seamlessly interact with your APIs, making them capable of performing real-world actions through your services without requiring custom integrations.

## Features

> **⚠️ Note:**
> This server **requires** every operation in your OpenAPI/Swagger specification to have an `operationId`. If any operation is missing an `operationId`, the server will fail to start or process the specification. Always ensure that all operations are explicitly assigned a unique and descriptive `operationId`.

- 🔌 **OpenAPI Integration**
  - Automatically converts OpenAPI/Swagger specifications into MCP tools
- 📚 **Multiple OpenAPI Versions**
  - Support for OpenAPI v3.0.0 and v3.1.0
- 🔐 **Authentication Support**:
  - HTTP authentication schemes:
    - Basic authentication
    - Bearer token authentication (static tokens, e.g., Personal Access Tokens)
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
- [ ] Dynamic JWT authentication (login-generated tokens) is not supported

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

## Best Practices

### OpenAPI/Swagger Specifications

#### Use Descriptive `operationId` Fields

The `operationId` field in your OpenAPI/Swagger specification plays a crucial role in how tools are presented to AI assistants. When converting your API to MCP tools:

- **Tool Naming**: The `operationId` is used directly as the MCP tool name
- **Clarity**: Descriptive `operationId` values make it easier for AI assistants to understand and use your API
- **Consistency**: Use a consistent naming pattern (e.g., `getUser`, `createUser`, `updateUserPassword`)

Example of a well-defined operation:

```yaml
paths:
  /users/{userId}:
    get:
      operationId: getUserById
      summary: Retrieve user information
      description: Returns detailed information about a specific user
```

#### Include Detailed Operation Descriptions

The `description` field for each operation is equally important:

- **Tool Selection**: AI assistants use this description to determine which tool is appropriate for a given task
- **Understanding**: Comprehensive descriptions help the AI understand exactly what the operation does
- **Context**: Include information about parameters, expected responses, and potential errors

Example of a well-described operation:

```yaml
paths:
  /users:
    post:
      operationId: createUser
      summary: Create a new user account
      description: |
        Creates a new user in the system. Requires a unique email address and a 
        password that meets security requirements (min 8 chars, including uppercase, 
        lowercase, number). Returns the created user object with an assigned user ID.
```

Without thorough descriptions, AI assistants may struggle to identify the right operations for user requests or may use them incorrectly. The quality of your API descriptions directly impacts how effectively AI can leverage your tools.

## Development

### Development Commands

```bash
# Run tests
bun vitest run

# Run tests with watch mode
bun vitest

# Run tests with coverage
bun vitest run --coverage

# Format code
bun prettier . --write
```

### Manual Release Process (Using Release Branch)

This section outlines the manual steps for creating a new release using a dedicated release branch. This method helps isolate the release process from the `main` branch until publication.

**Prerequisites:**

- All changes intended for the release have been merged into the `main` branch.
- You are logged into your npm account (`npm login`).
- Changesets CLI is accessible (this guide uses `bunx`).

**Steps:**

1.  **Ensure `main` is up-to-date:**

    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Create a release branch:** Name it according to the version you intend to release (e.g., `v0.1.0`).

    ```bash
    git checkout -b release/vX.Y.Z main
    ```

    Replace `vX.Y.Z` with the target version.

3.  **Bump versions and update Changelog:** This command consumes the changeset files (in `.changeset/`), updates the version in `package.json`, and updates `CHANGELOG.md`.

    ```bash
    bunx @changesets/cli version
    ```

    Review the changes applied to `package.json` and `CHANGELOG.md` to ensure they are correct.

4.  **Commit the versioning changes:**

    ```bash
    git add .
    git commit -m "chore: update versions and changelogs for vX.Y.Z"
    ```

    Replace `vX.Y.Z` with the target version.

5.  **Build the project:** Ensure the distribution files are generated with the latest changes.

    ```bash
    bun run build
    ```

6.  **Publish to npm:** Publish the new version to the npm registry.

    ```bash
    npm publish
    ```

    _Ensure your `package.json` includes `"publishConfig": { "access": "public" }` for scoped public packages._
    _(You might also use `bun publish`, but confirm its behavior with scoped public packages if you choose this.)_

7.  **Tag the release in Git:** Create a Git tag that matches the version published to npm.

    ```bash
    # Replace X.Y.Z with the actual version number, e.g., 0.1.0
    git tag @openapi-mcp/server@X.Y.Z
    ```

8.  **Merge the release branch back into `main`:** This brings the version bump and CHANGELOG updates into your main branch.

    ```bash
    git checkout main
    git merge --no-ff release/vX.Y.Z
    ```

    _(Using `--no-ff` creates a merge commit, which can help in tracking releases in the Git history)._

9.  **Push `main` and the new tag to the remote repository:**

    ```bash
    git push origin main --tags
    ```

10. **(Optional) Clean up:** Delete the release branch locally and remotely if it's no longer needed.
    ```bash
    git branch -d release/vX.Y.Z
    git push origin --delete release/vX.Y.Z
    ```

For more detailed information on using Changesets, refer to the [official Changesets documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md).
