"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import Button from "@/components/Button/Button";
import type { PackPhoto } from "@/lib/catalog";
import styles from "./ProductPicker.module.css";

export type Variant = {
  id: string;
  name: string;
  flavor: string | null;
  sizeMl: number;
  packCount: number;
  imageUrl: string | null;
  imageUrl2: string | null;
  packPhotos: PackPhoto[];
  displayPrice: number;
  stockQuantity: number;
};

// Horizontal drag distance (px) that counts as a swipe rather than a tap.
const SWIPE_THRESHOLD_PX = 40;

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  // Front photo, back photo (if any), then pack shots. Each photo carries
  // the bottle count it shows, so moving through the carousel sets the
  // quantity: 1 on a bottle photo, 6/12/24 on a pack photo. Packs are bought
  // as that many single bottles; the bulk discount applies at checkout.
  const photos = [
    ...[selected?.imageUrl ?? imageUrl, selected?.imageUrl2]
      .filter((src): src is string => !!src)
      .map((src) => ({ src, count: 1 })),
    ...(selected?.packPhotos ?? []).map((p) => ({ src: p.url, count: p.count })),
  ];
  const currentPhoto = photos[photoIndex];

  const goToPhoto = (index: number) => {
    const next = (index + photos.length) % photos.length;
    setPhotoIndex(next);
    setQuantity(photos[next].count);
    setAdded(false);
  };

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

              <div
                className={styles.media}
                onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (touchStartX === null || photos.length < 2) return;
                  const dx = e.changedTouches[0].clientX - touchStartX;
                  setTouchStartX(null);
                  if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) goToPhoto(photoIndex + (dx < 0 ? 1 : -1));
                }}
              >
                {currentPhoto && (
                  <Image
                    key={currentPhoto.src}
                    src={currentPhoto.src}
                    alt={displayName}
                    fill
                    sizes="240px"
                    className={styles.image}
                  />
                )}
                {currentPhoto && currentPhoto.count > 1 && (
                  <span className={styles.photoCaption}>{variantLabel(t, currentPhoto.count)}</span>
                )}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.photoNav} ${styles.photoNavPrev}`}
                      aria-label={t("previousPhoto")}
                      onClick={() => goToPhoto(photoIndex - 1)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className={`${styles.photoNav} ${styles.photoNavNext}`}
                      aria-label={t("nextPhoto")}
                      onClick={() => goToPhoto(photoIndex + 1)}
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
                          onClick={() => goToPhoto(i)}
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
                        aria-pressed={v.id === selectedId}
                        className={`${styles.option} ${v.id === selectedId ? styles.optionActive : ""}`}
                        onClick={() => {
                          setSelectedId(v.id);
                          setPhotoIndex(0);
                        }}
                      >
                        <span className={styles.optionLabel}>
                          <span className={styles.optionRadio} aria-hidden />
                          {variantLabel(t, v.packCount)}
                        </span>
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
