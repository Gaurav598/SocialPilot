export type SocialPlatform =
  | "TWITTER"
  | "LINKEDIN"
  | "INSTAGRAM"
  | "THREADS"
  | "FACEBOOK"
  | "BLUESKY"
  | "YOUTUBE"
  | "TIKTOK";

export type AgentKind =
  | "research"
  | "content"
  | "optimization"
  | "repurposing"
  | "scheduling"
  | "analytics";

export type MemoryKind = "short_term" | "long_term" | "episodic" | "semantic";

export type OperatingMode = "assist" | "autopilot";

export type ApprovalState = "draft" | "needs_review" | "approved" | "scheduled";

export interface WorkspaceProfile {
  id: string;
  name: string;
  plan: "free" | "pro" | "premium" | "enterprise";
  mode: OperatingMode;
  timezone: string;
  brandVoice: string;
  audience: string;
}

export interface AgentSignal {
  id: string;
  kind: AgentKind;
  name: string;
  status: "idle" | "running" | "ready" | "blocked";
  confidence: number;
  summary: string;
  nextAction: string;
  costUsd: number;
  tokens: number;
}

export interface PipelineItem {
  id: string;
  title: string;
  platform: SocialPlatform;
  stage: "idea" | "draft" | "review" | "scheduled" | "published";
  owner: string;
  score: number;
  dueAt: string;
  approval: ApprovalState;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  subject: string;
  severity: "info" | "success" | "warning" | "critical";
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

export interface ChartPoint {
  label: string;
  reach: number;
  engagement: number;
  ctr: number;
}

export interface ListeningSignal {
  id: string;
  keyword: string;
  velocity: number;
  sentiment: "positive" | "neutral" | "negative";
  opportunity: string;
  recommendedAngle: string;
}

export interface MemoryRecord {
  id: string;
  kind: MemoryKind;
  title: string;
  content: string;
  weight: number;
  updatedAt: string;
}

export interface ApprovalTask {
  id: string;
  title: string;
  requester: string;
  reviewers: string[];
  state: ApprovalState;
  dueAt: string;
}

export interface CampaignRecommendation {
  id: string;
  title: string;
  objective: string;
  suggestedChannels: SocialPlatform[];
  predictedLift: number;
  rationale: string;
}

export interface CommandCenterSnapshot {
  workspace: WorkspaceProfile;
  metrics: AnalyticsMetric[];
  chart: ChartPoint[];
  agents: AgentSignal[];
  pipeline: PipelineItem[];
  timeline: TimelineEvent[];
  listening: ListeningSignal[];
  memories: MemoryRecord[];
  approvals: ApprovalTask[];
  recommendations: CampaignRecommendation[];
}

export interface AgentOrchestrationInput {
  objective: string;
  sourceContent?: string;
  platforms: SocialPlatform[];
  mode?: OperatingMode;
  brandVoice?: string;
  audience?: string;
}

export interface AgentOutput {
  agent: AgentKind;
  title: string;
  content: string;
  confidence: number;
  citations: string[];
}

export interface AgentOrchestrationResult {
  objective: string;
  outputs: AgentOutput[];
  recommendedSchedule: Array<{
    platform: SocialPlatform;
    bestTime: string;
    reason: string;
  }>;
  predictedPerformance: {
    viralScore: number;
    engagementRate: number;
    ctr: number;
    confidence: number;
  };
  approvalRequired: boolean;
  provider: string;
  estimatedCostUsd: number;
  tokens: number;
}
