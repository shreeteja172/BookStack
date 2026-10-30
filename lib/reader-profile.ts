import "server-only";

import { prisma } from "./prisma";

export type Badge = {
  key: string;
  name: string;
  detail: string;
  earned: boolean;
  progress: number;
};

type LoanLike = {
  issuedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  fineCents: number;
  copy: { book: { category: string } };
};

function monthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function monthStreak(loans: LoanLike[], now: Date) {
  const months = new Set(loans.map((loan) => monthKey(loan.issuedAt)));
  let cursor = monthKey(now);

  if (!months.has(cursor)) {
    cursor -= 1;
  }

  let streak = 0;

  while (months.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}

export async function getReaderProfile(userId: string, loansPromise: Promise<LoanLike[]>) {
  const now = new Date();

  const [reviews, perMember, loans] = await Promise.all([
    prisma.review.count({ where: { userId } }),
    prisma.loan.groupBy({ by: ["userId"], _count: { _all: true } }),
    loansPromise,
  ]);

  const total = loans.length;
  const returned = loans.filter((loan) => loan.returnedAt !== null);
  const onTime = returned.filter((loan) => loan.fineCents === 0).length;
  const streak = monthStreak(loans, now);

  const genreCounts = new Map<string, number>();
  for (const loan of loans) {
    const category = loan.copy.book.category;
    genreCounts.set(category, (genreCounts.get(category) ?? 0) + 1);
  }
  const genres = [...genreCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const others = perMember.filter((row) => row.userId !== userId).map((row) => row._count._all);
  const beaten = others.filter((count) => count < total).length;
  const percentile = others.length === 0 ? 100 : Math.round((beaten / others.length) * 100);

  const ratio = (value: number, goal: number) => Math.min(1, value / goal);

  const badges: Badge[] = [
    { key: "first", name: "First chapter", detail: "Borrow your first book", earned: total >= 1, progress: ratio(total, 1) },
    { key: "worm", name: "Bookworm", detail: "Borrow 10 books", earned: total >= 10, progress: ratio(total, 10) },
    { key: "explorer", name: "Genre explorer", detail: "Read across 4 categories", earned: genres.length >= 4, progress: ratio(genres.length, 4) },
    { key: "punctual", name: "Always on time", detail: "Return 5 books with no fine", earned: onTime >= 5, progress: ratio(onTime, 5) },
    { key: "critic", name: "Critic", detail: "Review 3 books", earned: reviews >= 3, progress: ratio(reviews, 3) },
    { key: "streak", name: "Habit formed", detail: "Borrow 3 months running", earned: streak >= 3, progress: ratio(streak, 3) },
  ];

  return {
    total,
    streak,
    onTimeRate: returned.length === 0 ? null : Math.round((onTime / returned.length) * 100),
    percentile,
    genres,
    badges,
    topGenre: genres[0]?.label ?? null,
  };
}
