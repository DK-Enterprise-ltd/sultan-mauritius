import { cookies } from "next/headers";

// ponytail: stubbed auth. Real auth (sessions/JWT/NextAuth) goes here later —
// swap these two functions for real session lookups without touching callers.

export function isAdmin(): boolean {
  // TODO(real-auth): replace with an actual admin session check.
  return true;
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
