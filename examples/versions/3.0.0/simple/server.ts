#!/usr/bin/env bun

import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { cors } from "@elysiajs/cors";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type UserInput = {
  name: string;
  email: string;
};

// In-memory database
let users: User[] = [];

const app = new Elysia()
  .use(cors())
  // Get all users
  .get("/users", () => {
    return users;
  })
  // Create a new user
  .post("/users", ({ body }) => {
    const { name, email } = body as UserInput;

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return Response.json(newUser, { status: 201 });
  })
  // Get user by ID
  .get("/users/:userId", ({ params }) => {
    const { userId } = params;
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return user;
  })
  // Update user
  .put("/users/:userId", ({ params, body }) => {
    const { userId } = params;
    const { name, email } = body as UserInput;

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser: User = {
      ...users[userIndex],
      name,
      email,
    };

    users[userIndex] = updatedUser;

    return updatedUser;
  })
  // Delete user
  .delete("/users/:userId", ({ params }) => {
    const { userId } = params;
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    users.splice(userIndex, 1);

    return Response.json(null, { status: 204 });
  })
  .listen(3001);

console.log(
  `🦊 Simple API server is running at ${app.server?.hostname}:${app.server?.port}`,
);

// Add some sample data
users.push({
  id: uuidv4(),
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date().toISOString(),
});

users.push({
  id: uuidv4(),
  name: "Jane Smith",
  email: "jane@example.com",
  createdAt: new Date().toISOString(),
});
