"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/Button/Button";
import styles from "./not-found.module.css";

// Server Components can't receive params in not-found.tsx (a documented
// Next.js limitation), so this reads the active locale from next-intl's
// client context instead of route params.
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.body}>{t("body")}</p>
      <div className={styles.actions}>
        <Link href="/products">
          <Button variant="primary">{t("cta")}</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">{t("ctaHome")}</Button>
        </Link>
      </div>
    </div>
  );
}
