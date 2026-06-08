import "server-only";

import type { SocialPlatform } from "@/lib/social-os/types";

const platformMultipliers: Record<SocialPlatform, number> = {
  TWITTER: 1.12,
  LINKEDIN: 1.18,
  INSTAGRAM: 1.08,
  THREADS: 1.04,
  FACEBOOK: 0.94,
  BLUESKY: 0.98,
  YOUTUBE: 1.06,
  TIKTOK: 1.22,
};

export interface PerformancePredictionInput {
  content: string;
  platform: SocialPlatform;
  historicalEngagementRate?: number;
  audienceFit?: number;
}

export function predictPerformance(input: PerformancePredictionInput) {
  const words = input.content.trim().split(/\s+/).filter(Boolean);
  const questionCount = (input.content.match(/\?/g) ?? []).length;
  const hasCallToAction = /\b(comment|reply|share|save|follow|try|download|join)\b/i.test(
    input.content,
  );
  const hashtagCount = (input.content.match(/#/g) ?? []).length;
  const lengthScore = scoreLength(words.length, input.platform);
  const clarityScore = Math.max(0.45, 1 - Math.max(words.length - 120, 0) / 240);
  const conversationScore = Math.min(1, 0.55 + questionCount * 0.12 + (hasCallToAction ? 0.14 : 0));
  const hashtagScore = hashtagCount === 0 ? 0.72 : hashtagCount <= 4 ? 0.92 : 0.68;
  const history = input.historicalEngagementRate ?? 0.041;
  const audienceFit = input.audienceFit ?? 0.78;
  const platformLift = platformMultipliers[input.platform];

  const engagementRate =
    (0.025 + history * 0.42 + lengthScore * 0.018 + conversationScore * 0.014) *
    platformLift *
    audienceFit;

  const ctr = Math.min(0.19, 0.018 + clarityScore * 0.043 + (hasCallToAction ? 0.022 : 0));
  const viralScore = Math.round(
    Math.min(
      98,
      (lengthScore * 26 + conversationScore * 26 + hashtagScore * 14 + audienceFit * 28) *
        platformLift,
    ),
  );

  return {
    viralScore,
    engagementRate: round(engagementRate, 4),
    ctr: round(ctr, 4),
    confidence: round(Math.min(0.94, 0.62 + audienceFit * 0.24 + (history > 0 ? 0.08 : 0)), 2),
  };
}

function scoreLength(words: number, platform: SocialPlatform) {
  const ideal: Record<SocialPlatform, [number, number]> = {
    TWITTER: [18, 46],
    LINKEDIN: [70, 150],
    INSTAGRAM: [45, 120],
    THREADS: [16, 50],
    FACEBOOK: [45, 110],
    BLUESKY: [18, 48],
    YOUTUBE: [8, 22],
    TIKTOK: [8, 28],
  };

  const [min, max] = ideal[platform];
  if (words >= min && words <= max) return 1;
  if (words < min) return Math.max(0.45, words / min);
  return Math.max(0.42, 1 - (words - max) / max);
}

function round(value: number, places: number) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
