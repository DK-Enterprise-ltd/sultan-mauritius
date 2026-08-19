import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./page.module.css";

const TYPE_FILTERS = [
  { label: "All", value: undefined },
  { label: "Sparkling", value: "SPARKLING" as const },
  { label: "Still", value: "STILL" as const },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
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
        <h1 className={styles.title}>Shop</h1>
        {viewer.isB2B && <p className={styles.wholesaleNote}>Wholesale pricing applied</p>}
      </div>

      <div className={styles.filters}>
        {TYPE_FILTERS.map((f) => (
          <a
            key={f.label}
            href={f.value ? `/products?type=${f.value}` : "/products"}
            className={`${styles.filter} ${type === f.value ? styles.filterActive : ""}`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>No products in this category yet.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
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
