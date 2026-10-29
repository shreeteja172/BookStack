import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { searchBooks } from "@/lib/library";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const books = await searchBooks({ query });

  return NextResponse.json({
    results: books.slice(0, 8).map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies,
    })),
  });
}
