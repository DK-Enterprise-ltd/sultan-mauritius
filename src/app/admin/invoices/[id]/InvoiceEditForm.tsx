"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InvoiceStatus } from "@prisma/client";
import { updateInvoice } from "@/app/actions/invoices";
import styles from "./page.module.css";

const STATUS_OPTIONS: InvoiceStatus[] = ["DRAFT", "ISSUED", "PAID"];

type Props = {
  invoiceId: string;
  status: InvoiceStatus;
  dueDate: Date | null;
  amountPaid: string; // Decimal crosses the server/client boundary as a string
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function InvoiceEditForm({ invoiceId, status, dueDate, amountPaid }: Props) {
  const [dueDateValue, setDueDateValue] = useState(toDateInputValue(dueDate));
  const [amountPaidValue, setAmountPaidValue] = useState(amountPaid);
  const [statusValue, setStatusValue] = useState<InvoiceStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className={styles.editForm}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await updateInvoice(invoiceId, {
            dueDate: dueDateValue || null,
            amountPaid: Number(amountPaidValue),
            status: statusValue,
          });
          if (result.ok) {
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
    >
      <label className={styles.editField}>
        <span className={styles.definitionLabel}>Due date</span>
        <input
          type="date"
          value={dueDateValue}
          onChange={(e) => setDueDateValue(e.target.value)}
          className={styles.editInput}
        />
      </label>
      <label className={styles.editField}>
        <span className={styles.definitionLabel}>Amount paid (MUR)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountPaidValue}
          onChange={(e) => setAmountPaidValue(e.target.value)}
          className={styles.editInput}
        />
      </label>
      <label className={styles.editField}>
        <span className={styles.definitionLabel}>Status</span>
        <select
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value as InvoiceStatus)}
          className={styles.editInput}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      {error && <p className={styles.editError}>{error}</p>}
      <button type="submit" className={styles.saveButton} disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
