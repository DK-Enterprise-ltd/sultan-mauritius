import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import { ADMIN_PAGE_SIZE, parsePage, paginateRows } from "@/lib/pagination";
import PaginationControls from "../PaginationControls";
import styles from "../page.module.css";
import rowStyles from "./page.module.css";
import StockAdjuster from "./StockAdjuster";
import ProductStatusToggle from "./ProductStatusToggle";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  if (!isAdmin()) return null;

  const page = parsePage(searchParams.page);
  const productRows = await prisma.product.findMany({
    orderBy: { name: "asc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE + 1,
  });
  const { rows: products, hasNextPage } = paginateRows(productRows);

  return (
    <div>
      <div className={rowStyles.headerRow}>
        <h1 className={styles.title}>Inventory</h1>
        <Link href="/admin/inventory/new" className={rowStyles.addButton}>
          + Add product
        </Link>
      </div>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.stockQuantity <= p.lowStockThreshold;
              return (
                <tr key={p.id} className={low ? rowStyles.lowRow : undefined}>
                  <td>
                    <Link href={`/admin/inventory/${p.id}`}>
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          width={120}
                          height={120}
                          className={rowStyles.thumb}
                        />
                      ) : (
                        <span className={rowStyles.thumbPlaceholder} aria-hidden />
                      )}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/admin/inventory/${p.id}`} className={rowStyles.skuLink}>
                      {p.sku}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/admin/inventory/${p.id}`} className={rowStyles.nameLink}>
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.type}</td>
                  <td className={low ? rowStyles.lowValue : undefined}>
                    <StockAdjuster productId={p.id} quantity={p.stockQuantity} />
                  </td>
                  <td>{p.lowStockThreshold}</td>
                  <td>{formatMur(p.retailPrice)}</td>
                  <td>
                    <ProductStatusToggle productId={p.id} isActive={p.isActive} isLowStock={low} />
                  </td>
                  <td>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.empty}>No products yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationControls page={page} hasNextPage={hasNextPage} searchParams={searchParams} />
      </div>
    </div>
  );
}
