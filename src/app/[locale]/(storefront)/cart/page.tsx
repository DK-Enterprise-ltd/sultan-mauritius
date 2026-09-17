"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import { localizeFlavor } from "@/lib/catalog-i18n";
import { MIN_B2C_ORDER_MUR } from "@/lib/delivery";
import type { Locale } from "@/i18n/routing";
import Button from "@/components/Button/Button";
import DeliveryAreaCheck from "@/components/DeliveryAreaCheck/DeliveryAreaCheck";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  // ponytail: same devtools-cookie B2B stub used at checkout (src/lib/auth.ts's
  // getViewer()) — just enough to preview the B2C minimum here; createOrder
  // still re-checks it server-side.
  const [isB2B, setIsB2B] = useState(false);
  useEffect(() => {
    setIsB2B(document.cookie.includes("sultan_b2b=1"));
  }, []);
  const belowMinimum = !isB2B && subtotal < MIN_B2C_ORDER_MUR;

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
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.name} width={64} height={64} className={styles.thumb} />
            ) : (
              <span className={styles.thumbPlaceholder} aria-hidden />
            )}
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              {item.flavor && <p className={styles.meta}>{localizeFlavor(item.flavor, locale)}</p>}
              <p className={styles.meta}>{item.sizeMl}ml</p>
            </div>
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
            </div>
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

      <DeliveryAreaCheck />

      {belowMinimum && (
        <p className={styles.notice}>
          {t("belowMinimum", { amount: formatMur(MIN_B2C_ORDER_MUR - subtotal) })}
        </p>
      )}

      {belowMinimum ? (
        <Button variant="primary" disabled>
          {t("checkout")}
        </Button>
      ) : (
        <Link href="/checkout">
          <Button variant="primary">{t("checkout")}</Button>
        </Link>
      )}
    </div>
  );
}
