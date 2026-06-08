import "server-only";

import type { MemoryRecord } from "@/lib/social-os/types";

export interface VectorDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  embedding: number[];
  score?: number;
}

const VECTOR_SIZE = 64;

export function embedText(text: string): number[] {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9#@\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    const index = Math.abs(hashToken(token)) % VECTOR_SIZE;
    vector[index] += 1 + Math.min(token.length, 14) / 14;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

export function createVectorDocument(input: Omit<VectorDocument, "embedding">): VectorDocument {
  return {
    ...input,
    embedding: embedText(`${input.title} ${input.content} ${input.tags.join(" ")}`),
  };
}

export function memoryToDocuments(memories: MemoryRecord[]): VectorDocument[] {
  return memories.map((memory) =>
    createVectorDocument({
      id: memory.id,
      title: memory.title,
      content: memory.content,
      tags: [memory.kind, `weight:${memory.weight}`],
    }),
  );
}

export function semanticSearch(
  query: string,
  documents: VectorDocument[],
  options: { limit?: number; minScore?: number } = {},
) {
  const queryVector = embedText(query);
  const limit = options.limit ?? 5;
  const minScore = options.minScore ?? 0.1;

  return documents
    .map((document) => ({
      ...document,
      score: cosineSimilarity(queryVector, document.embedding),
    }))
    .filter((document) => (document.score ?? 0) >= minScore)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    dot += a[index] * b[index];
  }
  return dot;
}

function hashToken(token: string) {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (hash << 5) - hash + token.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}
