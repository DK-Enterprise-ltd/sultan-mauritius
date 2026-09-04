import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./ProductCard.module.css";
import AddToCartButton from "./AddToCartButton";
import { formatMur } from "@/lib/format";
import { localizeFlavor, localizeProductName } from "@/lib/catalog-i18n";
import { caseSizeFor } from "@/lib/case-size";
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

export default function ProductCard({
  product,
  isB2B,
}: {
  product: ProductCardData;
  index?: number;
  isB2B?: boolean;
}) {
  const outOfStock = product.stockQuantity <= 0;
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const name = localizeProductName(product.name, locale);
  const flavor = localizeFlavor(product.flavor, locale);
  const sparkling = product.type === "SPARKLING";

  return (
    <div className={`${styles.card} ${sparkling ? styles.sparkling : styles.still}`}>
      <Link href={`/products/${product.id}`} className={styles.media}>
        <span className={styles.lineBadge}>{sparkling ? t("sparkling") : t("still")}</span>
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
      </Link>
      <div className={styles.body}>
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
              isB2B={isB2B}
              caseSize={caseSizeFor(product.sizeMl)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
