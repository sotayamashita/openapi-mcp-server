### Starting HTTP Server

```bash
bun examples/openapi/versions/3.0/auth-basic/server.ts

curl -H "Authorization: Basic $(echo -n admin:password | base64)" http://localhost:4000/secure-resources
```

### Inspecting locally developed MCP servers

```bash
bunx @modelcontextprotocol/inspector \
    -e BASE_URL=http://localhost:4000 \
    -e HEADERS="{\"Authorization\":\"Basic $(echo -n admin:password | base64)\"}" \
    bun src/index.ts --api examples/openapi/versions/3.0/auth-basic/openapi.yml
```
