import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Sultan Mauritius",
  description: "Consumer cooling-off and business cancellation terms for Sultan Mauritius orders.",
};

export default function CancellationRefundPage() {
  return (
    <>
      <h1>Cancellation & Refund Policy</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        How cancellations and refunds work depends on whether you ordered as an individual consumer or as a
        registered business. See the relevant section below.
      </p>

      <h2>A. Consumer (B2C) orders</h2>
      <h3>Cooling-off and cancellation before dispatch</h3>
      <p>
        You may cancel your order for any reason at no cost any time before it is dispatched, by contacting{" "}
        <a href="mailto:hello@sultan.mu">hello@sultan.mu</a> with your order number. We will refund any payment
        already received in full.
      </p>
      <h3>Returns after delivery</h3>
      <p>
        You may return unopened, unused items within{" "}
        <span className={styles.placeholder}>[X DAYS — TO CONFIRM]</span> of delivery for a refund, minus the
        original delivery fee. You are responsible for return shipping unless the goods are faulty or not as
        described. Because our products are sealed food and beverage items, this right does not apply once a
        bottle, pack, or case seal has been broken, for hygiene and safety reasons.
      </p>
      <h3>Faulty or damaged goods</h3>
      <p>
        If an item arrives damaged, faulty, or different from what you ordered, contact us within{" "}
        <span className={styles.placeholder}>[X DAYS]</span> of delivery, ideally with a photo, and we will replace
        it or refund it in full, including delivery cost, at no charge to you.
      </p>
      <h3>Refund method and timing</h3>
      <p>
        Refunds are made by bank transfer or MCB Juice, back to the account or number you paid from, within{" "}
        <span className={styles.placeholder}>[X BUSINESS DAYS]</span> of us approving the refund.
      </p>

      <h2>B. Business (B2B) orders</h2>
      <p>
        The consumer cooling-off right above does not apply to commercial orders placed under our{" "}
        <a href="/legal/terms-business">Business Terms & Conditions</a>.
      </p>
      <ul>
        <li>Cancellations must be requested before dispatch, or before production begins for made-to-order volumes, to avoid any charge</li>
        <li>Orders cancelled after dispatch may incur a restocking fee of <span className={styles.placeholder}>[X%]</span> and recovery of freight costs already incurred</li>
        <li>Confirmed bulk or custom-volume orders may be marked non-cancellable at confirmation, as stated on the order</li>
        <li>Shortages, damage, or quality issues must be reported within the inspection window in our{" "}
          <a href="/legal/terms-business">Business Terms</a>; genuinely faulty stock is replaced or credited in full regardless of that window</li>
      </ul>

      <h2>How to request a cancellation or refund</h2>
      <p>
        Email <a href="mailto:hello@sultan.mu">hello@sultan.mu</a> or call +230 5 000 0000 with your order number
        and the reason for your request.
      </p>
    </>
  );
}
