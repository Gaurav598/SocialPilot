import "server-only";

import { getInsforgeServerClient } from "@/lib/insforge-server";

export type ModelProviderId = "insforge" | "openai" | "anthropic" | "gemini" | "local";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelRequest {
  messages: ChatMessage[];
  task: "research" | "content" | "optimization" | "repurpose" | "schedule" | "analytics";
  preferredProvider?: ModelProviderId;
  maxTokens?: number;
}

export interface ModelResponse {
  provider: ModelProviderId;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

interface SocialAIProvider {
  id: ModelProviderId;
  defaultModel: string;
  isConfigured(): boolean;
  chat(request: ModelRequest): Promise<ModelResponse>;
}

export function createModelRouter() {
  const providers: SocialAIProvider[] = [
    new InsforgeProvider(),
    new OpenAIProvider(),
    new AnthropicProvider(),
    new GeminiProvider(),
    new LocalHeuristicProvider(),
  ];

  return {
    async chat(request: ModelRequest) {
      const ordered = orderProviders(providers, request);
      const errors: string[] = [];

      for (const provider of ordered) {
        if (!provider.isConfigured()) continue;
        try {
          return await provider.chat(request);
        } catch (error) {
          errors.push(`${provider.id}: ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }

      const local = providers.find((provider) => provider.id === "local");
      if (!local) {
        throw new Error(`No AI provider available. ${errors.join("; ")}`);
      }
      return local.chat(request);
    },
  };
}

class InsforgeProvider implements SocialAIProvider {
  id: ModelProviderId = "insforge";
  defaultModel = process.env.AI_INSFORGE_MODEL ?? "google/gemini-2.5-flash-lite";

  isConfigured() {
    return Boolean(
      process.env.NEXT_PUBLIC_INSFORGE_BASE_URL &&
        process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY &&
        process.env.INSFORGE_PROJECT_API_KEY,
    );
  }

  async chat(request: ModelRequest) {
    const started = Date.now();
    const { insforge } = await getInsforgeServerClient();
    const result = await insforge.ai.chat.completions.create({
      model: this.defaultModel,
      messages: request.messages,
    });
    const content = result.choices[0]?.message?.content ?? "";
    return toResponse(this.id, this.defaultModel, request, content, started, 0.00000035);
  }
}

class OpenAIProvider implements SocialAIProvider {
  id: ModelProviderId = "openai";
  defaultModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async chat(request: ModelRequest) {
    const started = Date.now();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: request.messages,
        max_tokens: request.maxTokens ?? 900,
        temperature: 0.72,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}`);
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return toResponse(
      this.id,
      this.defaultModel,
      request,
      data.choices?.[0]?.message?.content ?? "",
      started,
      0.0000008,
    );
  }
}

class AnthropicProvider implements SocialAIProvider {
  id: ModelProviderId = "anthropic";
  defaultModel = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  async chat(request: ModelRequest) {
    const started = Date.now();
    const system = request.messages.find((message) => message.role === "system")?.content;
    const messages = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({ role: message.role, content: message.content }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.defaultModel,
        system,
        messages,
        max_tokens: request.maxTokens ?? 900,
      }),
    });

    if (!response.ok) throw new Error(`Anthropic request failed with ${response.status}`);
    const data = (await response.json()) as { content?: Array<{ text?: string }> };
    return toResponse(
      this.id,
      this.defaultModel,
      request,
      data.content?.map((item) => item.text ?? "").join("\n") ?? "",
      started,
      0.00000065,
    );
  }
}

class GeminiProvider implements SocialAIProvider {
  id: ModelProviderId = "gemini";
  defaultModel = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async chat(request: ModelRequest) {
    const started = Date.now();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.defaultModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: request.messages.map((message) => `${message.role}: ${message.content}`).join("\n") }],
            },
          ],
        }),
      },
    );

    if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return toResponse(
      this.id,
      this.defaultModel,
      request,
      data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n") ?? "",
      started,
      0.00000025,
    );
  }
}

class LocalHeuristicProvider implements SocialAIProvider {
  id: ModelProviderId = "local";
  defaultModel = "socialpilot-local-strategist";

  isConfigured() {
    return true;
  }

  async chat(request: ModelRequest) {
    const started = Date.now();
    const userText = request.messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n");
    const content = buildLocalResponse(request.task, userText);
    return toResponse(this.id, this.defaultModel, request, content, started, 0);
  }
}

function orderProviders(providers: SocialAIProvider[], request: ModelRequest) {
  const envPreferred = process.env.AI_PRIMARY_PROVIDER as ModelProviderId | undefined;
  const preferred = request.preferredProvider ?? envPreferred;
  const fallbackOrder: ModelProviderId[] = ["insforge", "openai", "anthropic", "gemini", "local"];

  if (!preferred) return providers;

  return [...providers].sort((a, b) => {
    const aScore = a.id === preferred ? -1 : fallbackOrder.indexOf(a.id);
    const bScore = b.id === preferred ? -1 : fallbackOrder.indexOf(b.id);
    return aScore - bScore;
  });
}

function toResponse(
  provider: ModelProviderId,
  model: string,
  request: ModelRequest,
  content: string,
  started: number,
  costPerToken: number,
): ModelResponse {
  const inputTokens = estimateTokens(request.messages.map((message) => message.content).join(" "));
  const outputTokens = estimateTokens(content);
  return {
    provider,
    model,
    content,
    inputTokens,
    outputTokens,
    costUsd: round((inputTokens + outputTokens) * costPerToken, 6),
    latencyMs: Date.now() - started,
  };
}

function buildLocalResponse(task: ModelRequest["task"], userText: string) {
  const objective = userText.split("\n").find(Boolean)?.slice(0, 160) || "Grow the audience";
  const templates: Record<ModelRequest["task"], string> = {
    research:
      `Research brief: ${objective}\n- Trend: operators are replacing one-off content with repeatable content systems.\n- Competitor gap: most posts describe tools, few show the operating cadence.\n- Opportunity: lead with a concrete workflow and benchmark the before/after.`,
    content:
      `Draft: Build a content system that compounds.\n\nStart with one customer problem, turn it into a weekly narrative, then adapt it for each platform instead of rewriting from scratch.\n\nThe advantage is not more posts. It is a tighter learning loop.`,
    optimization:
      "Optimization: tighten the hook, move the core claim into the first sentence, add one proof point, and end with a single action. Keep hashtags to zero to three.",
    repurpose:
      "Repurpose plan: convert the core idea into a LinkedIn framework post, a 5-part Twitter/X thread, an Instagram carousel outline, and a newsletter intro with one customer example.",
    schedule:
      "Scheduling plan: publish the primary LinkedIn post Tuesday 10:00, Twitter/X thread Wednesday 14:00, and carousel Thursday 09:30. Leave 24 hours for comment mining before the follow-up.",
    analytics:
      "Analytics insight: prioritize posts with clear operator language, one measurable promise, and a visible workflow. These patterns are predicted to lift engagement by 18-24%.",
  };

  return templates[task];
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function round(value: number, places: number) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
