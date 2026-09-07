import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions — Individuals | Sultan Mauritius",
  description: "Rules for personal, non-business orders from Sultan Mauritius.",
};

export default function TermsConsumerPage() {
  return (
    <>
      <h1>Terms & Conditions — Individual Customers</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        These terms apply when you, as an individual, buy Sultan water from this website for your own personal or
        household use. If you are ordering on behalf of a registered business, our{" "}
        <a href="/legal/terms-business">Business Terms & Conditions</a> apply instead.
      </p>

      <h2>1. The contract</h2>
      <p>
        Adding items to your cart is not an offer we have accepted. The contract is formed when we confirm your
        order, and again when we dispatch it. We may decline or cancel an order, for example if a product is out
        of stock, and will refund any payment already received.
      </p>

      <h2>2. Prices and products</h2>
      <p>
        All prices are shown in Mauritian Rupees (MUR) and include applicable VAT. We take reasonable care to
        describe and photograph products accurately; minor packaging variations do not entitle you to a refund.
      </p>

      <h2>3. Payment</h2>
      <p>
        We accept MCB Juice, direct bank transfer, and cash on delivery. See our{" "}
        <a href="/legal/payment-instructions">Payment Instructions</a> page for how to pay. We dispatch orders once
        payment (or, for cash on delivery, the order itself) is confirmed.
      </p>

      <h2>4. Delivery</h2>
      <p>
        Delivery timeframes and areas are set out in our <a href="/legal/delivery-shipping">Delivery & Shipping
        Policy</a>. Risk in the goods passes to you once they are delivered to the address you provided.
      </p>

      <h2>5. Your right to cancel</h2>
      <p>
        As a consumer, you may cancel your order and receive a refund, subject to the exceptions and timeframes in
        our <a href="/legal/cancellation-refund">Cancellation & Refund Policy</a>, which also explains the limits
        that apply once a sealed food or beverage item has been opened.
      </p>

      <h2>6. Your consumer rights</h2>
      <p>
        Nothing in these terms limits the protections available to you as a consumer under the Consumer Protection
        Act 1991 and other Mauritius consumer-protection law, including your right to goods that are of
        satisfactory quality, fit for purpose, and as described.
      </p>

      <h2>7. Our liability</h2>
      <p>
        We are responsible for loss or damage you suffer that is a foreseeable result of our breach of these
        terms, up to the value of your order. We do not exclude liability where the law does not allow us to,
        including for death or personal injury caused by our negligence.
      </p>

      <h2>8. Complaints</h2>
      <p>
        Contact us first at <a href="mailto:hello@sultan.mu">hello@sultan.mu</a> or +230 5 000 0000. If we cannot
        resolve a complaint between us, you may refer it to the relevant Mauritius consumer-protection body.
      </p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of Mauritius and subject to the jurisdiction of its courts.</p>
    </>
  );
}
