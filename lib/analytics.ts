import "server-only";

import { prisma } from "./prisma";

export type CountRow = {
  label: string;
  value: number;
};

export type PurchaseSuggestion = {
  id: string;
  title: string;
  author: string;
  copies: number;
  loans: number;
  waiting: number;
  demandPerCopy: number;
};

export async function getTopBooks(limit = 8): Promise<CountRow[]> {
  const rows = await prisma.$queryRaw<{ title: string; value: bigint }[]>`
    SELECT b.title, COUNT(l.id) AS value
    FROM books b
    JOIN book_copies c ON c."bookId" = b.id
    JOIN loans l ON l."copyId" = c.id
    GROUP BY b.id, b.title
    ORDER BY value DESC, b.title ASC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({ label: row.title, value: Number(row.value) }));
}

export async function getCategoryDemand(): Promise<CountRow[]> {
  const rows = await prisma.$queryRaw<{ category: string; value: bigint }[]>`
    SELECT b.category, COUNT(l.id) AS value
    FROM books b
    JOIN book_copies c ON c."bookId" = b.id
    JOIN loans l ON l."copyId" = c.id
    GROUP BY b.category
    ORDER BY value DESC
  `;

  return rows.map((row) => ({ label: row.category, value: Number(row.value) }));
}

export async function getMonthlyTrend(months = 12): Promise<CountRow[]> {
  const rows = await prisma.$queryRaw<{ bucket: Date; value: bigint }[]>`
    SELECT date_trunc('month', l."issuedAt") AS bucket, COUNT(*) AS value
    FROM loans l
    WHERE l."issuedAt" > now() - (${months} * INTERVAL '1 month')
    GROUP BY bucket
    ORDER BY bucket ASC
  `;

  const formatter = new Intl.DateTimeFormat("en-IN", { month: "short" });

  return rows.map((row) => ({
    label: formatter.format(new Date(row.bucket)),
    value: Number(row.value),
  }));
}

export async function getTopMembers(limit = 5): Promise<CountRow[]> {
  const rows = await prisma.$queryRaw<{ name: string; value: bigint }[]>`
    SELECT u.name, COUNT(l.id) AS value
    FROM users u
    JOIN loans l ON l."userId" = u.id
    GROUP BY u.id, u.name
    ORDER BY value DESC, u.name ASC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({ label: row.name, value: Number(row.value) }));
}

export async function getCirculationHealth() {
  const [total, late, active, overdueNow] = await Promise.all([
    prisma.loan.count(),
    prisma.loan.count({ where: { fineCents: { gt: 0 } } }),
    prisma.loan.count({ where: { returnedAt: null } }),
    prisma.loan.count({ where: { returnedAt: null, dueAt: { lt: new Date() } } }),
  ]);

  const fines = await prisma.loan.aggregate({ _sum: { fineCents: true } });

  return {
    total,
    late,
    active,
    overdueNow,
    lateRate: total === 0 ? 0 : Math.round((late / total) * 100),
    finesCollectedPaise: fines._sum.fineCents ?? 0,
  };
}

export async function getPurchaseSuggestions(limit = 5): Promise<PurchaseSuggestion[]> {
  const rows = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      author: string;
      copies: bigint;
      loans: bigint;
      waiting: bigint;
    }[]
  >`
    SELECT b.id, b.title, b.author,
           COUNT(DISTINCT c.id) AS copies,
           COUNT(l.id) AS loans,
           COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'waiting') AS waiting
    FROM books b
    JOIN book_copies c ON c."bookId" = b.id
    LEFT JOIN loans l ON l."copyId" = c.id
    LEFT JOIN reservations r ON r."bookId" = b.id
    GROUP BY b.id, b.title, b.author
    HAVING COUNT(l.id) > 0
    ORDER BY (COUNT(l.id)::float / GREATEST(COUNT(DISTINCT c.id), 1)) DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => {
    const copies = Number(row.copies);
    const loans = Number(row.loans);

    return {
      id: row.id,
      title: row.title,
      author: row.author,
      copies,
      loans,
      waiting: Number(row.waiting),
      demandPerCopy: copies === 0 ? 0 : Math.round((loans / copies) * 10) / 10,
    };
  });
}
