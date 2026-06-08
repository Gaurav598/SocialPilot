import "server-only";

import { predictPerformance } from "@/lib/social-os/analytics/performance";
import { createModelRouter } from "@/lib/social-os/ai/providers";
import { buildMemoryProfile, retrieveRelevantMemories } from "@/lib/social-os/memory/memory-store";
import type {
  AgentKind,
  AgentOrchestrationInput,
  AgentOrchestrationResult,
  AgentOutput,
  SocialPlatform,
} from "@/lib/social-os/types";

const agentOrder: AgentKind[] = [
  "research",
  "content",
  "optimization",
  "repurposing",
  "scheduling",
  "analytics",
];

export async function runSocialOSAgentPipeline(
  input: AgentOrchestrationInput,
  userId: string,
): Promise<AgentOrchestrationResult> {
  const memory = buildMemoryProfile(userId);
  const retrieved = retrieveRelevantMemories(
    memory,
    `${input.objective} ${input.sourceContent ?? ""} ${input.brandVoice ?? ""}`,
  );
  const router = createModelRouter();
  const outputs: AgentOutput[] = [];
  let provider = "local";
  let estimatedCostUsd = 0;
  let tokens = 0;

  for (const agent of agentOrder) {
    const response = await router.chat({
      task: agentToTask(agent),
      maxTokens: agent === "content" ? 1100 : 700,
      messages: [
        {
          role: "system",
          content: buildAgentSystemPrompt(agent),
        },
        {
          role: "user",
          content: buildAgentUserPrompt(agent, input, memory.promptContext, retrieved),
        },
      ],
    });

    provider = response.provider;
    estimatedCostUsd += response.costUsd;
    tokens += response.inputTokens + response.outputTokens;
    outputs.push({
      agent,
      title: agentTitle(agent),
      content: response.content,
      confidence: confidenceForAgent(agent, response.provider),
      citations: retrieved.map((document) => document.title),
    });
  }

  const primaryPlatform = input.platforms[0] ?? "LINKEDIN";
  const contentOutput =
    outputs.find((output) => output.agent === "content")?.content ??
    input.sourceContent ??
    input.objective;
  const predictedPerformance = predictPerformance({
    content: contentOutput,
    platform: primaryPlatform,
    historicalEngagementRate: 0.052,
    audienceFit: 0.84,
  });

  return {
    objective: input.objective,
    outputs,
    recommendedSchedule: buildSchedule(input.platforms),
    predictedPerformance,
    approvalRequired: true,
    provider,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
    tokens,
  };
}

function buildAgentSystemPrompt(agent: AgentKind) {
  const base = [
    "You are part of SocialPilot OS, a senior AI social media operating system.",
    "Use retrieved memory and brand context. Be specific, operational, and concise.",
    "Return useful work product only. Avoid generic SaaS hype.",
  ];

  const instructions: Record<AgentKind, string> = {
    research:
      "Act as the Research Agent. Find trend angles, competitor gaps, viral hooks, and timely content opportunities.",
    content:
      "Act as the Content Agent. Create platform-ready content with a strong hook, useful middle, and clear closing action.",
    optimization:
      "Act as the Optimization Agent. Improve clarity, engagement, CTR, readability, and retention.",
    repurposing:
      "Act as the Repurposing Agent. Convert the idea into channel-specific assets and reusable campaign pieces.",
    scheduling:
      "Act as the Scheduling Agent. Choose publishing windows and explain the cadence.",
    analytics:
      "Act as the Analytics Agent. Infer performance drivers, risks, and next experiments from memory and content.",
  };

  return [...base, instructions[agent]].join("\n");
}

function buildAgentUserPrompt(
  agent: AgentKind,
  input: AgentOrchestrationInput,
  memoryContext: string,
  retrieved: Array<{ title: string; content: string; score?: number }>,
) {
  return [
    `Objective: ${input.objective}`,
    `Mode: ${input.mode ?? "assist"}`,
    `Platforms: ${input.platforms.join(", ")}`,
    `Brand voice: ${input.brandVoice ?? "Use the stored brand voice."}`,
    `Audience: ${input.audience ?? "Use the stored audience profile."}`,
    input.sourceContent ? `Source content: ${input.sourceContent}` : "",
    `Memory context:\n${memoryContext}`,
    `Retrieved context:\n${retrieved
      .map((document) => `- ${document.title}: ${document.content} (${Math.round((document.score ?? 0) * 100)}%)`)
      .join("\n")}`,
    `Agent: ${agent}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function agentToTask(agent: AgentKind) {
  const map = {
    research: "research",
    content: "content",
    optimization: "optimization",
    repurposing: "repurpose",
    scheduling: "schedule",
    analytics: "analytics",
  } as const;
  return map[agent];
}

function agentTitle(agent: AgentKind) {
  const titles: Record<AgentKind, string> = {
    research: "Trend and competitor brief",
    content: "Platform-ready creative",
    optimization: "Engagement optimization",
    repurposing: "Repurposing map",
    scheduling: "Best-time schedule",
    analytics: "Performance recommendation",
  };
  return titles[agent];
}

function confidenceForAgent(agent: AgentKind, provider: string) {
  const base: Record<AgentKind, number> = {
    research: 0.78,
    content: 0.82,
    optimization: 0.84,
    repurposing: 0.81,
    scheduling: 0.79,
    analytics: 0.77,
  };
  return Number(Math.min(0.94, base[agent] + (provider === "local" ? 0 : 0.05)).toFixed(2));
}

function buildSchedule(platforms: SocialPlatform[]) {
  const windows: Record<SocialPlatform, { bestTime: string; reason: string }> = {
    TWITTER: {
      bestTime: "Wednesday 14:00",
      reason: "Good overlap with founder and builder conversations after lunch.",
    },
    LINKEDIN: {
      bestTime: "Tuesday 10:00",
      reason: "Highest historical engagement for operator-style educational posts.",
    },
    INSTAGRAM: {
      bestTime: "Thursday 09:30",
      reason: "Carousel saves tend to peak before the mid-morning commute window closes.",
    },
    THREADS: {
      bestTime: "Wednesday 12:30",
      reason: "Conversation-first posts get stronger reply velocity around midday.",
    },
    FACEBOOK: {
      bestTime: "Thursday 18:00",
      reason: "Community posts perform better after core work hours.",
    },
    BLUESKY: {
      bestTime: "Friday 11:00",
      reason: "Discovery-heavy networks reward timely industry observations.",
    },
    YOUTUBE: {
      bestTime: "Saturday 09:00",
      reason: "Short-form discovery has more room during weekend browsing.",
    },
    TIKTOK: {
      bestTime: "Friday 19:00",
      reason: "Entertainment and quick education both rise in evening windows.",
    },
  };

  return platforms.map((platform) => ({
    platform,
    ...windows[platform],
  }));
}
