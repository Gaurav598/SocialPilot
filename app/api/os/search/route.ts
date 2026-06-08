import { buildMemoryProfile } from "@/lib/social-os/memory/memory-store";
import { memoryToDocuments, semanticSearch } from "@/lib/social-os/rag/vector-store";
import { checkRateLimit } from "@/lib/social-os/security/rate-limit";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`search:${userId}`, { limit: 80, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many search requests", resetAt: limit.resetAt },
      { status: 429 },
    );
  }

  const { query } = (await request.json()) as { query?: string };
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const profile = buildMemoryProfile(userId);
  const results = semanticSearch(query, memoryToDocuments(profile.memories), { limit: 8 });

  return NextResponse.json({ results });
}
