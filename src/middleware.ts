import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { rateLimit } from "@/lib/rate-limit";

const intlMiddleware = createMiddleware(routing);

// General browsing limit (page loads), plus a tighter limit for mutating
// requests: admin login, Sanity webhooks, checkout/contact/wholesale form
// submissions, all POSTed as either an API route or a server action to
// the current page. ponytail: two flat buckets, not per-route tuning.
// Split further if one route needs its own ceiling.
const GENERAL = { limit: 120, windowMs: 60_000 };
const SENSITIVE = { limit: 10, windowMs: 60_000 };

function isSensitive(pathname: string, method: string, isServerAction: boolean): boolean {
  return (
    method === "POST" &&
    (pathname.startsWith("/api/") || pathname === "/admin" || pathname.startsWith("/studio") || isServerAction)
  );
}

// Only third-party origins actually referenced by the app (Fontshare CSS/
// fonts, Sanity's asset CDN for productCopy.imageUrl overrides). Keep this
// list in sync with layout.tsx <head> tags and any Sanity-hosted image src.
const CSP_FONT_ORIGIN = "https://api.fontshare.com https://cdn.fontshare.com";
const CSP_IMAGE_ORIGIN = "https://cdn.sanity.io";

// ponytail: script-src stays 'unsafe-inline' rather than per-request
// nonces. A nonce needs to reach both Next's own hydration scripts and the
// static JSON-LD <script> in [locale]/layout.tsx, which means threading a
// request header through next-intl's own createMiddleware() response —
// not guaranteed safe to do blind without a live browser to check
// hydration didn't break. Every other directive is still locked down
// (no object embeds, no framing, no unknown origins), which is most of
// the real-world value; tighten script-src to a nonce once this can be
// verified against a running deployment.
function buildCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    `style-src 'self' 'unsafe-inline' ${CSP_FONT_ORIGIN}`,
    `font-src 'self' ${CSP_FONT_ORIGIN}`,
    `img-src 'self' data: blob: ${CSP_IMAGE_ORIGIN}`,
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export default function middleware(req: NextRequest) {
  // Vercel's own req.ip is the trusted client-IP signal at that edge;
  // x-forwarded-for is client-settable and only used as a local-dev
  // fallback where req.ip isn't populated. Trusting the header first would
  // let an attacker rotate a fake IP per request and bypass rate limits.
  const ip = req.ip || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { pathname } = req.nextUrl;
  // Server actions (createOrder, submitInquiry, loginAdmin, etc.) POST to
  // whatever page they were called from, marked by this header rather than
  // a distinct path. Catch those here instead of guessing every page.
  const isServerAction = req.headers.has("next-action");
  const sensitive = isSensitive(pathname, req.method, isServerAction);
  const bucket = sensitive ? SENSITIVE : GENERAL;
  const { success, resetAt } = rateLimit(`${ip}:${sensitive ? "s" : "g"}`, bucket.limit, bucket.windowMs);

  if (!success) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
    });
  }

  const isAdminOrApi = pathname.startsWith("/api/") || pathname.startsWith("/admin") || pathname.startsWith("/studio");
  const response = isAdminOrApi ? NextResponse.next() : intlMiddleware(req);
  response.headers.set("Content-Security-Policy", buildCsp());
  return response;
}

export const config = {
  // Runs on everything except static assets so rate limiting covers pages,
  // admin, and API routes alike; the handler above routes admin/api past
  // next-intl instead of excluding them from the matcher.
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
