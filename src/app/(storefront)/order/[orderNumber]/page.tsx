import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import styles from "./page.module.css";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const orderNumber = Number(params.orderNumber);
  if (Number.isNaN(orderNumber)) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } }, customer: true },
  });
  if (!order) notFound();

  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Order #{order.orderNumber}</p>
      <h1 className={styles.title}>Thank you, {order.customer.name.split(" ")[0]}.</h1>
      <p className={styles.subtitle}>
        We&apos;ve received your order and it&apos;s awaiting confirmation.
      </p>

      <div className={styles.items}>
        {order.items.map((item) => (
          <div key={item.id} className={styles.row}>
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatMur(item.lineTotal)}</span>
          </div>
        ))}
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatMur(order.total)}</span>
        </div>
      </div>

      <div className={styles.payment}>
        <h2>Payment instructions</h2>
        <p>No online payment is taken. Please settle by:</p>
        <ul>
          <li>Bank transfer — Sultan Mauritius Ltd · MCB · Account 000123456789, reference order #{order.orderNumber}</li>
          <li>Cash on delivery</li>
        </ul>
      </div>

      <div className={styles.delivery}>
        <h2>Delivery to</h2>
        <p>{order.deliveryAddress}</p>
        {order.deliveryZone && <p>{order.deliveryZone}</p>}
      </div>
    </div>
  );
}
