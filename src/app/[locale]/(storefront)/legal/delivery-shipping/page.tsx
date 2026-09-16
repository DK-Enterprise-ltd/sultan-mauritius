import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import { STANDARD_DELIVERY_AREAS, MIN_B2C_ORDER_MUR, B2C_DELIVERY_FEE_MUR } from "@/lib/delivery";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Delivery & Shipping Policy | Sultan Mauritius",
  description: "Residential and business delivery terms for Sultan Mauritius orders.",
};

export default function DeliveryShippingPage() {
  return (
    <>
      <h1>Delivery &amp; Shipping Policy</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        Delivery and order fulfilment is currently available within Mauritius only. Rodrigues and other outer
        islands are not currently served.
      </p>

      <h2>Standard delivery areas</h2>
      <p>Direct delivery is currently available in the following areas:</p>
      <ul>
        {STANDARD_DELIVERY_AREAS.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ul>
      <p>
        If you are located outside these areas, you can still place an order, but you will need to arrange
        collection from a pickup point agreed with us before your order is confirmed.
      </p>

      <h2>Individual / residential (B2C) delivery</h2>
      <ul>
        <li>Minimum order value for delivery: <strong>Rs {MIN_B2C_ORDER_MUR}</strong></li>
        <li>Delivery fee within the standard delivery areas: <strong>Rs {B2C_DELIVERY_FEE_MUR}</strong></li>
        <li>
          Estimated delivery time: <strong>2–4 business days</strong>, depending on quantity ordered, delivery
          location, and our delivery schedule. This is an estimated timeframe, not a guaranteed delivery date.
        </li>
        <li>Someone must be available at the delivery address to receive and inspect the order</li>
      </ul>

      <h2>Business (B2B) delivery</h2>
      <ul>
        <li>Approved business customers receive <strong>free delivery</strong> within the standard delivery areas above; there is no delivery charge for qualifying B2B orders</li>
        <li>Customers outside the standard delivery areas will need to arrange an agreed pickup point</li>
        <li>Estimated delivery time: <strong>2–4 business days</strong>, depending on order quantity, location, and delivery schedule</li>
        <li>Products must be ordered according to the pack quantities stated in each product description, see our <a href="/legal/terms-business">Business Sales Terms</a></li>
      </ul>

      <h2>Payment</h2>
      <p>
        This website does not currently process online payments. See our{" "}
        <a href="/legal/payment-instructions">Payment Instructions</a> for how payment on delivery/collection
        works for individual and business orders.
      </p>

      <h2>Inspection on delivery</h2>
      <p>
        Please inspect your order when it arrives. Any broken, damaged, incorrect, or visibly defective products
        should be reported to the delivery representative immediately and returned to them at that time. See our{" "}
        <a href="/legal/cancellation-refund">Cancellation &amp; Refund Policy</a> for what happens after a
        delivery has been inspected and accepted.
      </p>
    </>
  );
}
