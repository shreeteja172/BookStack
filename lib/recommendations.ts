import "server-only";

import { prisma } from "./prisma";

export type Recommendation = {
  id: string;
  title: string;
  author: string;
  category: string;
  score: number;
  reason: string;
};

type RawRow = {
  id: string;
  title: string;
  author: string;
  category: string;
  score: bigint | number;
};

function toRecommendations(rows: RawRow[], reason: string): Recommendation[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    score: Number(row.score),
    reason,
  }));
}

export async function getAlsoBorrowed(bookId: string, limit = 4) {
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT b.id, b.title, b.author, b.category,
           COUNT(DISTINCT peer."userId") AS score
    FROM loans mine
    JOIN book_copies mine_copy ON mine_copy.id = mine."copyId"
    JOIN loans peer ON peer."userId" = mine."userId"
    JOIN book_copies peer_copy ON peer_copy.id = peer."copyId"
    JOIN books b ON b.id = peer_copy."bookId"
    WHERE mine_copy."bookId" = ${bookId}
      AND peer_copy."bookId" <> ${bookId}
    GROUP BY b.id, b.title, b.author, b.category
    HAVING COUNT(DISTINCT peer."userId") > 1
    ORDER BY score DESC, b.title ASC
    LIMIT ${limit}
  `;

  return toRecommendations(rows, "Borrowed by the same members");
}

export async function getPersonalRecommendations(userId: string, limit = 6) {
  const rows = await prisma.$queryRaw<RawRow[]>`
    WITH mine AS (
      SELECT DISTINCT c."bookId"
      FROM loans l
      JOIN book_copies c ON c.id = l."copyId"
      WHERE l."userId" = ${userId}
    ),
    neighbours AS (
      SELECT l."userId" AS peer_id, COUNT(*) AS overlap
      FROM loans l
      JOIN book_copies c ON c.id = l."copyId"
      WHERE c."bookId" IN (SELECT "bookId" FROM mine)
        AND l."userId" <> ${userId}
      GROUP BY l."userId"
    )
    SELECT b.id, b.title, b.author, b.category,
           SUM(n.overlap) AS score
    FROM neighbours n
    JOIN loans l ON l."userId" = n.peer_id
    JOIN book_copies c ON c.id = l."copyId"
    JOIN books b ON b.id = c."bookId"
    WHERE c."bookId" NOT IN (SELECT "bookId" FROM mine)
    GROUP BY b.id, b.title, b.author, b.category
    ORDER BY score DESC, b.title ASC
    LIMIT ${limit}
  `;

  if (rows.length > 0) {
    return toRecommendations(rows, "Members with similar taste read this");
  }

  return getPopularBooks(limit);
}

export async function getPopularBooks(limit = 6) {
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT b.id, b.title, b.author, b.category, COUNT(l.id) AS score
    FROM books b
    JOIN book_copies c ON c."bookId" = b.id
    LEFT JOIN loans l ON l."copyId" = c.id
    GROUP BY b.id, b.title, b.author, b.category
    ORDER BY score DESC, b.title ASC
    LIMIT ${limit}
  `;

  return toRecommendations(rows, "Most borrowed in the library");
}

export async function getRatingSummary(bookId: string) {
  const result = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}

export async function getRatingSummaries(bookIds: string[]) {
  if (bookIds.length === 0) {
    return new Map<string, { average: number; count: number }>();
  }

  const rows = await prisma.review.groupBy({
    by: ["bookId"],
    where: { bookId: { in: bookIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return new Map(
    rows.map((row) => [
      row.bookId,
      { average: row._avg.rating ?? 0, count: row._count.rating },
    ]),
  );
}

export async function getBookReviews(bookId: string) {
  const reviews = await prisma.review.findMany({
    where: { bookId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const borrowerIds = await prisma.loan.findMany({
    where: { copy: { bookId }, userId: { in: reviews.map((review) => review.userId) } },
    select: { userId: true },
    distinct: ["userId"],
  });

  const verified = new Set(borrowerIds.map((row) => row.userId));

  return reviews.map((review) => ({
    ...review,
    verifiedBorrower: verified.has(review.userId),
  }));
}

export async function hasBorrowed(userId: string, bookId: string) {
  const loan = await prisma.loan.findFirst({
    where: { userId, copy: { bookId } },
    select: { id: true },
  });

  return loan !== null;
}

export async function getMyReview(userId: string, bookId: string) {
  return prisma.review.findUnique({
    where: { bookId_userId: { bookId, userId } },
  });
}
