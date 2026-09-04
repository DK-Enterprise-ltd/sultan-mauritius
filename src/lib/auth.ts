import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./admin-session";

// ponytail: customer auth (getViewer) is still stubbed below — real auth
// (sessions/JWT/NextAuth) goes there later. Admin auth is real: a signed
// session cookie checked against ADMIN_USERNAME/ADMIN_PASSWORD, set by
// src/app/actions/admin-auth.ts's loginAdmin action.

export function isAdmin(): boolean {
  return verifyAdminSessionToken(cookies().get(ADMIN_SESSION_COOKIE)?.value);
}

export type Viewer = {
  isB2B: boolean;
  companyName: string | null;
};

/** Demo-only B2B check: set the `sultan_b2b=1` cookie in devtools to preview wholesale pricing. */
export function getViewer(): Viewer {
  // TODO(real-auth): replace with real customer session + Customer.type lookup.
  const isB2B = cookies().get("sultan_b2b")?.value === "1";
  return { isB2B, companyName: isB2B ? "Demo Wholesale Account" : null };
}
