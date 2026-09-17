"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  timingSafeStringEqual,
} from "@/lib/admin-session";
import { isAdmin } from "@/lib/auth";
import { verifyAdminPassword, setAdminPassword } from "@/lib/admin-credential";

export type AdminLoginState = { error?: string };

export async function loginAdmin(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";

  const valid =
    expectedUsername.length > 0 &&
    timingSafeStringEqual(username, expectedUsername) &&
    (await verifyAdminPassword(password));

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
  // Unlike every other admin action, nothing here writes to a page the
  // client would already have route-cached — except /admin itself, which
  // was just viewed as the authenticated dashboard. Without busting that,
  // the redirect below can serve the stale cached dashboard instead of the
  // login form.
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changeAdminPassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  if (!isAdmin()) return { error: "Not authorized." };

  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!(await verifyAdminPassword(oldPassword))) {
    return { error: "Current password is incorrect." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  await setAdminPassword(newPassword);
  return { success: true };
}
