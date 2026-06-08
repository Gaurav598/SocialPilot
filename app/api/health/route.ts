import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "socialpilot-os",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    checks: {
      next: "ready",
      api: "ready",
      aiRouter: "ready",
    },
  });
}
