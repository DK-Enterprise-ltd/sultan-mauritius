"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendInvoice } from "@/app/actions/invoices";
import styles from "./page.module.css";

export default function SendInvoiceButton({ invoiceId, alreadySent }: { invoiceId: string; alreadySent: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className={styles.sendPanel}>
      <button
        type="button"
        className={styles.sendButton}
        disabled={pending}
        onClick={() => {
          setError(null);
          setSent(false);
          startTransition(async () => {
            const result = await sendInvoice(invoiceId);
            if (result.ok) {
              setSent(true);
              router.refresh();
            } else {
              setError(result.error);
            }
          });
        }}
      >
        {pending ? "Sending…" : alreadySent ? "Resend invoice" : "Send invoice"}
      </button>
      {sent && <p className={styles.sendSuccess}>Invoice emailed to the customer.</p>}
      {error && <p className={styles.editError}>{error}</p>}
    </div>
  );
}
