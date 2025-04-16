### Starting HTTP Server

```bash
bun examples/openapi/versions/3.0/auth-bearer/server.ts

curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

curl -X GET http://localhost:4000/protected-data \
  -H "Authorization: Bearer {your token}"
```

### Inspecting locally developed MCP servers

```bash
bunx @modelcontextprotocol/inspector \
    -e BASE_URL=http://localhost:4000 \
    -e HEADERS='{"X-API-Key":"admin-api-key"}' \
    bun src/index.ts --api examples/openapi/versions/3.0/auth-apikey/openapi.yml
```
