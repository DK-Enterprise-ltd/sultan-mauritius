import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import Badge from "@/components/Badge/Badge";
import PrintButton from "./PrintButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: { customer: true, items: { include: { product: true } } },
      },
    },
  });
  if (!invoice) notFound();

  const { order } = invoice;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link href="/admin/invoices" className={styles.back}>
          ← Back to invoices
        </Link>
        <PrintButton />
      </div>

      <div className={styles.sheet}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.brand}>Sultan Mauritius Ltd</h1>
            <p className={styles.brandLine}>Port Louis, Mauritius</p>
            <p className={styles.brandLine}>hello@sultan.mu · +230 5 000 0000</p>
          </div>
          <div className={styles.headerRight}>
            <h2 className={styles.invoiceTitle}>Invoice #{invoice.invoiceNumber}</h2>
            <Badge status={invoice.status} />
            <p className={styles.metaLine}>Order #{order.orderNumber}</p>
            <p className={styles.metaLine}>
              Issued: {invoice.issuedAt ? invoice.issuedAt.toLocaleDateString("en-MU") : "Not yet issued"}
            </p>
            <p className={styles.metaLine}>
              Due: {invoice.dueDate ? invoice.dueDate.toLocaleDateString("en-MU") : "—"}
            </p>
          </div>
        </div>

        <div className={styles.billTo}>
          <span className={styles.sectionLabel}>Bill to</span>
          <p className={styles.billName}>{order.customer.companyName || order.customer.name}</p>
          {order.customer.companyName && <p>{order.customer.name}</p>}
          <p>{order.customer.email}</p>
          <p>{order.customer.phone}</p>
          <p>{order.deliveryAddress}</p>
          {order.deliveryZone && <p>{order.deliveryZone}</p>}
        </div>

        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th className={styles.num}>Qty</th>
              <th className={styles.num}>Unit price</th>
              <th className={styles.num}>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td className={styles.num}>{item.quantity}</td>
                <td className={styles.num}>{formatMur(item.unitPriceAtOrder)}</td>
                <td className={styles.num}>{formatMur(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatMur(order.subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Order total</span>
            <span>{formatMur(order.total)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Amount paid</span>
            <span>{formatMur(invoice.amountPaid)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.balanceDue}`}>
            <span>Balance due</span>
            <span>{formatMur(invoice.balanceDue)}</span>
          </div>
        </div>

        {order.notes && (
          <div className={styles.notes}>
            <span className={styles.sectionLabel}>Order notes</span>
            <p>{order.notes}</p>
          </div>
        )}

        <p className={styles.footerNote}>
          Payment by MCB Juice or bank transfer (Sultan Mauritius Ltd · MCB · Account 000123456789), reference
          order #{order.orderNumber}.
        </p>
      </div>
    </div>
  );
}
