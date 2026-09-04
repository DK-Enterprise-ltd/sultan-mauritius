"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/app/actions/orders";
import { formatMur } from "@/lib/format";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const t = useTranslations("checkout");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const result = await createOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customer: {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        companyName: String(form.get("companyName") || "") || undefined,
        deliveryAddress: String(form.get("deliveryAddress") || ""),
        deliveryZone: String(form.get("deliveryZone") || "") || undefined,
      },
      notes: String(form.get("notes") || "") || undefined,
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    clear();
    router.push(`/order/${result.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <p>{t("emptyNotice")}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("title")}</h1>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>{t("deliveryDetails")}</h2>
          <label className={styles.field}>
            {t("fullName")}
            <input name="name" required />
          </label>
          <label className={styles.field}>
            {t("email")}
            <input name="email" type="email" required />
          </label>
          <label className={styles.field}>
            {t("phone")}
            <input name="phone" required />
          </label>
          <label className={styles.field}>
            {t("companyName")}
            <input name="companyName" />
          </label>
          <label className={styles.field}>
            {t("deliveryAddress")}
            <textarea name="deliveryAddress" required />
          </label>
          <label className={styles.field}>
            {t("deliveryZone")}
            <input name="deliveryZone" />
          </label>
          <label className={styles.field}>
            {t("orderNotes")}
            <textarea name="notes" />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? t("placingOrder") : t("placeOrder")}
          </Button>
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.sectionTitle}>{t("orderSummary")}</h2>
          {items.map((item) => (
            <div key={item.productId} className={styles.summaryRow}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatMur(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className={styles.summaryTotal}>
            <span>{t("total")}</span>
            <span>{formatMur(subtotal)}</span>
          </div>

          <div className={styles.payment}>
            <h3>{t("payment")}</h3>
            <p>{t("paymentNote")}</p>
            <p className={styles.bankDetails}>{t("bankDetails")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
