### Starting HTTP Server

```bash
bun examples/openapi/versions/3.0/simple/server.ts
```

### Inspecting locally developed MCP servers

```bash
bunx @modelcontextprotocol/inspector \
    -e BASE_URL=http://localhost:4000 \
    bun src/index.ts --api examples/openapi/versions/3.0/simple/openapi.yml
```
