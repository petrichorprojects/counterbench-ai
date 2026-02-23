/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This repo is checked out inside another workspace; avoid Next.js selecting the wrong tracing root.
  outputFileTracingRoot: __dirname,
  eslint: {
    // Build should not fail on lint/tooling patching issues during preview/QA.
    ignoreDuringBuilds: true
  },
  async redirects() {
    return [
      { source: "/pages/advisory.html", destination: "/advisory", permanent: true },
      { source: "/pages/diagnostic.html", destination: "/diagnostic", permanent: true },
      { source: "/pages/insights.html", destination: "/insights", permanent: true },
      { source: "/pages/contact.html", destination: "/contact", permanent: true },
      { source: "/pages/about.html", destination: "/about", permanent: true },
      { source: "/pages/newsletter.html", destination: "/newsletter", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      },
      {
        source: "/css/(.*)",
        // Non-hashed assets must not be immutable; stale CSS breaks navigation UI.
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }]
      },
      {
        source: "/js/(.*)",
        // Non-hashed assets must not be immutable; stale JS can break interactions.
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }]
      },
      {
        source: "/assets/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/logos/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/search-index.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }]
      }
    ];
  }
};

module.exports = nextConfig;
