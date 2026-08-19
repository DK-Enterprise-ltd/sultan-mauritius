import Image from "next/image";
import styles from "./ProductCard.module.css";
import AddToCartButton from "./AddToCartButton";
import { formatMur } from "@/lib/format";

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
// grid reads as bold color-blocking rather than one repeated hue.
const SPARKLING_ACCENTS = ["sky", "plum", "green"] as const;

function accentFor(product: ProductCardData): string {
  if (product.type === "STILL") return "navy";
  const hash = product.name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return SPARKLING_ACCENTS[hash % SPARKLING_ACCENTS.length];
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className={styles.card}>
      <div className={`${styles.media} ${styles[accentFor(product)]}`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className={styles.image}
          />
        ) : (
          <span className={styles.mediaLabel}>{product.sizeMl}ml</span>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.type}>{product.type === "SPARKLING" ? "Sparkling" : "Still"}</p>
        <h3 className={styles.name}>{product.name}</h3>
        {product.flavor && <p className={styles.flavor}>{product.flavor}</p>}
        <div className={styles.footer}>
          <span className={styles.price}>{formatMur(product.displayPrice)}</span>
          {outOfStock ? (
            <span className={styles.outOfStock}>Out of stock</span>
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
