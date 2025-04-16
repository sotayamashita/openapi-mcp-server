### Starting HTTP Server

```bash
bun examples/openapi/versions/3.0/complex-refs/server.ts

curl http://localhost:4000/products
```

### Inspecting locally developed MCP servers

```bash
bunx @modelcontextprotocol/inspector \
    -e BASE_URL=http://localhost:4000 \
    bun src/index.ts --api examples/openapi/versions/3.0/complex-refs/openapi.yml
```
