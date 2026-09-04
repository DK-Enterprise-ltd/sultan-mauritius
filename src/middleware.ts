import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip admin (internal, English-only), API routes, static assets.
  matcher: ["/((?!api|admin|_next|favicon.ico|.*\\..*).*)"],
};
