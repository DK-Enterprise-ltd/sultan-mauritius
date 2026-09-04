import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations("order");
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } }, customer: true },
  });
  if (!order) notFound();

  return (
    <div className={styles.page}>
      <p className={styles.kicker}>{t("orderNumber", { number: order.orderNumber })}</p>
      <h1 className={styles.title}>{t("thankYou", { name: order.customer.name.split(" ")[0] })}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>

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
        <p>{t("paymentIntro")}</p>
        <ul>
          <li>{t("bankTransfer", { number: order.orderNumber })}</li>
          <li>{t("cashOnDelivery")}</li>
        </ul>
      </div>

      <div className={styles.delivery}>
        <h2>{t("deliveryTo")}</h2>
        <p>{order.deliveryAddress}</p>
        {order.deliveryZone && <p>{order.deliveryZone}</p>}
      </div>
    </div>
  );
}
