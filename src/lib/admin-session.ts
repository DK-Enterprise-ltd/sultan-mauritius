import crypto from "node:crypto";

// ponytail: one shared admin login, not a user table — HMAC-signed cookie
// instead of a sessions table or a JWT library. Swap for real per-user auth
// if the admin panel ever needs more than one login.

export const ADMIN_SESSION_COOKIE = "sultan_admin_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;

function sign(expiresAt: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return crypto.createHmac("sha256", secret).update(expiresAt).digest("hex");
}

export function createAdminSessionToken(): string {
  const expiresAt = String(Date.now() + MAX_AGE_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Date.now() > Number(expiresAt)) return false;

  const expected = Buffer.from(sign(expiresAt));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
