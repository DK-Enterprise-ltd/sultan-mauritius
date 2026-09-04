import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./page.module.css";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const t = await getTranslations("products");
  const viewer = getViewer();
  const type = searchParams.type === "SPARKLING" || searchParams.type === "STILL"
    ? searchParams.type
    : undefined;

  const products = await prisma.product.findMany({
    where: { isActive: true, ...(type ? { type } : {}) },
    orderBy: { name: "asc" },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        {viewer.isB2B && <p className={styles.wholesaleNote}>{t("wholesaleNote")}</p>}
      </div>

      <div className={styles.lanes}>
        <Link
          href={type === "SPARKLING" ? "/products" : "/products?type=SPARKLING"}
          className={`${styles.lane} ${styles.laneSparkling} ${type === "SPARKLING" ? styles.laneActive : ""}`}
        >
          <span className={styles.laneTitle}>{t("filterSparkling")}</span>
          <span className={styles.laneNote}>{t("laneSparklingNote")}</span>
        </Link>
        <Link
          href={type === "STILL" ? "/products" : "/products?type=STILL"}
          className={`${styles.lane} ${styles.laneStill} ${type === "STILL" ? styles.laneActive : ""}`}
        >
          <span className={styles.laneTitle}>{t("filterStill")}</span>
          <span className={styles.laneNote}>{t("laneStillNote")}</span>
        </Link>
      </div>

      {type && (
        <Link href="/products" className={styles.clearFilter}>
          {t("filterAll")}
        </Link>
      )}

      {products.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              index={index}
              product={{
                id: product.id,
                name: product.name,
                type: product.type,
                flavor: product.flavor,
                sizeMl: product.sizeMl,
                imageUrl: product.imageUrl,
                displayPrice: resolvePrice(product, viewer),
                stockQuantity: product.stockQuantity,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
