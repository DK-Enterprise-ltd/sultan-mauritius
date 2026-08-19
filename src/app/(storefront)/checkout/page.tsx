"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/app/actions/orders";
import { formatMur } from "@/lib/format";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
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
        <p>Your cart is empty — add products before checking out.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Order review</h1>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Delivery details</h2>
          <label className={styles.field}>
            Full name
            <input name="name" required />
          </label>
          <label className={styles.field}>
            Email
            <input name="email" type="email" required />
          </label>
          <label className={styles.field}>
            Phone
            <input name="phone" required />
          </label>
          <label className={styles.field}>
            Company name (wholesale only)
            <input name="companyName" />
          </label>
          <label className={styles.field}>
            Delivery address
            <textarea name="deliveryAddress" required />
          </label>
          <label className={styles.field}>
            Delivery zone / region
            <input name="deliveryZone" />
          </label>
          <label className={styles.field}>
            Order notes
            <textarea name="notes" />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </Button>
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.sectionTitle}>Order summary</h2>
          {items.map((item) => (
            <div key={item.productId} className={styles.summaryRow}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatMur(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>{formatMur(subtotal)}</span>
          </div>

          <div className={styles.payment}>
            <h3>Payment</h3>
            <p>No online payment — settle by bank transfer or cash on delivery.</p>
            <p className={styles.bankDetails}>
              Bank transfer: Sultan Mauritius Ltd · MCB · Account 000123456789
              <br />
              Please use your order number as payment reference.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
