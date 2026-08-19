import type { OrderStatus, InvoiceStatus } from "@prisma/client";
import styles from "./Badge.module.css";

type Status = OrderStatus | InvoiceStatus;

const STATUS_CLASS: Record<Status, string> = {
  PENDING: styles.pending,
  CONFIRMED: styles.confirmed,
  PAID: styles.paid,
  FULFILLED: styles.fulfilled,
  CANCELLED: styles.cancelled,
  DRAFT: styles.pending,
  ISSUED: styles.confirmed,
};

export default function Badge({ status }: { status: Status }) {
  return <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>{status}</span>;
}
