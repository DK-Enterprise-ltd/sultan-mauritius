"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import { localizeFlavor } from "@/lib/catalog-i18n";
import type { Locale } from "@/i18n/routing";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;

  if (!isOpen) return null;

  return (
    <>
      <button type="button" aria-label={t("title")} className={styles.overlay} onClick={closeCart} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={t("title")}>
        <div className={styles.header}>
          <span className={styles.title}>{t("title")}</span>
          <button type="button" className={styles.close} onClick={closeCart}>
            ✕
          </button>
        </div>
        <div className={styles.list}>
          {items.length === 0 ? (
            <p className={styles.empty}>{t("emptyTitle")}</p>
          ) : (
            items.map((item) => (
              <div key={item.productId} className={styles.row}>
                <div className={styles.info}>
                  <p className={styles.name}>{item.name}</p>
                  {item.flavor && <p className={styles.meta}>{localizeFlavor(item.flavor, locale)}</p>}
                  <p className={styles.meta}>{item.sizeMl}ml</p>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label={t("remove")}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button type="button" className={styles.remove} onClick={() => removeItem(item.productId)}>
                      {t("remove")}
                    </button>
                  </div>
                </div>
                <span className={styles.lineTotal}>{formatMur(item.unitPrice * item.quantity)}</span>
              </div>
            ))
          )}
        </div>
        <div className={styles.footer}>
          <div className={styles.subtotalRow}>
            <span>{t("subtotal")}</span>
            <span className={styles.subtotal}>{formatMur(subtotal)}</span>
          </div>
          <Link href="/checkout" onClick={closeCart} className={styles.checkoutLink}>
            {t("checkout")}
          </Link>
        </div>
      </aside>
    </>
  );
}
