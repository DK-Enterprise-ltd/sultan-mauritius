"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateBulkDiscountPercent, type UpdateBulkDiscountState } from "@/app/actions/pricing";
import styles from "./page.module.css";

const initialState: UpdateBulkDiscountState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function BulkDiscountForm({ currentPercent }: { currentPercent: string }) {
  const [state, formAction] = useFormState(updateBulkDiscountPercent, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label className={styles.label}>
        Bulk discount (%) — applied automatically once an order line has 7+
        units of the same product
        <input
          name="bulkDiscountPercent"
          type="number"
          min={0}
          max={100}
          step="0.01"
          defaultValue={currentPercent}
          required
          className={styles.input}
        />
      </label>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.success && <p className={styles.success}>Bulk discount updated.</p>}
      <SubmitButton />
    </form>
  );
}
