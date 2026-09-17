"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import Button from "@/components/Button/Button";
import styles from "./ProductPicker.module.css";

export type Variant = {
  id: string;
  name: string;
  flavor: string | null;
  sizeMl: number;
  packCount: number;
  imageUrl: string | null;
  imageUrl2: string | null;
  displayPrice: number;
  stockQuantity: number;
};

function variantLabel(t: ReturnType<typeof useTranslations>, packCount: number): string {
  if (packCount === 1) return t("single");
  if (packCount === 24) return t("caseLabel", { count: 24 });
  return t("packLabel", { count: packCount });
}

export default function ProductPicker({
  displayName,
  flavor,
  imageUrl,
  variants,
  children,
}: {
  displayName: string;
  flavor: string | null;
  imageUrl: string | null;
  variants: Variant[];
  children: React.ReactNode;
}) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(
    () => variants.find((v) => v.stockQuantity > 0)?.id ?? variants[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  // Front photo first, back photo (if this variant has one) second — most
  // variants only have imageUrl, so photos.length is 1 and no gallery UI shows.
  const photos = [selected?.imageUrl ?? imageUrl, selected?.imageUrl2].filter(
    (src): src is string => !!src
  );

  const close = () => {
    setOpen(false);
    setQuantity(1);
    setAdded(false);
    setPhotoIndex(0);
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        {children}
      </button>

      {open &&
        createPortal(
          <>
            <button type="button" aria-label={t("close")} className={styles.overlay} onClick={close} />
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={displayName}>
              <button type="button" className={styles.close} onClick={close} aria-label={t("close")}>
                ✕
              </button>

              <div className={styles.media}>
                {photos[photoIndex] && (
                  <Image
                    src={photos[photoIndex]}
                    alt={displayName}
                    fill
                    sizes="240px"
                    className={styles.image}
                  />
                )}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.photoNav} ${styles.photoNavPrev}`}
                      aria-label={t("previousPhoto")}
                      onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className={`${styles.photoNav} ${styles.photoNavNext}`}
                      aria-label={t("nextPhoto")}
                      onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                    >
                      ›
                    </button>
                    <div className={styles.photoDots}>
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`${styles.photoDot} ${i === photoIndex ? styles.photoDotActive : ""}`}
                          aria-label={t("goToPhoto", { index: i + 1 })}
                          onClick={() => setPhotoIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className={styles.body}>
                <h2 className={styles.name}>{displayName}</h2>
                {flavor && <p className={styles.flavor}>{flavor}</p>}

                <div className={styles.options}>
                  {variants.map((v) => {
                    const outOfStock = v.stockQuantity <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={outOfStock}
                        className={`${styles.option} ${v.id === selectedId ? styles.optionActive : ""}`}
                        onClick={() => {
                          setSelectedId(v.id);
                          setPhotoIndex(0);
                        }}
                      >
                        <span>{variantLabel(t, v.packCount)}</span>
                        <span className={styles.optionPrice}>
                          {outOfStock ? t("outOfStock") : formatMur(v.displayPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selected && (
                  <>
                    <div className={styles.qtyRow}>
                      <span className={styles.qtyLabel}>{t("quantity")}</span>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        >
                          −
                        </button>
                        <span className={styles.qtyValue}>{quantity}</span>
                        <button type="button" className={styles.qtyBtn} onClick={() => setQuantity((q) => q + 1)}>
                          +
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      className={styles.addButton}
                      disabled={selected.stockQuantity <= 0}
                      onClick={() => {
                        addItem(
                          {
                            productId: selected.id,
                            name: selected.name,
                            flavor: selected.flavor,
                            sizeMl: selected.sizeMl,
                            imageUrl: selected.imageUrl ?? imageUrl,
                            unitPrice: selected.displayPrice,
                          },
                          quantity
                        );
                        setAdded(true);
                        setTimeout(close, 900);
                      }}
                    >
                      {added ? `${t("added")} ✓` : t("addToCart")}
                    </Button>
                  </>
                )}

                <Link href={`/products/${selected?.id ?? ""}`} className={styles.viewDetails} onClick={close}>
                  {t("viewDetails")}
                </Link>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
