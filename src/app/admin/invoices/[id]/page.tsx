import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import Badge from "@/components/Badge/Badge";
import InvoiceEditForm from "./InvoiceEditForm";
import SendInvoiceButton from "./SendInvoiceButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({ params }: { params: { id: string } }) {
  if (!isAdmin()) return null;

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
        <a
          href={`/api/admin/invoices/${invoice.id}/pdf?download=1`}
          className={styles.downloadButton}
        >
          Download PDF
        </a>
      </div>

      <div className={styles.summary}>
        <div>
          <h1 className={styles.invoiceTitle}>Invoice #{invoice.invoiceNumber}</h1>
          <p className={styles.metaLine}>
            <Link href={`/admin/orders/${order.id}`}>Order #{order.orderNumber}</Link> · {order.customer.name}
          </p>
        </div>
        <Badge status={invoice.status} />
      </div>

      <div className={styles.pdfPreviewCard}>
        <iframe
          src={`/api/admin/invoices/${invoice.id}/pdf`}
          title={`Invoice #${invoice.invoiceNumber} PDF`}
          className={styles.pdfFrame}
        />
      </div>

      <div className={styles.adminPanel}>
        <div className={styles.adminCard}>
          <h2 className={styles.sectionLabel}>Send to customer</h2>
          <SendInvoiceButton invoiceId={invoice.id} alreadySent={invoice.status !== "DRAFT"} />
        </div>
        <div className={styles.adminCard}>
          <h2 className={styles.sectionLabel}>Edit invoice</h2>
          <InvoiceEditForm
            invoiceId={invoice.id}
            status={invoice.status}
            dueDate={invoice.dueDate}
            amountPaid={invoice.amountPaid.toString()}
          />
        </div>
      </div>
    </div>
  );
}
