export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.info(
      JSON.stringify({
        level: "info",
        service: "socialpilot-os",
        event: "instrumentation.registered",
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
