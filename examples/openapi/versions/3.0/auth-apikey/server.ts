#!/usr/bin/env bun

import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { cors } from "@elysiajs/cors";

type ApiResource = {
  id: string;
  name: string;
  description?: string;
  type: "public" | "private" | "restricted";
  accessLevel: number;
  createdAt: string;
};

// Sample API resources
const apiResources: ApiResource[] = [
  {
    id: uuidv4(),
    name: "Weather API",
    description: "Current and forecast weather data",
    type: "public",
    accessLevel: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "User Management API",
    description: "API for user registration and management",
    type: "private",
    accessLevel: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Payment Processing API",
    description: "Secure payment processing endpoints",
    type: "restricted",
    accessLevel: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Analytics API",
    description: "Real-time analytics data",
    type: "private",
    accessLevel: 7,
    createdAt: new Date().toISOString(),
  },
];

// Valid API keys with their associated access levels
// In a real application, this would be stored in a secure database
const API_KEYS = {
  "public-api-key": { accessLevel: 1 },
  "developer-api-key": { accessLevel: 5 },
  "admin-api-key": { accessLevel: 10 },
};

// API key middleware
const validateApiKey = (context: { request: Request }) => {
  const apiKey = context.request.headers.get("X-API-KEY");

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const keyInfo = API_KEYS[apiKey as keyof typeof API_KEYS];

  if (!keyInfo) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { success: true, accessLevel: keyInfo.accessLevel };
};

const app = new Elysia()
  .use(cors())
  .get("/api-resources", ({ request }) => {
    // Validate API key
    const validation = validateApiKey({ request });

    if (validation instanceof Response) {
      return validation;
    }

    // Filter resources based on access level
    const accessibleResources = apiResources.filter(
      (resource) => resource.accessLevel <= validation.accessLevel,
    );

    return accessibleResources;
  })
  .listen(4000);

console.log(
  `🦊 API Key Auth server is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log("Available API keys:");
Object.entries(API_KEYS).forEach(([key, info]) => {
  console.log(`- ${key} (Access Level: ${info.accessLevel})`);
});
