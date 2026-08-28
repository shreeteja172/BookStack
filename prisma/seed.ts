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

type SeedBook = {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  publishedYear: number;
  description: string;
  copies: number;
};

const books: SeedBook[] = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "9781786892737",
    publisher: "Canongate Books",
    category: "Fiction",
    publishedYear: 2020,
    description:
      "Between life and death there is a library, and within it every book is a chance to try another life you could have lived.",
    copies: 4,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    publisher: "Avery",
    category: "Self-Help",
    publishedYear: 2018,
    description:
      "A practical framework for building good habits and breaking bad ones, one per cent at a time.",
    copies: 5,
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    isbn: "9780593135204",
    publisher: "Ballantine Books",
    category: "Science Fiction",
    publishedYear: 2021,
    description:
      "A lone astronaut wakes with no memory aboard a spacecraft, and the survival of Earth depends on what he remembers.",
    copies: 3,
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    isbn: "9780307588371",
    publisher: "Crown Publishing",
    category: "Thriller",
    publishedYear: 2012,
    description:
      "On a fifth wedding anniversary a wife disappears, and every answer her husband gives makes him look guiltier.",
    copies: 3,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    publisher: "Harper",
    category: "History",
    publishedYear: 2015,
    description:
      "How an unremarkable ape came to dominate the planet, told through the revolutions that shaped our species.",
    copies: 4,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    publisher: "Prentice Hall",
    category: "Technology",
    publishedYear: 2008,
    description:
      "A handbook of agile software craftsmanship, full of concrete rules for writing code others can read.",
    copies: 6,
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "9781449373320",
    publisher: "O'Reilly Media",
    category: "Technology",
    publishedYear: 2017,
    description:
      "The big ideas behind reliable, scalable and maintainable systems, from storage engines to distributed consensus.",
    copies: 3,
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    isbn: "9781250301697",
    publisher: "Celadon Books",
    category: "Thriller",
    publishedYear: 2019,
    description:
      "A famous painter shoots her husband and never speaks again. A psychotherapist is determined to find out why.",
    copies: 2,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    isbn: "9780399590504",
    publisher: "Random House",
    category: "Biography",
    publishedYear: 2018,
    description:
      "A memoir about a girl kept out of school who leaves her survivalist family and earns a PhD from Cambridge.",
    copies: 3,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "9780374533557",
    publisher: "Farrar, Straus and Giroux",
    category: "Psychology",
    publishedYear: 2011,
    description:
      "The two systems that drive the way we think, and the biases that quietly steer our decisions.",
    copies: 4,
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    isbn: "9780756404741",
    publisher: "DAW Books",
    category: "Fantasy",
    publishedYear: 2007,
    description:
      "The first-hand account of Kvothe, a musician and magician whose legend outgrew the truth.",
    copies: 3,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    publisher: "Bantam",
    category: "Science",
    publishedYear: 1998,
    description:
      "From the Big Bang to black holes, an accessible tour of the questions physics is still trying to answer.",
    copies: 3,
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    isbn: "9781455586691",
    publisher: "Grand Central Publishing",
    category: "Self-Help",
    publishedYear: 2016,
    description:
      "Why the ability to focus without distraction is becoming rare, and how to cultivate it deliberately.",
    copies: 4,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441013593",
    publisher: "Ace Books",
    category: "Science Fiction",
    publishedYear: 1965,
    description:
      "On the desert planet Arrakis, control of a single spice decides the fate of empires.",
    copies: 5,
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "9780201616224",
    publisher: "Addison-Wesley",
    category: "Technology",
    publishedYear: 1999,
    description:
      "Practical advice on the craft of programming, from tracer bullets to the broken window theory.",
    copies: 4,
  },
  {
    title: "Normal People",
    author: "Sally Rooney",
    isbn: "9781984822178",
    publisher: "Hogarth",
    category: "Fiction",
    publishedYear: 2019,
    description:
      "Two people circle each other from school into university, pulled together and apart by class and pride.",
    copies: 3,
  },
  {
    title: "The Wager",
    author: "David Grann",
    isbn: "9780385534260",
    publisher: "Doubleday",
    category: "History",
    publishedYear: 2023,
    description:
      "A shipwreck, a mutiny and two irreconcilable accounts of what happened on a remote island.",
    copies: 2,
  },
  {
    title: "Circe",
    author: "Madeline Miller",
    isbn: "9780316556347",
    publisher: "Little, Brown and Company",
    category: "Fantasy",
    publishedYear: 2018,
    description:
      "The witch of Aiaia tells her own story, from banished daughter to a power the gods learn to fear.",
    copies: 3,
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    isbn: "9780807014295",
    publisher: "Beacon Press",
    category: "Psychology",
    publishedYear: 2006,
    description:
      "A psychiatrist's account of the concentration camps and the argument that meaning survives suffering.",
    copies: 4,
  },
  {
    title: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    isbn: "9780143127741",
    publisher: "Penguin Books",
    category: "Psychology",
    publishedYear: 2015,
    description:
      "How trauma reshapes the body and brain, and the treatments that help people reclaim their lives.",
    copies: 3,
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "9781451648539",
    publisher: "Simon & Schuster",
    category: "Biography",
    publishedYear: 2011,
    description:
      "Built on forty interviews with Jobs himself, a portrait of a difficult man who insisted on beautiful things.",
    copies: 3,
  },
  {
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    isbn: "9780571364879",
    publisher: "Faber & Faber",
    category: "Science Fiction",
    publishedYear: 2021,
    description:
      "An artificial friend watches the world from a shop window and tries to understand what love asks of her.",
    copies: 2,
  },
  {
    title: "Why We Sleep",
    author: "Matthew Walker",
    isbn: "9781501144318",
    publisher: "Scribner",
    category: "Science",
    publishedYear: 2017,
    description:
      "What sleep does for memory, mood and immunity, and what happens when we keep cutting it short.",
    copies: 4,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    publisher: "Houghton Mifflin",
    category: "Fantasy",
    publishedYear: 2012,
    description:
      "A comfortable hobbit is swept into a quest for a dragon's hoard and comes back a different creature.",
    copies: 5,
  },
];

const FLOORS = ["1", "2", "3"];
const SHELVES = ["A", "B", "C", "D", "E", "F"];

function locationFor(bookIndex: number, copyIndex: number) {
  return {
    floor: FLOORS[bookIndex % FLOORS.length],
    shelf: SHELVES[Math.floor(bookIndex / FLOORS.length) % SHELVES.length],
    row: String((copyIndex % 6) + 1),
  };
}

async function main() {
  console.log("Seeding catalogue...");

  for (const [bookIndex, book] of books.entries()) {
    const { copies, ...data } = book;

    const record = await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: data,
      create: data,
    });

    for (let copyIndex = 0; copyIndex < copies; copyIndex += 1) {
      const location = locationFor(bookIndex, copyIndex);
      const barcode = `BK-${String(bookIndex + 1).padStart(4, "0")}-${copyIndex + 1}`;

      await prisma.bookCopy.upsert({
        where: { barcode },
        update: location,
        create: {
          barcode,
          bookId: record.id,
          status: "available",
          ...location,
        },
      });
    }
  }

  const bookCount = await prisma.book.count();
  const copyCount = await prisma.bookCopy.count();

  console.log(`Done. ${bookCount} books, ${copyCount} copies.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
