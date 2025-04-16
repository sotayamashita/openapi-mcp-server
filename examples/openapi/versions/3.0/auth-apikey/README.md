### Starting HTTP Server

```bash
bun examples/openapi/versions/3.0/auth-apikey/server.ts

curl -H "x-api-key: admin-api-key" http://localhost:4000/api-resources
```

### Inspecting locally developed MCP servers

```bash
bunx @modelcontextprotocol/inspector \
    -e BASE_URL=http://localhost:4000 \
    -e HEADERS='{"X-API-Key":"admin-api-key"}' \
    bun src/index.ts --api examples/openapi/versions/3.0/auth-apikey/openapi.yml
```
