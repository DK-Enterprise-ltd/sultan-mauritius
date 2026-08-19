import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import styles from "../page.module.css";
import rowStyles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className={styles.title}>Inventory</h1>

      <div className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
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
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  <td className={low ? rowStyles.lowValue : undefined}>{p.stockQuantity}</td>
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
                <td colSpan={7} className={styles.empty}>No products yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
