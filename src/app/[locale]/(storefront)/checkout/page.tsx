"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/app/actions/orders";
import { formatMur } from "@/lib/format";
import { STANDARD_DELIVERY_AREAS, PICKUP_OPTION, MIN_B2C_ORDER_MUR, B2C_DELIVERY_FEE_MUR, calculateDeliveryFee } from "@/lib/delivery";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const t = useTranslations("checkout");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zone, setZone] = useState("");
  // ponytail: same devtools-cookie stub as getViewer() server-side (src/lib/
  // auth.ts) — just enough to preview the B2B free-delivery line here; the
  // authoritative fee is always recomputed server-side in createOrder.
  const [isB2B, setIsB2B] = useState(false);
  useEffect(() => {
    setIsB2B(document.cookie.includes("sultan_b2b=1"));
  }, []);

  const isPickup = zone === "" || zone === PICKUP_OPTION;
  const channel = isB2B ? "B2B" : "B2C";
  const deliveryFee = calculateDeliveryFee(channel, isPickup ? undefined : zone);
  const belowMinimum = channel === "B2C" && subtotal < MIN_B2C_ORDER_MUR;

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
        brn: String(form.get("brn") || "") || undefined,
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
    router.push(`/order/${result.id}`);
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

      <div className={`${styles.modeBanner} ${channel === "B2B" ? styles.modeBannerB2B : styles.modeBannerB2C}`}>
        <span className={styles.modeLabel}>{channel === "B2B" ? t("modeB2BLabel") : t("modeB2CLabel")}</span>
        <span className={styles.modeSummary}>
          {channel === "B2B"
            ? t("modeB2BSummary")
            : t("modeB2CSummary", { min: formatMur(MIN_B2C_ORDER_MUR), fee: formatMur(B2C_DELIVERY_FEE_MUR) })}
        </span>
      </div>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>{t("deliveryDetails")}</h2>
          <label className={styles.field}>
            {t("fullName")} *
            <input name="name" required />
          </label>
          <label className={styles.field}>
            {t("email")} *
            <input name="email" type="email" required />
          </label>
          <label className={styles.field}>
            {t("phone")} *
            <input name="phone" required />
          </label>
          <label className={styles.field}>
            {t("companyName")}
            {channel === "B2B" ? " *" : ""}
            <input name="companyName" required={channel === "B2B"} />
          </label>
          {channel === "B2B" && (
            <label className={styles.field}>
              {t("brn")} *
              <input name="brn" required />
            </label>
          )}
          <label className={styles.field}>
            {t("deliveryAddress")} *
            <textarea name="deliveryAddress" required />
          </label>
          <label className={styles.field}>
            {t("deliveryZone")} *
            <select name="deliveryZone" value={zone} onChange={(e) => setZone(e.target.value)} required>
              <option value="" disabled>
                {t("deliveryZonePlaceholder")}
              </option>
              {STANDARD_DELIVERY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
              <option value={PICKUP_OPTION}>{t("outsideAreaOption")}</option>
            </select>
          </label>
          {isPickup && zone !== "" && <p className={styles.notice}>{t("pickupNotice")}</p>}
          <label className={styles.field}>
            {t("orderNotes")}
            <textarea name="notes" />
          </label>

          {channel === "B2B" && (
            <label className={styles.checkboxField}>
              <input type="checkbox" name="agreeB2BTerms" required />
              <span>
                {t("agreeB2BTermsPrefix")}{" "}
                <Link href="/legal/terms-business">{t("agreeB2BTermsLink")}</Link>
              </span>
            </label>
          )}

          {belowMinimum && (
            <p className={styles.notice}>
              {t("belowMinimum", { amount: formatMur(MIN_B2C_ORDER_MUR - subtotal) })}
            </p>
          )}
          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting || belowMinimum}>
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
          <div className={styles.summaryRow}>
            <span>{t("deliveryFeeLabel")}</span>
            <span>{deliveryFee === 0 ? t("free") : formatMur(deliveryFee)}</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>{t("total")}</span>
            <span>{formatMur(subtotal + deliveryFee)}</span>
          </div>
          {channel === "B2C" && (
            <p className={styles.minOrderNote}>{t("minOrderNotice", { amount: formatMur(MIN_B2C_ORDER_MUR) })}</p>
          )}
          {channel === "B2B" && !isPickup && <p className={styles.minOrderNote}>{t("freeDeliveryB2B")}</p>}

          <div className={styles.payment}>
            <h3>{t("payment")}</h3>
            <p>{t("paymentNote")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
