import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import Badge from "@/components/Badge/Badge";
import pageStyles from "../../page.module.css";
import orderStyles from "../../orders/page.module.css";
import styles from "../../orders/[id]/page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  if (!isAdmin()) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { invoice: true },
      },
    },
  });
  if (!customer) notFound();

  const lifetimeSpend = customer.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum.plus(o.total), new Prisma.Decimal(0));

  return (
    <div>
      <div className={styles.toolbar}>
        <Link href="/admin/customers" className={styles.back}>
          ← Back to customers
        </Link>
      </div>

      <h1 className={pageStyles.title}>{customer.name}</h1>
      <p className={styles.metaLine}>
        {customer.type === "BUSINESS" ? "B2B" : "B2C"} · Customer since{" "}
        {customer.createdAt.toLocaleDateString("en-MU")}
      </p>

      <div className={styles.grid}>
        <div>
          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Orders</h2>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className={pageStyles.rowLink}>
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <Badge status={order.status} />
                    </td>
                    <td>{formatMur(order.total)}</td>
                    <td>{order.createdAt.toLocaleDateString("en-MU")}</td>
                    <td>
                      {order.invoice ? (
                        <Link href={`/admin/invoices/${order.invoice.id}`} className={orderStyles.seeInvoiceButton}>
                          See invoice
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
                {customer.orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className={pageStyles.empty}>
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Invoices</h2>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Balance due</th>
                  <th>Due date</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders
                  .filter((o) => o.invoice)
                  .map((order) => (
                    <tr key={order.invoice!.id}>
                      <td>
                        <Link href={`/admin/invoices/${order.invoice!.id}`} className={pageStyles.rowLink}>
                          {order.invoice!.invoiceNumber}
                        </Link>
                      </td>
                      <td>#{order.orderNumber}</td>
                      <td>
                        <Badge status={order.invoice!.status} />
                      </td>
                      <td>{formatMur(order.invoice!.balanceDue)}</td>
                      <td>{order.invoice!.dueDate ? order.invoice!.dueDate.toLocaleDateString("en-MU") : "—"}</td>
                    </tr>
                  ))}
                {customer.orders.filter((o) => o.invoice).length === 0 && (
                  <tr>
                    <td colSpan={5} className={pageStyles.empty}>
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Customer</h2>
            <div className={styles.definitionList}>
              {customer.companyName && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>Company</span>
                  <span className={styles.definitionValue}>{customer.companyName}</span>
                </div>
              )}
              {customer.brn && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>BRN</span>
                  <span className={styles.definitionValue}>{customer.brn}</span>
                </div>
              )}
              {customer.vatNumber && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>VAT number</span>
                  <span className={styles.definitionValue}>{customer.vatNumber}</span>
                </div>
              )}
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
                <span className={styles.definitionValue}>{customer.deliveryAddress || "—"}</span>
              </div>
              {customer.deliveryZone && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>Delivery zone</span>
                  <span className={styles.definitionValue}>{customer.deliveryZone}</span>
                </div>
              )}
              {customer.creditTermsDays != null && (
                <div className={styles.definitionRow}>
                  <span className={styles.definitionLabel}>Credit terms</span>
                  <span className={styles.definitionValue}>Net {customer.creditTermsDays} days</span>
                </div>
              )}
              <div className={styles.definitionRow}>
                <span className={styles.definitionLabel}>Lifetime spend</span>
                <span className={styles.definitionValue}>{formatMur(lifetimeSpend)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
