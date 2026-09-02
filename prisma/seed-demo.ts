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

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PERSONAS: { name: string; categories: string[]; weight: number }[] = [
  { name: "engineer", categories: ["Technology", "Science"], weight: 6 },
  { name: "novelist", categories: ["Fiction", "Fantasy"], weight: 6 },
  { name: "analyst", categories: ["Psychology", "Self-Help"], weight: 5 },
  { name: "historian", categories: ["History", "Biography"], weight: 5 },
  { name: "sleuth", categories: ["Thriller", "Science Fiction"], weight: 5 },
];

const FIRST = [
  "Aditya", "Meera", "Rohan", "Sneha", "Karthik", "Ananya", "Vikram", "Priya",
  "Arjun", "Divya", "Nikhil", "Lakshmi", "Rahul", "Kavya", "Sanjay", "Ishita",
  "Manish", "Pooja", "Varun", "Tanvi", "Harsh", "Neha", "Aakash", "Ritu",
  "Suresh", "Gauri", "Imran", "Fatima", "Joel", "Rhea",
];

const LAST = [
  "Sharma", "Nair", "Patel", "Reddy", "Iyer", "Gupta", "Menon", "Rao",
  "Desai", "Kulkarni", "Bose", "Chandra", "Fernandes", "Joshi", "Kapoor",
];

function rng(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = rng(20260828);

function pick<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function makeId(prefix: string, index: number) {
  return `${prefix}${String(index).padStart(6, "0")}demoseed`;
}

async function main() {
  const existing = await prisma.user.count({ where: { email: { endsWith: "@demo.bookstack" } } });

  if (existing > 0) {
    console.log(`Demo members already present (${existing}). Nothing to do.`);
    await prisma.$disconnect();
    return;
  }

  const books = await prisma.book.findMany({
    include: { copies: { select: { id: true, status: true } } },
  });

  if (books.length === 0) {
    throw new Error("Run the catalogue seed first.");
  }

  const byCategory = new Map<string, typeof books>();

  for (const book of books) {
    const list = byCategory.get(book.category) ?? [];
    list.push(book);
    byCategory.set(book.category, list);
  }

  const now = Date.now();
  let loanCount = 0;
  let reviewCount = 0;

  for (let index = 0; index < 30; index += 1) {
    const persona = PERSONAS[index % PERSONAS.length];
    const name = `${FIRST[index % FIRST.length]} ${pick(LAST)}`;
    const email = `${FIRST[index % FIRST.length].toLowerCase()}${index}@demo.bookstack`;
    const joined = new Date(now - Math.floor(200 + random() * 500) * MS_PER_DAY);

    const user = await prisma.user.create({
      data: {
        id: makeId("usr", index),
        name,
        email,
        emailVerified: true,
        role: "member",
        createdAt: joined,
        updatedAt: joined,
      },
    });

    const pool: typeof books = [];

    for (const category of persona.categories) {
      pool.push(...(byCategory.get(category) ?? []));
    }

    const crossover = books.filter((book) => !persona.categories.includes(book.category));
    const readCount = Math.floor(persona.weight + random() * 5);
    const chosen = new Set<string>();

    for (let n = 0; n < readCount; n += 1) {
      const fromPool = random() < 0.78 && pool.length > 0;
      const book = fromPool ? pick(pool) : pick(crossover);

      if (!book || chosen.has(book.id) || book.copies.length === 0) {
        continue;
      }

      chosen.add(book.id);

      const copy = pick(book.copies);
      const issuedAt = new Date(now - Math.floor(20 + random() * 400) * MS_PER_DAY);
      const dueAt = new Date(issuedAt.getTime() + 14 * MS_PER_DAY);
      const lateDays = random() < 0.22 ? Math.floor(1 + random() * 9) : 0;
      const returnedAt = new Date(dueAt.getTime() + (lateDays - Math.floor(random() * 6)) * MS_PER_DAY);

      await prisma.loan.create({
        data: {
          userId: user.id,
          copyId: copy.id,
          issuedAt,
          dueAt,
          returnedAt,
          fineCents: lateDays * 500,
        },
      });

      loanCount += 1;

      if (random() < 0.45) {
        const base = fromPool ? 4 : 3;
        const rating = Math.min(5, Math.max(1, base + Math.floor(random() * 2)));

        await prisma.review.create({
          data: {
            bookId: book.id,
            userId: user.id,
            rating,
            body:
              rating >= 4
                ? "Genuinely worth the time. Would recommend to anyone in this section."
                : "Readable, but it did not land for me the way I hoped.",
            createdAt: returnedAt,
            updatedAt: returnedAt,
          },
        });

        reviewCount += 1;
      }
    }
  }

  console.log(`Created 30 demo members, ${loanCount} loans, ${reviewCount} reviews.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
