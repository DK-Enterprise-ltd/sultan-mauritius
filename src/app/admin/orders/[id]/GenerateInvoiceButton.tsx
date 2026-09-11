"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateInvoiceForOrder } from "@/app/actions/invoices";
import styles from "./page.module.css";

export default function GenerateInvoiceButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.generateButton}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await generateInvoiceForOrder(orderId);
          if (result.ok) {
            router.push(`/admin/invoices/${result.invoiceId}`);
          } else {
            alert(result.error);
          }
        })
      }
    >
      {pending ? "Generating…" : "Generate invoice"}
    </button>
  );
}
