import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Vercel already redirects http -> https and terminates TLS; HSTS below is
// defense in depth for anyone who somehow reaches the origin over plain
// HTTP first (a stale bookmark, a raw IP, a misconfigured DNS entry).
// Content-Security-Policy lives in src/middleware.ts instead of here — it
// needs to run for every response including the ones next-intl handles.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // X-Frame-Options: DENY everywhere except the invoice PDF route,
      // which the admin invoice page embeds in its own same-origin
      // <iframe> preview. Matching middleware.ts's CSP frame-ancestors
      // exception for the same path — see the comment there for why.
      {
        source: "/:path((?!api/admin/invoices/.+/pdf).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
