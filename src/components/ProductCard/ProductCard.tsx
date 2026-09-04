import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./ProductCard.module.css";
import AddToCartButton from "./AddToCartButton";
import { formatMur } from "@/lib/format";
import { localizeFlavor, localizeProductName } from "@/lib/catalog-i18n";
import type { Locale } from "@/i18n/routing";

export type ProductCardData = {
  id: string;
  name: string;
  type: "STILL" | "SPARKLING";
  flavor: string | null;
  sizeMl: number;
  imageUrl: string | null;
  displayPrice: number; // already resolved retail/wholesale by the caller
  stockQuantity: number;
};

// ponytail: rotate through the brand accents for sparkling flavors so the
// grid reads as bold color-blocking rather than one repeated hue. Cycled
// by grid position (not a string hash) so same-named flavor variants
// (all "Sultan Sparkling") still spread across accents deterministically.
const SPARKLING_ACCENTS = ["sky", "plum", "green"] as const;

function accentFor(product: ProductCardData, index: number): string {
  if (product.type === "STILL") return "navy";
  return SPARKLING_ACCENTS[index % SPARKLING_ACCENTS.length];
}

export default function ProductCard({
  product,
  index = 0,
}: {
  product: ProductCardData;
  index?: number;
}) {
  const outOfStock = product.stockQuantity <= 0;
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const name = localizeProductName(product.name, locale);
  const flavor = localizeFlavor(product.flavor, locale);

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.id}`} className={`${styles.media} ${styles[accentFor(product, index)]}`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className={styles.image}
          />
        ) : (
          <span className={styles.mediaLabel}>{product.sizeMl}ml</span>
        )}
      </Link>
      <div className={styles.body}>
        <p className={styles.type}>{product.type === "SPARKLING" ? t("sparkling") : t("still")}</p>
        <Link href={`/products/${product.id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{name}</h3>
        </Link>
        {flavor && <p className={styles.flavor}>{flavor}</p>}
        <div className={styles.footer}>
          <span className={styles.price}>{formatMur(product.displayPrice)}</span>
          {outOfStock ? (
            <span className={styles.outOfStock}>{t("outOfStock")}</span>
          ) : (
            <AddToCartButton
              productId={product.id}
              name={product.name}
              flavor={product.flavor}
              sizeMl={product.sizeMl}
              unitPrice={product.displayPrice}
            />
          )}
        </div>
      </div>
    </div>
  );
}
