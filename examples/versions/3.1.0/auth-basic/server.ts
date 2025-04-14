#!/usr/bin/env bun

import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { cors } from "@elysiajs/cors";

type SecureResource = {
  id: string;
  name: string;
  description?: string | null;
  confidentialData: string;
  createdAt: string;
};

// Sample secure resources
const secureResources: SecureResource[] = [
  {
    id: uuidv4(),
    name: "Confidential Report A",
    description: "Quarterly financial report",
    confidentialData: "Financial projections for Q3 2023",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Project X Documents",
    description: "Secret project documentation",
    confidentialData: "New product launch details",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "HR Records",
    description: null,
    confidentialData: "Salary information for executives",
    createdAt: new Date().toISOString(),
  },
];

// Valid credentials (in a real application, these would be stored securely)
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "password";

// Basic authentication middleware
const basicAuth = (context: { request: Request }) => {
  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }

  // Extract and decode the credentials
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(":");

  // Validate credentials
  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return new Response("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }

  // Authentication successful, continue to the handler
  return;
};

const app = new Elysia()
  .use(cors())
  .get("/secure-resources", ({ request }) => {
    // Apply basic authentication
    const authResult = basicAuth({ request });
    if (authResult) return authResult;

    return secureResources;
  })
  .listen(3103);

console.log(
  `🦊 Basic Auth API server (OpenAPI 3.1.0) is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `Use username: ${VALID_USERNAME} and password: ${VALID_PASSWORD} to authenticate`
);
