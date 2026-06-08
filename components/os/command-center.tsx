"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  AgentOrchestrationResult,
  CommandCenterSnapshot,
  PipelineItem,
  SocialPlatform,
} from "@/lib/social-os/types";
import {
  Activity,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  LineChart,
  Radio,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const platformOptions: SocialPlatform[] = ["LINKEDIN", "TWITTER", "INSTAGRAM", "THREADS"];

export function CommandCenter({ initialSnapshot }: { initialSnapshot: CommandCenterSnapshot }) {
  const [autopilotEnabled, setAutopilotEnabled] = React.useState(
    initialSnapshot.workspace.mode === "autopilot",
  );
  const [objective, setObjective] = React.useState(
    "Launch an AI autopilot campaign that turns one founder insight into a week of platform-native content.",
  );
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<SocialPlatform[]>([
    "LINKEDIN",
    "TWITTER",
  ]);
  const [pipeline, setPipeline] = React.useState<PipelineItem[]>(initialSnapshot.pipeline);
  const [isRunning, setIsRunning] = React.useState(false);
  const [agentResult, setAgentResult] = React.useState<AgentOrchestrationResult | null>(null);

  const approveItem = (id: string) => {
    setPipeline((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              stage: "scheduled",
              approval: "approved",
              score: Math.min(99, item.score + 3),
            }
          : item,
      ),
    );
    toast.success("Approval saved optimistically");
  };

  const runAgents = async () => {
    setIsRunning(true);
    setAgentResult(null);

    try {
      const response = await fetch("/api/ai/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          platforms: selectedPlatforms,
          mode: autopilotEnabled ? "autopilot" : "assist",
          brandVoice: initialSnapshot.workspace.brandVoice,
          audience: initialSnapshot.workspace.audience,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to run agent pipeline");
      }
      setAgentResult(data.result);
      toast.success("Agent pipeline completed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to run agent pipeline");
    } finally {
      setIsRunning(false);
    }
  };

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  };

  return (
    <div className="min-h-full bg-background">
      <section className="border-b border-border/70 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-md">
                V2 Operating System
              </Badge>
              <Badge variant={autopilotEnabled ? "default" : "outline"} className="rounded-md">
                {autopilotEnabled ? "Autopilot armed" : "Assist mode"}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              AI Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Research trends, generate campaigns, predict performance, route approvals, and keep the content pipeline moving from one operator-grade workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">AI Autopilot Mode</div>
              <div className="text-xs text-muted-foreground">Human approval is still required</div>
            </div>
            <Switch
              checked={autopilotEnabled}
              onCheckedChange={setAutopilotEnabled}
              aria-label="Toggle AI autopilot mode"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-3 border-b border-border/70 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {initialSnapshot.metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <TrendingUp
                className={cn(
                  "size-4",
                  metric.trend === "up" && "text-emerald-600 dark:text-emerald-400",
                  metric.trend === "down" && "text-destructive",
                  metric.trend === "flat" && "text-muted-foreground",
                )}
              />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{metric.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{metric.delta}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:px-8">
        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader className="border-b border-border/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <WandSparkles className="size-4 text-primary" />
                  AI Copilot Workspace
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((platform) => (
                    <Button
                      key={platform}
                      type="button"
                      variant={selectedPlatforms.includes(platform) ? "secondary" : "outline"}
                      size="sm"
                      className="h-7"
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Textarea
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                className="min-h-28 resize-none"
                aria-label="Campaign objective"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">RAG context enabled</span>
                  <span className="rounded-md bg-muted px-2 py-1">Memory aware</span>
                  <span className="rounded-md bg-muted px-2 py-1">Provider fallback</span>
                </div>
                <Button onClick={runAgents} disabled={isRunning || selectedPlatforms.length === 0}>
                  {isRunning ? (
                    <>
                      <Activity className="size-4 animate-pulse" />
                      Running agents
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Run pipeline
                    </>
                  )}
                </Button>
              </div>

              {isRunning && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              )}

              {agentResult && (
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Zap className="size-4 text-primary" />
                      Prediction
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <MetricMini label="Viral" value={`${agentResult.predictedPerformance.viralScore}`} />
                      <MetricMini
                        label="Engage"
                        value={`${Math.round(agentResult.predictedPerformance.engagementRate * 1000) / 10}%`}
                      />
                      <MetricMini
                        label="CTR"
                        value={`${Math.round(agentResult.predictedPerformance.ctr * 1000) / 10}%`}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Brain className="size-4 text-primary" />
                      Model routing
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Provider {agentResult.provider}, {agentResult.tokens.toLocaleString()} tokens, estimated ${agentResult.estimatedCostUsd.toFixed(4)}.
                    </div>
                  </div>
                  {agentResult.outputs.slice(0, 4).map((output) => (
                    <div key={output.agent} className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{output.title}</div>
                        <Badge variant="outline" className="rounded-md">
                          {Math.round(output.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="line-clamp-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                        {output.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="rounded-lg">
              <CardHeader className="border-b border-border/70">
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="size-4 text-primary" />
                  Growth Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex h-56 items-end gap-2">
                  {initialSnapshot.chart.map((point) => (
                    <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                      <div className="flex h-44 w-full items-end gap-1 rounded-md bg-muted/50 p-1">
                        <div
                          className="w-full rounded-sm bg-primary"
                          style={{ height: `${point.reach}%` }}
                          aria-label={`${point.label} reach ${point.reach}`}
                        />
                        <div
                          className="w-full rounded-sm bg-sky-500"
                          style={{ height: `${point.engagement}%` }}
                          aria-label={`${point.label} engagement ${point.engagement}`}
                        />
                        <div
                          className="w-full rounded-sm bg-amber-500"
                          style={{ height: `${point.ctr}%` }}
                          aria-label={`${point.label} CTR ${point.ctr}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{point.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <Legend color="bg-primary" label="Reach" />
                  <Legend color="bg-sky-500" label="Engagement" />
                  <Legend color="bg-amber-500" label="CTR" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader className="border-b border-border/70">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="size-4 text-primary" />
                  Social Listening
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/70 p-0">
                {initialSnapshot.listening.map((signal) => (
                  <div key={signal.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{signal.keyword}</div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {signal.opportunity}
                        </p>
                      </div>
                      <Badge variant="secondary" className="rounded-md">
                        {signal.velocity}
                      </Badge>
                    </div>
                    <div className="mt-3 rounded-md bg-muted/60 p-3 text-sm">
                      {signal.recommendedAngle}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader className="border-b border-border/70">
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                Agent Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/70 p-0">
              {initialSnapshot.agents.map((agent) => (
                <div key={agent.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{agent.name}</div>
                    <Badge
                      variant={agent.status === "running" ? "default" : "secondary"}
                      className="rounded-md"
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{agent.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(agent.confidence * 100)}% confidence</span>
                    <span>{agent.tokens.toLocaleString()} tokens</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="border-b border-border/70">
              <CardTitle className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/70 p-0">
              {pipeline.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{item.platform}</span>
                        <span>{item.stage}</span>
                        <span>{item.owner}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-md">
                      {item.score}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatRelative(item.dueAt)}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={item.approval === "approved" ? "secondary" : "outline"}
                      onClick={() => approveItem(item.id)}
                    >
                      <CheckCircle2 className="size-4" />
                      {item.approval === "approved" ? "Approved" : "Approve"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-4 border-t border-border/70 px-4 py-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Card className="rounded-lg lg:col-span-2">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/70 p-0">
            {initialSnapshot.timeline.map((event) => (
              <div key={event.id} className="grid gap-2 p-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                <div className="text-xs text-muted-foreground">{formatRelative(event.timestamp)}</div>
                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{event.actor}</span> {event.action}{" "}
                    <span className="text-muted-foreground">{event.subject}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Approval Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {initialSnapshot.approvals.map((approval) => (
              <div key={approval.id} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="font-medium">{approval.title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  {approval.reviewers.join(", ")}
                  <Calendar className="ml-2 size-3" />
                  {formatRelative(approval.dueAt)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-border/70 px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {initialSnapshot.recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Repeat2 className="size-4 text-primary" />
                    {recommendation.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {recommendation.rationale}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-md">
                  +{recommendation.predictedLift}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background p-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-2 rounded-full", color)} />
      {label}
    </span>
  );
}

function formatRelative(value: string) {
  const delta = new Date(value).getTime() - Date.now();
  const minutes = Math.round(Math.abs(delta) / 60_000);
  if (minutes < 60) return delta >= 0 ? `in ${minutes}m` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return delta >= 0 ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return delta >= 0 ? `in ${days}d` : `${days}d ago`;
}
