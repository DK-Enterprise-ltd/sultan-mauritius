import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Delivery & Shipping Policy | Sultan Mauritius",
  description: "Residential delivery and bulk freight terms for Sultan Mauritius orders.",
};

export default function DeliveryShippingPage() {
  return (
    <>
      <h1>Delivery & Shipping Policy</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        We deliver across Mauritius. Delivery to Rodrigues and other outer islands is{" "}
        <span className={styles.placeholder}>[AVAILABLE ON REQUEST / NOT CURRENTLY OFFERED — TO CONFIRM]</span>.
      </p>

      <h2>Residential (individual) delivery</h2>
      <ul>
        <li>Standard delivery time: <span className={styles.placeholder}>[X–Y BUSINESS DAYS]</span> from order confirmation</li>
        <li>Delivery fee: free above <span className={styles.placeholder}>[MUR THRESHOLD]</span>, a flat{" "}
          <span className={styles.placeholder}>[MUR FEE]</span> below that
        </li>
        <li>Someone must be available at the delivery address to receive the order, especially for cash-on-delivery payments</li>
        <li>If a delivery attempt fails because no one is available, we will contact you to arrange redelivery, which may carry an additional fee</li>
      </ul>

      <h2>Commercial and bulk freight</h2>
      <ul>
        <li>Bulk orders are scheduled at a delivery window agreed with you at order confirmation</li>
        <li>Free freight applies above <span className={styles.placeholder}>[CASE/PALLET THRESHOLD]</span>; smaller trade orders are charged at{" "}
          <span className={styles.placeholder}>[RATE]</span>
        </li>
        <li>Palletised or large-volume deliveries are made kerbside or dockside; you are responsible for providing suitable access and manpower to offload, unless we have agreed otherwise in writing</li>
        <li>Lead times for large or made-to-order volumes are confirmed at the time of order and may exceed standard residential timeframes</li>
      </ul>

      <h2>Tracking and confirmation</h2>
      <p>
        We confirm dispatch by email, phone, or WhatsApp with an estimated delivery window. We do not currently
        offer live courier tracking.
      </p>

      <h2>Risk and title</h2>
      <p>
        Risk in the goods passes to you once they are delivered to the address, or the site, you provided. Title
        passes once we have received payment in full.
      </p>

      <h2>Delays</h2>
      <p>
        We are not liable for delays caused by events outside our reasonable control, including weather, traffic
        disruption, or courier issues, but we will keep you informed and reschedule as soon as reasonably possible.
      </p>

      <h2>Damaged or missing items</h2>
      <p>
        Please check your delivery on arrival. Report any damage or shortage to{" "}
        <a href="mailto:hello@sultan.mu">hello@sultan.mu</a> within the timeframe set out in our{" "}
        <a href="/legal/cancellation-refund">Cancellation & Refund Policy</a>, ideally with photos, so we can
        arrange a replacement or refund.
      </p>
    </>
  );
}
