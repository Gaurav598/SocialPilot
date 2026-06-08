import "server-only";

import type { MemoryRecord } from "@/lib/social-os/types";
import { memoryToDocuments, semanticSearch } from "@/lib/social-os/rag/vector-store";

export interface MemoryProfile {
  userId: string;
  memories: MemoryRecord[];
  promptContext: string;
}

export function buildMemoryProfile(userId: string, now = new Date()): MemoryProfile {
  const memories: MemoryRecord[] = [
    {
      id: "mem-style-01",
      kind: "semantic",
      title: "Brand voice",
      content:
        "Write with crisp operator energy: specific, useful, low-hype, confident, and practical. Prefer concrete examples over generic motivational copy.",
      weight: 0.94,
      updatedAt: now.toISOString(),
    },
    {
      id: "mem-audience-01",
      kind: "long_term",
      title: "Audience",
      content:
        "Primary audience includes founders, solo marketers, creator-operators, and lean SaaS teams who want repeatable content systems.",
      weight: 0.9,
      updatedAt: now.toISOString(),
    },
    {
      id: "mem-format-01",
      kind: "episodic",
      title: "Best performing format",
      content:
        "Posts that start with a sharp observation, include a 3-step framework, and end with one practical next action have performed best.",
      weight: 0.86,
      updatedAt: now.toISOString(),
    },
    {
      id: "mem-hashtags-01",
      kind: "short_term",
      title: "Hashtag preference",
      content:
        "Use zero to three hashtags, only when they add discovery value. Preferred tags: #buildinpublic, #contentstrategy, #saas.",
      weight: 0.72,
      updatedAt: now.toISOString(),
    },
    {
      id: "mem-timing-01",
      kind: "long_term",
      title: "Posting windows",
      content:
        "Best posting windows are Tuesday 10:00, Wednesday 14:00, and Thursday 09:30 in the workspace timezone.",
      weight: 0.81,
      updatedAt: now.toISOString(),
    },
  ];

  return {
    userId,
    memories,
    promptContext: memories
      .sort((a, b) => b.weight - a.weight)
      .map((memory) => `${memory.title}: ${memory.content}`)
      .join("\n"),
  };
}

export function retrieveRelevantMemories(profile: MemoryProfile, query: string, limit = 4) {
  return semanticSearch(query, memoryToDocuments(profile.memories), { limit });
}
