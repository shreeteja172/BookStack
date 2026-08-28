import path from "node:path";
import { defineConfig } from "prisma/config";

process.loadEnvFile(path.join(import.meta.dirname, ".env.local"));

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
