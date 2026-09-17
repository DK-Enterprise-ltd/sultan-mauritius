import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact-info";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Sultan Mauritius",
  description: "Consumer and business return, damage, and refund terms for Sultan Mauritius orders.",
};

export default function CancellationRefundPage() {
  return (
    <>
      <h1>Cancellation &amp; Refund Policy</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        How returns, damage claims, and refunds work depends on whether you ordered as an individual consumer or
        as a registered business. See the relevant section below.
      </p>

      <h2>A. Consumer (B2C) orders</h2>
      <h3>Cancellation before dispatch</h3>
      <p>
        You may cancel your order at no cost any time before it is dispatched, by contacting{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your order number.
      </p>
      <h3>Inspect your goods on delivery</h3>
      <p>
        You are required to inspect your goods upon delivery. Any broken, damaged, incorrect, or visibly
        defective products should be reported to the delivery representative immediately upon delivery. Damaged
        or broken goods should be returned to the delivery representative at that time, and we will arrange a
        replacement or refund.
      </p>
      <h3>After delivery is accepted</h3>
      <p>
        Once your order has been inspected, accepted, and the delivery completed, returns and refunds are
        generally not accepted, subject to any rights available to you under applicable Mauritius law.
      </p>

      <h2>B. Business (B2B) orders</h2>
      <p>
        Business customers are responsible for checking the product, SKU, quantity, pack quantity, and condition
        of goods upon delivery. Any shortage, incorrect item, damaged product, or broken item must be brought to
        the attention of the delivery representative at the time of delivery and before the order is accepted.
        Damaged or broken products should be returned immediately to the delivery representative.
      </p>
      <p>
        Claims submitted after a delivery has been inspected and accepted will generally not be accepted, subject
        to applicable law. See our <a href="/legal/terms-business">Business Sales Terms</a> for the full terms
        that apply to business orders.
      </p>

      <h2>How to report a problem</h2>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call {CONTACT_PHONE_DISPLAY} with your
        order number and details of the issue.
      </p>
    </>
  );
}
