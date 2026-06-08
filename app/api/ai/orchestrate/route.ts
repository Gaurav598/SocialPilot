import { runSocialOSAgentPipeline } from "@/lib/social-os/ai/agents";
import { checkRateLimit } from "@/lib/social-os/security/rate-limit";
import type { AgentOrchestrationInput } from "@/lib/social-os/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { has, userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canUseAI = has({ plan: "pro" }) || has({ plan: "premium" });
  if (!canUseAI) {
    return NextResponse.json(
      { error: "AI orchestration requires Pro or Premium plan" },
      { status: 403 },
    );
  }

  const limit = checkRateLimit(`ai:${userId}`, { limit: 24, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "AI orchestration rate limit exceeded", resetAt: limit.resetAt },
      { status: 429 },
    );
  }

  const input = (await request.json()) as AgentOrchestrationInput;
  if (!input.objective?.trim()) {
    return NextResponse.json({ error: "Objective is required" }, { status: 400 });
  }
  if (!Array.isArray(input.platforms) || input.platforms.length === 0) {
    return NextResponse.json({ error: "At least one platform is required" }, { status: 400 });
  }

  const result = await runSocialOSAgentPipeline(input, userId);
  return NextResponse.json({ result });
}
