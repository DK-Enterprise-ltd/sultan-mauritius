"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitInquiry } from "@/app/actions/inquiries";
import Button from "@/components/Button/Button";
import styles from "./InquiryForm.module.css";

export default function InquiryForm({ wholesale = false }: { wholesale?: boolean }) {
  const t = useTranslations("inquiryForm");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    const form = new FormData(e.currentTarget);
    const result = await submitInquiry({
      type: wholesale ? "WHOLESALE" : "GENERAL",
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || "") || undefined,
      companyName: String(form.get("companyName") || "") || undefined,
      estimatedVolume: String(form.get("estimatedVolume") || "") || undefined,
      message: String(form.get("message") || ""),
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      setStatus("error");
      return;
    }
    setStatus("sent");
    e.currentTarget.reset();
  }

  if (status === "sent") {
    return <p className={styles.success}>{t("success")}</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        {t("name")}
        <input name="name" required />
      </label>
      <label className={styles.field}>
        {t("email")}
        <input name="email" type="email" required />
      </label>
      <label className={styles.field}>
        {t("phone")}
        <input name="phone" />
      </label>
      {wholesale && (
        <>
          <label className={styles.field}>
            {t("companyName")}
            <input name="companyName" required />
          </label>
          <label className={styles.field}>
            {t("estimatedVolume")}
            <input name="estimatedVolume" required />
          </label>
        </>
      )}
      <label className={styles.field}>
        {t("message")}
        <textarea name="message" required />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
