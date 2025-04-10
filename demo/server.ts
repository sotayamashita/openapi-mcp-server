#!/usr/bin/env bun
/**
 * Simple API Server
 * Minimal server implementing OpenAPI definition
 */

const server = Bun.serve({
  port: 1234,

  // `routes` requires Bun v1.2.3+
  routes: {
    // GET /hello endpoint
    "/hello": {
      GET: () => {
        console.log("Call /hello");
        return Response.json({ message: "Hello world" });
      },
    },
  },

  // (optional) fallback for unmatched routes:
  // Required if Bun's version < 1.2.3
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server is running on ${server.url}`);
