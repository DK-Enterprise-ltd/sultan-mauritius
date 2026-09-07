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
  return method === "POST" && (pathname.startsWith("/api/") || pathname === "/admin" || isServerAction);
}

export default function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "unknown";
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

  if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  return intlMiddleware(req);
}

export const config = {
  // Runs on everything except static assets so rate limiting covers pages,
  // admin, and API routes alike; the handler above routes admin/api past
  // next-intl instead of excluding them from the matcher.
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
