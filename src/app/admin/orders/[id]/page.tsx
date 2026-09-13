import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import StatusSelect from "../StatusSelect";
import GenerateInvoiceButton from "./GenerateInvoiceButton";
import pageStyles from "../../page.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!isAdmin()) return null;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: { include: { product: true } },
      invoice: true,
    },
  });
  if (!order) notFound();

  const { customer } = order;

  return (
    <div>
      <div className={styles.toolbar}>
        <Link href="/admin/orders" className={styles.back}>
          ← Back to orders
        </Link>
      </div>

      <div className={styles.headerRow}>
        <h1 className={pageStyles.title}>Order #{order.orderNumber}</h1>
        <StatusSelect orderId={order.id} status={order.status} />
      </div>
      <p className={styles.metaLine}>
        {order.channel} · Placed {order.createdAt.toLocaleString("en-MU")}
      </p>

      <div className={styles.grid}>
        <div>
          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Items</h2>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product.name}</td>
                    <td>{item.product.sku}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMur(item.unitPriceAtOrder)}</td>
                    <td>{formatMur(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.itemsTotals}>
              <div className={styles.totalsRow}>
                <span>Subtotal</span>
                <span>{formatMur(order.subtotal)}</span>
              </div>
              <div className={`${styles.totalsRow} ${styles.totalsRowStrong}`}>
                <span>Total</span>
                <span>{formatMur(order.total)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className={pageStyles.section}>
              <h2 className={pageStyles.sectionTitle}>Order notes</h2>
              <p className={styles.notes}>{order.notes}</p>
            </div>
          )}
        </div>

        <div>
          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Customer</h2>
            <div className={styles.definitionList}>
              <div className={styles.definitionRow}>
                <span className={styles.definitionLabel}>Name</span>
                <span className={styles.definitionValue}>{customer.name}</span>
              </div>
              {customer.companyName && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>Company</span>
                  <span className={styles.definitionValue}>{customer.companyName}</span>
                </div>
              )}
              <div className={styles.definitionRow}>
                <span className={styles.definitionLabel}>Customer type</span>
                <span className={styles.definitionValue}>{customer.type}</span>
              </div>
              <div className={styles.definitionRow}>
                <span className={styles.definitionLabel}>Email</span>
                <span className={styles.definitionValue}>
                  <a href={`mailto:${customer.email}`}>{customer.email}</a>
                </span>
              </div>
              <div className={styles.definitionRow}>
                <span className={styles.definitionLabel}>Phone</span>
                <span className={styles.definitionValue}>
                  <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                </span>
              </div>
              <div className={styles.definitionRow}>
                <span className={styles.definitionLabel}>Delivery address</span>
                <span className={styles.definitionValue}>{order.deliveryAddress || "—"}</span>
              </div>
              {order.deliveryZone && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>Delivery zone</span>
                  <span className={styles.definitionValue}>{order.deliveryZone}</span>
                </div>
              )}
              {customer.vatNumber && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>VAT number</span>
                  <span className={styles.definitionValue}>{customer.vatNumber}</span>
                </div>
              )}
              {customer.creditTermsDays != null && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>Credit terms</span>
                  <span className={styles.definitionValue}>Net {customer.creditTermsDays} days</span>
                </div>
              )}
            </div>
          </div>

          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Invoice</h2>
            <div className={styles.invoiceActions}>
              {order.invoice ? (
                <Link href={`/admin/invoices/${order.invoice.id}`} className={styles.generateButton}>
                  See invoice #{order.invoice.invoiceNumber}
                </Link>
              ) : (
                <GenerateInvoiceButton orderId={order.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
