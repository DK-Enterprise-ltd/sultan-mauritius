"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
} from "@/lib/admin-session";

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export type AdminLoginState = { error?: string };

export async function loginAdmin(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";

  const valid =
    expectedUsername.length > 0 &&
    expectedPassword.length > 0 &&
    timingSafeStringEqual(username, expectedUsername) &&
    timingSafeStringEqual(password, expectedPassword);

  if (!valid) {
    return { error: "Incorrect username or password." };
  }

  cookies().set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Not scoped to "/admin": the admin API routes the panel calls (PDF
    // downloads, etc.) live under /api/admin/..., a sibling path the
    // browser would never attach an "/admin"-scoped cookie to. Cookie
    // scoping is a prefix match on the raw path, not "anything admin-ish".
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  // Cookies are deleted by exact name+path match, so this must mirror
  // whatever path the cookie was actually set with. Delete both: "/" is
  // what login sets now, but any session created before this cookie was
  // widened from path: "/admin" still has the old-path cookie live in that
  // browser, and it needs clearing too.
  cookies().delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
  cookies().delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
  redirect("/admin");
}
