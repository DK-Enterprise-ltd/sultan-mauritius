"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import { formatSizeMl } from "@/lib/product-lines";
import styles from "./GrignotiCard.module.css";

export type GrignotiCardData = {
  id: string;
  name: string;
  flavor: string | null;
  sizeMl: number | null;
  imageUrl: string | null;
  categoryLabel: string;
  displayPrice: number; // already resolved retail/wholesale by the caller
  stockQuantity: number;
};

const ADDED_FEEDBACK_MS = 1200;

/** A Grignoti Store product tile. Unlike the Sultan ProductCard there is no
 * detail page or pack picker: the button adds one unit straight to the
 * shared cart, and quantity is adjusted from the cart as usual. */
export default function GrignotiCard({ product }: { product: GrignotiCardData }) {
  const t = useTranslations("grignoti");
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stockQuantity <= 0;
  const size = formatSizeMl(product.sizeMl);
  const detail = [product.flavor, size].filter(Boolean).join(" · ");

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
    return () => clearTimeout(id);
  }, [added]);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      flavor: product.flavor,
      sizeMl: product.sizeMl,
      imageUrl: product.imageUrl,
      unitPrice: product.displayPrice,
    });
    setAdded(true);
  };

  return (
    <article className={`${styles.card} ${outOfStock ? styles.soldOut : ""}`}>
      <div className={styles.media}>
        <span className={styles.badge}>{product.categoryLabel}</span>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className={styles.image}
          />
        ) : (
          <span className={styles.placeholder} aria-hidden>
            {product.name.charAt(0)}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        {detail && <p className={styles.detail}>{detail}</p>}
        <div className={styles.footer}>
          <span className={styles.price}>{formatMur(product.displayPrice)}</span>
          <button type="button" className={styles.add} onClick={handleAdd} disabled={outOfStock}>
            {outOfStock ? t("outOfStock") : added ? `${t("added")} ✓` : t("addToCart")}
          </button>
        </div>
      </div>
    </article>
  );
}
