import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import styles from "./ProductCard.module.css";
import ProductPicker, { type Variant } from "./ProductPicker";
import { formatMur } from "@/lib/format";
import { localizeFlavor, localizeProductName } from "@/lib/catalog-i18n";
import type { Locale } from "@/i18n/routing";

export type ProductCardData = {
  id: string;
  name: string;
  type: "STILL" | "SPARKLING";
  flavor: string | null;
  sizeMl: number;
  packCount: number; // 1 = single bottle, 6/24 = a pre-packed multi-buy product
  imageUrl: string | null;
  displayPrice: number; // already resolved retail/wholesale by the caller
  stockQuantity: number;
};

export default function ProductCard({
  product,
  variants,
}: {
  product: ProductCardData;
  index?: number;
  variants: Variant[];
}) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const name = localizeProductName(product.name, locale);
  const flavor = localizeFlavor(product.flavor, locale);
  const sparkling = product.type === "SPARKLING";
  const packLabel =
    product.packCount === 24
      ? t("caseLabel", { count: 24 })
      : product.packCount > 1
        ? t("packLabel", { count: product.packCount })
        : null;
  const allOutOfStock = variants.every((v) => v.stockQuantity <= 0);

  return (
    <div className={`${styles.card} ${sparkling ? styles.sparkling : styles.still}`}>
      <ProductPicker displayName={name} flavor={flavor} imageUrl={product.imageUrl} variants={variants}>
        <div className={styles.media}>
          <span className={styles.lineBadge}>{sparkling ? t("sparkling") : t("still")}</span>
          {packLabel && <span className={styles.packBadge}>{packLabel}</span>}
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={name}
              fill
              draggable={false}
              sizes="(max-width: 640px) 100vw, 320px"
              className={styles.image}
            />
          ) : (
            <span className={styles.mediaLabel}>{product.sizeMl}ml</span>
          )}
        </div>
        <div className={styles.body}>
          <h3 className={styles.name}>{name}</h3>
          {flavor && <p className={styles.flavor}>{flavor}</p>}
          <div className={styles.footer}>
            <span className={styles.price}>{formatMur(product.displayPrice)}</span>
            {allOutOfStock ? (
              <span className={styles.outOfStock}>{t("outOfStock")}</span>
            ) : (
              <span className={styles.selectHint}>{t("select")}</span>
            )}
          </div>
        </div>
      </ProductPicker>
    </div>
  );
}
