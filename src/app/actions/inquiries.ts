"use server";

import { prisma } from "@/lib/prisma";

type InquiryInput = {
  type: "GENERAL" | "WHOLESALE";
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  estimatedVolume?: string;
  message: string;
};

export async function submitInquiry(input: InquiryInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.name || !input.email || !input.message) {
    return { ok: false, error: "Please fill in your name, email, and message." };
  }

  await prisma.contactInquiry.create({
    data: {
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      companyName: input.companyName || undefined,
      estimatedVolume: input.estimatedVolume || undefined,
      message: input.message,
    },
  });

  return { ok: true };
}
