"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changeAdminPassword, type ChangePasswordState } from "@/app/actions/admin-auth";
import styles from "./page.module.css";

const initialState: ChangePasswordState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? "Saving…" : "Change password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(async (prevState: ChangePasswordState, formData: FormData) => {
    const result = await changeAdminPassword(prevState, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className={styles.form}>
      <label className={styles.label}>
        Current password *
        <input name="oldPassword" type="password" autoComplete="current-password" required className={styles.input} />
      </label>
      <label className={styles.label}>
        New password *
        <input name="newPassword" type="password" autoComplete="new-password" required minLength={8} className={styles.input} />
      </label>
      <label className={styles.label}>
        Confirm new password *
        <input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className={styles.input} />
      </label>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.success && <p className={styles.success}>Password updated.</p>}
      <SubmitButton />
    </form>
  );
}
