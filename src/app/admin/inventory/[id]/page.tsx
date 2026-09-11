import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import pageStyles from "../../page.module.css";
import StockAdjuster from "../StockAdjuster";
import ProductStatusToggle from "../ProductStatusToggle";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({ params }: { params: { id: string } }) {
  if (!isAdmin()) return null;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { order: true },
      },
    },
  });
  if (!product) notFound();

  const low = product.stockQuantity <= product.lowStockThreshold;

  return (
    <div>
      <div className={styles.toolbar}>
        <Link href="/admin/inventory" className={styles.back}>
          ← Back to inventory
        </Link>
      </div>

      <div className={styles.grid}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className={styles.image} />
        ) : (
          <span className={styles.imagePlaceholder} aria-hidden />
        )}

        <div>
          <div className={styles.headerRow}>
            <h1 className={pageStyles.title}>{product.name}</h1>
          </div>
          <p className={styles.sku}>
            {product.sku} {product.flavor ? `· ${product.flavor}` : ""}
          </p>

          <div className={styles.definitionGrid}>
            <div className={styles.definitionRow}>
              <span className={styles.definitionLabel}>Type</span>
              <span className={styles.definitionValue}>{product.type}</span>
            </div>
            <div className={styles.definitionRow}>
              <span className={styles.definitionLabel}>Size</span>
              <span className={styles.definitionValue}>
                {product.sizeMl}ml {product.packCount > 1 ? `× ${product.packCount}` : ""}
              </span>
            </div>
            <div className={styles.definitionRow}>
              <span className={styles.definitionLabel}>Retail price</span>
              <span className={styles.definitionValue}>{formatMur(product.retailPrice)}</span>
            </div>
            <div className={styles.definitionRow}>
              <span className={styles.definitionLabel}>Wholesale price</span>
              <span className={styles.definitionValue}>
                {product.wholesalePrice ? formatMur(product.wholesalePrice) : "— (falls back to retail)"}
              </span>
            </div>
            <div className={styles.definitionRow}>
              <span className={styles.definitionLabel}>Low stock threshold</span>
              <span className={styles.definitionValue}>{product.lowStockThreshold}</span>
            </div>
          </div>

          <div className={styles.controlsRow}>
            <StockAdjuster productId={product.id} quantity={product.stockQuantity} />
            <ProductStatusToggle productId={product.id} isActive={product.isActive} isLowStock={low} />
          </div>
        </div>
      </div>

      <div className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Recent stock movements</h2>
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Change</th>
              <th>Order</th>
            </tr>
          </thead>
          <tbody>
            {product.stockMovements.map((m) => (
              <tr key={m.id}>
                <td>{m.createdAt.toLocaleString("en-MU")}</td>
                <td>{m.type}</td>
                <td>{m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}</td>
                <td>
                  {m.order ? (
                    <Link href={`/admin/orders/${m.order.id}`}>#{m.order.orderNumber}</Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {product.stockMovements.length === 0 && (
              <tr>
                <td colSpan={4} className={pageStyles.empty}>
                  No stock movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
