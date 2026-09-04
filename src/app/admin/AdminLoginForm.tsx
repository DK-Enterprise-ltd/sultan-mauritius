"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAdmin, type AdminLoginState } from "@/app/actions/admin-auth";
import styles from "./layout.module.css";

const initialState: AdminLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.loginSubmit} disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function AdminLoginForm() {
  const [state, formAction] = useFormState(loginAdmin, initialState);

  return (
    <form action={formAction} className={styles.loginForm}>
      <h1 className={styles.loginTitle}>Sultan Admin</h1>
      <label className={styles.loginLabel}>
        Username
        <input name="username" type="text" autoComplete="username" required className={styles.loginInput} />
      </label>
      <label className={styles.loginLabel}>
        Password
        <input name="password" type="password" autoComplete="current-password" required className={styles.loginInput} />
      </label>
      {state.error && <p className={styles.loginError}>{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
