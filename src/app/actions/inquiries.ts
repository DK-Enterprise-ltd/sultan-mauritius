"use server";

import { prisma } from "@/lib/prisma";
import { cleanStr, isValidEmail } from "@/lib/validate";

type InquiryInput = {
  type: "GENERAL" | "WHOLESALE";
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  estimatedVolume?: string;
  message: string;
  /** Hidden form field: real visitors never fill it in, bots filling every
   * field do. Silently drop instead of erroring, so bots don't learn why. */
  website?: string;
};

export async function submitInquiry(input: InquiryInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.website) {
    return { ok: true };
  }
  if (input.type !== "GENERAL" && input.type !== "WHOLESALE") {
    return { ok: false, error: "Invalid inquiry type." };
  }

  const name = cleanStr(input.name, 200);
  const email = cleanStr(input.email, 254).toLowerCase();
  const message = cleanStr(input.message, 4000);
  if (!name || !isValidEmail(email) || !message) {
    return { ok: false, error: "Please fill in your name, a valid email, and message." };
  }

  await prisma.contactInquiry.create({
    data: {
      type: input.type,
      name,
      email,
      phone: input.phone ? cleanStr(input.phone, 40) : undefined,
      companyName: input.companyName ? cleanStr(input.companyName, 200) : undefined,
      estimatedVolume: input.estimatedVolume ? cleanStr(input.estimatedVolume, 100) : undefined,
      message,
    },
  });

  return { ok: true };
}
