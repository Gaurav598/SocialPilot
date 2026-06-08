import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],    
  },
  allowedDevOrigins:[
    "yolande-sistroid-jenee.ngrok-free.dev"
  ],
  async headers() {
    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      {
        key: "Content-Security-Policy-Report-Only",
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://img.clerk.com https://*.clerk.com; font-src 'self' data:; connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com; frame-src https://*.clerk.accounts.dev https://*.clerk.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
