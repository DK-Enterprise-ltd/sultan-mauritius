"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import { localizeFlavor } from "@/lib/catalog-i18n";
import type { Locale } from "@/i18n/routing";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>{t("emptyTitle")}</h1>
        <Link href="/products">
          <Button variant="primary">{t("browse")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("title")}</h1>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.productId} className={styles.row}>
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              {item.flavor && <p className={styles.meta}>{localizeFlavor(item.flavor, locale)}</p>}
              <p className={styles.meta}>{item.sizeMl}ml</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
              className={styles.qty}
            />
            <span className={styles.lineTotal}>{formatMur(item.unitPrice * item.quantity)}</span>
            <button className={styles.remove} onClick={() => removeItem(item.productId)}>
              {t("remove")}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <span>{t("subtotal")}</span>
        <span className={styles.subtotal}>{formatMur(subtotal)}</span>
      </div>

      <Link href="/checkout">
        <Button variant="primary">{t("checkout")}</Button>
      </Link>
    </div>
  );
}
