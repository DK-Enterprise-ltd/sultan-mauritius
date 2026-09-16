import crypto from "node:crypto";
import { prisma } from "./prisma";
import { timingSafeStringEqual } from "./admin-session";

const SINGLETON_ID = "singleton";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/** Falls back to ADMIN_PASSWORD until an admin sets one via setAdminPassword. */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const row = await prisma.adminCredential.findUnique({ where: { id: SINGLETON_ID } });
  if (row) return verifyHash(password, row.passwordHash);
  return timingSafeStringEqual(password, process.env.ADMIN_PASSWORD ?? "");
}

export async function setAdminPassword(password: string): Promise<void> {
  const passwordHash = hashPassword(password);
  await prisma.adminCredential.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, passwordHash },
    update: { passwordHash },
  });
}
