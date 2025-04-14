#!/usr/bin/env bun

import { Elysia, t } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";

type LoginCredentials = {
  username: string;
  password: string;
};

type TokenResponse = {
  token: string;
  expiresIn: number;
  tokenType: "Bearer";
};

type ProtectedData = {
  id: string;
  title: string;
  content: string;
  sensitive: boolean;
  createdAt: string;
};

// Sample protected data
const protectedData: ProtectedData[] = [
  {
    id: uuidv4(),
    title: "Strategic Plan 2024",
    content: "Details of the company strategy for the next fiscal year",
    sensitive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Customer Database",
    content: "Comprehensive list of all premium customers",
    sensitive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Product Roadmap",
    content: "Future product development plans and timelines",
    sensitive: false,
    createdAt: new Date().toISOString(),
  },
];

// Valid credentials (in a real application, these would be stored securely)
const VALID_USERS = [
  { username: "admin", password: "admin123", roles: ["admin"] },
  { username: "user", password: "user123", roles: ["user"] },
];

// JWT secret (in a real application, this would be an environment variable)
const JWT_SECRET = "super-secret-jwt-key-do-not-share";

// Token expiration (1 hour in seconds)
const TOKEN_EXPIRATION = 60 * 60;

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    }),
  )

  // Authentication middleware
  .derive(({ jwt, request }) => {
    return {
      authenticate: async () => {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return {
            success: false,
            error: "Missing or invalid token format",
          };
        }

        const token = authHeader.split(" ")[1];

        try {
          const payload = await jwt.verify(token);

          if (!payload) {
            return {
              success: false,
              error: "Invalid token",
            };
          }

          return {
            success: true,
            user: payload,
          };
        } catch (error) {
          return {
            success: false,
            error: "Token verification failed",
          };
        }
      },
    };
  })

  // Login route
  .post(
    "/auth/login",
    async ({ body, jwt }) => {
      const { username, password } = body as LoginCredentials;

      const user = VALID_USERS.find(
        (u) => u.username === username && u.password === password,
      );

      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Generate JWT token
      const token = await jwt.sign({
        sub: username,
        roles: user.roles,
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION,
      });

      const response: TokenResponse = {
        token,
        expiresIn: TOKEN_EXPIRATION,
        tokenType: "Bearer",
      };

      return response;
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )

  // Protected data route
  .get("/protected-data", async ({ authenticate }) => {
    const auth = await authenticate();

    if (!auth.success) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return protectedData;
  })

  .listen(3104);

console.log(
  `🦊 Bearer Auth API server (OpenAPI 3.1.0) is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(`Valid users: ${VALID_USERS.map((u) => u.username).join(", ")}`);
