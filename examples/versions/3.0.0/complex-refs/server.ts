#!/usr/bin/env bun

import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { cors } from "@elysiajs/cors";

// Define types based on the OpenAPI schema
type Attribute = {
  name: string;
  value: string;
};

type CategoryReference = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  parent?: CategoryReference;
};

type Discount = {
  percentage: number;
  validUntil?: string;
};

type Price = {
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "JPY";
  discounted?: boolean;
  discount?: Discount;
};

type ProductVariant = {
  id: string;
  name: string;
  attributes: Attribute[];
  price: Price;
};

type Metadata = {
  [key: string]: string | number | boolean;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: Price;
  category: Category;
  variants?: ProductVariant[];
  metadata?: Metadata;
  createdAt: string;
};

// Sample data
const electronics: Category = {
  id: uuidv4(),
  name: "Electronics",
};

const computers: Category = {
  id: uuidv4(),
  name: "Computers",
  parent: {
    id: electronics.id,
    name: electronics.name,
  },
};

const laptops: Category = {
  id: uuidv4(),
  name: "Laptops",
  parent: {
    id: computers.id,
    name: computers.name,
  },
};

// Sample products
const products: Product[] = [
  {
    id: uuidv4(),
    name: "Premium Laptop",
    description: "High-performance laptop for professionals",
    price: {
      amount: 1299.99,
      currency: "USD",
      discounted: true,
      discount: {
        percentage: 10,
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 days from now
      },
    },
    category: laptops,
    variants: [
      {
        id: uuidv4(),
        name: "16GB RAM / 512GB SSD",
        attributes: [
          { name: "RAM", value: "16GB" },
          { name: "Storage", value: "512GB SSD" },
          { name: "Color", value: "Silver" },
        ],
        price: {
          amount: 1299.99,
          currency: "USD",
        },
      },
      {
        id: uuidv4(),
        name: "32GB RAM / 1TB SSD",
        attributes: [
          { name: "RAM", value: "32GB" },
          { name: "Storage", value: "1TB SSD" },
          { name: "Color", value: "Space Gray" },
        ],
        price: {
          amount: 1799.99,
          currency: "USD",
        },
      },
    ],
    metadata: {
      inStock: true,
      rating: 4.8,
      releaseYear: 2023,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Budget Laptop",
    description: "Affordable laptop for everyday use",
    price: {
      amount: 599.99,
      currency: "USD",
    },
    category: laptops,
    variants: [
      {
        id: uuidv4(),
        name: "8GB RAM / 256GB SSD",
        attributes: [
          { name: "RAM", value: "8GB" },
          { name: "Storage", value: "256GB SSD" },
          { name: "Color", value: "Black" },
        ],
        price: {
          amount: 599.99,
          currency: "USD",
        },
      },
    ],
    metadata: {
      inStock: true,
      rating: 4.2,
      releaseYear: 2022,
    },
    createdAt: new Date().toISOString(),
  },
];

// Create server
const app = new Elysia()
  .use(cors())
  .get("/products", () => {
    return products;
  })
  .listen(3002);

console.log(
  `🦊 Complex-Refs API server is running at ${app.server?.hostname}:${app.server?.port}`,
);
