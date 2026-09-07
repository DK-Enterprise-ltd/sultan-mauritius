import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import styles from "../page.module.css";
import rowStyles from "./page.module.css";
import StockAdjuster from "./StockAdjuster";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  if (!isAdmin()) return null;

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className={styles.title}>Inventory</h1>

      <div className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Name</th>
              <th>Type</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Retail price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.stockQuantity <= p.lowStockThreshold;
              return (
                <tr key={p.id} className={low ? rowStyles.lowRow : undefined}>
                  <td>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className={rowStyles.thumb} />
                    ) : (
                      <span className={rowStyles.thumbPlaceholder} aria-hidden />
                    )}
                  </td>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  <td className={low ? rowStyles.lowValue : undefined}>
                    <StockAdjuster productId={p.id} quantity={p.stockQuantity} />
                  </td>
                  <td>{p.lowStockThreshold}</td>
                  <td>{formatMur(p.retailPrice)}</td>
                  <td>
                    {!p.isActive ? (
                      <span className={rowStyles.inactive}>Inactive</span>
                    ) : low ? (
                      <span className={rowStyles.lowBadge}>Low stock</span>
                    ) : (
                      <span className={rowStyles.okBadge}>OK</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>No products yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
