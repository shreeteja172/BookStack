import fs from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const [email, role] = process.argv.slice(2);

if (!email || (role !== "librarian" && role !== "member")) {
  console.error("Usage: pnpm set-role <email> <librarian|member>");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    console.error(`No account with email ${email}.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role },
    select: { name: true, email: true, role: true },
  });

  console.log(`${updated.name} (${updated.email}) is now a ${updated.role}.`);

  const all = await prisma.user.findMany({
    where: { email: { not: { endsWith: "@demo.bookstack" } } },
    select: { email: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  console.table(all);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
