import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact-info";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions — Individuals | Sultan Mauritius",
  description: "Rules for personal, non-business orders from Sultan Mauritius.",
};

export default function TermsConsumerPage() {
  return (
    <>
      <h1>Terms &amp; Conditions — Individual Customers</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        These terms apply when you, as an individual, buy Sultan water from this website, operated by Grignoti
        Ltd (trading as Sultan Mauritius), for your own personal or household use. If you are ordering on behalf
        of a registered business, our <a href="/legal/terms-business">B2B Sales Terms</a> apply instead.
      </p>

      <h2>1. The contract</h2>
      <p>
        Adding items to your cart is not an offer we have accepted. The contract is formed when we confirm your
        order. We may decline or cancel an order, for example if a product is out of stock.
      </p>

      <h2>2. Prices and products</h2>
      <p>
        All prices are shown in Mauritian Rupees (MUR). We take reasonable care to describe and photograph
        products accurately; minor packaging variations do not entitle you to a refund.
      </p>

      <h2>3. Payment</h2>
      <p>
        This website does not currently process online payments. Standard payment is on delivery or collection,
        according to the arrangement agreed when your order is confirmed. See our{" "}
        <a href="/legal/payment-instructions">Payment Instructions</a>.
      </p>

      <h2>4. Delivery</h2>
      <p>
        A minimum order value and a delivery fee apply to delivery within our standard delivery areas; customers
        outside these areas arrange collection from an agreed pickup point. Delivery is currently available
        within Mauritius only. Delivery timeframes and areas are set out in our{" "}
        <a href="/legal/delivery-shipping">Delivery &amp; Shipping Policy</a>.
      </p>

      <h2>5. Inspection, returns, and refunds</h2>
      <p>
        You are required to inspect your goods upon delivery and report any broken, damaged, incorrect, or
        defective product to the delivery representative immediately. Once your order has been inspected,
        accepted, and delivery completed, returns and refunds are generally not accepted, subject to any rights
        available to you under applicable Mauritius law. See our{" "}
        <a href="/legal/cancellation-refund">Cancellation &amp; Refund Policy</a>.
      </p>

      <h2>6. Your consumer rights</h2>
      <p>
        Nothing in these terms limits the protections available to you as a consumer under the Consumer
        Protection Act 1991 and other Mauritius consumer-protection law, including your right to goods that are
        of satisfactory quality, fit for purpose, and as described.
      </p>

      <h2>7. Our liability</h2>
      <p>
        We are responsible for loss or damage you suffer that is a foreseeable result of our breach of these
        terms, up to the value of your order. We do not exclude liability where the law does not allow us to,
        including for death or personal injury caused by our negligence.
      </p>

      <h2>8. Complaints</h2>
      <p>
        Contact us first at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or {CONTACT_PHONE_DISPLAY}. If we
        cannot resolve a complaint between us, you may refer it to the relevant Mauritius consumer-protection body.
      </p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of Mauritius and subject to the jurisdiction of its courts.</p>
    </>
  );
}
