import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import styles from "./page.module.css";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  // Looked up by the order's cuid, not its sequential orderNumber: the
  // numeric order number is guessable/enumerable and would let anyone page
  // through other customers' names, addresses, and order contents.
  const t = await getTranslations("order");
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, customer: true },
  });
  if (!order) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.successBadge} aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className={styles.kicker}>{t("orderNumber", { number: order.orderNumber })}</p>
      <h1 className={styles.title}>{t("placedTitle")}</h1>
      <p className={styles.subtitle}>{t("emailNotice", { email: order.customer.email })}</p>

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
          <span>{t("total")}</span>
          <span>{formatMur(order.total)}</span>
        </div>
      </div>

      <div className={styles.payment}>
        <h2>{t("paymentInstructions")}</h2>
        {order.status === "PENDING" ? (
          <p>{t("paymentPending")}</p>
        ) : (
          <>
            <p>{t("paymentIntro")}</p>
            <ul>
              <li>{t("bankTransfer", { number: order.orderNumber })}</li>
              <li>{t("cashOnDelivery")}</li>
            </ul>
          </>
        )}
      </div>

      <div className={styles.delivery}>
        <h2>{t("deliveryTo")}</h2>
        <p>{order.deliveryAddress}</p>
        {order.deliveryZone && <p>{order.deliveryZone}</p>}
      </div>
    </div>
  );
}
