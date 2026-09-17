import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact-info";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Payment Instructions | Sultan Mauritius",
  description: "How payment works for Sultan Mauritius orders.",
};

export default function PaymentInstructionsPage() {
  return (
    <>
      <h1>Payment Instructions</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        This website does not currently process online payments: no card payment, no bank/SWIFT transfer, and no
        MCB Juice are taken through the site. All amounts are shown in Mauritian Rupees (MUR).
      </p>

      <h2>Individual (B2C) orders</h2>
      <p>
        Standard payment is on delivery or collection, according to the arrangement agreed with you when your
        order is confirmed. See our <a href="/legal/delivery-shipping">Delivery &amp; Shipping Policy</a> for
        delivery areas, fees, and the minimum order for delivery.
      </p>

      <h2>Business (B2B) orders</h2>
      <p>
        Standard payment is on delivery, unless different terms have been expressly agreed with you in writing.
        Any exceptional credit arrangement is agreed individually with your account and is not a standard term
        offered on this website. See our <a href="/legal/terms-business">Business Sales Terms</a>.
      </p>

      <h2>Payment queries</h2>
      <p>
        If you have a question about payment on an order, contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or {CONTACT_PHONE_DISPLAY} with your order number.
      </p>
    </>
  );
}
