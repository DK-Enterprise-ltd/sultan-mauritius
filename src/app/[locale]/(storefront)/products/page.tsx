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

  const TYPE_FILTERS = [
    { label: t("filterAll"), value: undefined },
    { label: t("filterSparkling"), value: "SPARKLING" as const },
    { label: t("filterStill"), value: "STILL" as const },
  ];

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

      <div className={styles.filters}>
        {TYPE_FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/products?type=${f.value}` : "/products"}
            className={`${styles.filter} ${type === f.value ? styles.filterActive : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

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
