import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export default function PaymentInstructionsPage() {
  return (
    <>
      <h1>MCB Juice & Bank Transfer Payment Instructions</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        We do not take card payments online. Orders are paid by MCB Juice, direct bank transfer, or cash on
        delivery (where available, see our <a href="/legal/delivery-shipping">Delivery & Shipping Policy</a>). All
        amounts are in Mauritian Rupees (MUR).
      </p>

      <h2>Bank transfer</h2>
      <ul>
        <li>Beneficiary name: <strong>Sultan Mauritius Ltd</strong></li>
        <li>Bank: <strong>MCB (Mauritius Commercial Bank Ltd)</strong></li>
        <li>Account number: <strong>000123456789</strong></li>
        <li>SWIFT/BIC (for transfers from outside Mauritius): <span className={styles.placeholder}>[SWIFT/BIC CODE]</span></li>
        <li>Payment reference: <strong>your order number</strong> — always include this so we can match your payment</li>
      </ul>

      <h2>MCB Juice</h2>
      <ol>
        <li>Open the MCB Juice app and choose &quot;Merchant Pay&quot; or &quot;Send Money&quot;.</li>
        <li>Enter the Sultan Mauritius merchant number: <span className={styles.placeholder}>[MCB JUICE MERCHANT NUMBER]</span>.</li>
        <li>Enter the exact order total shown at checkout.</li>
        <li>In the payment note or reference field, enter your order number.</li>
        <li>Send the payment, then email or WhatsApp a screenshot of the confirmation to{" "}
          <a href="mailto:hello@sultan.mu">hello@sultan.mu</a> / <span className={styles.placeholder}>[PAYMENT WHATSAPP NUMBER]</span>.
        </li>
      </ol>

      <h2>Cash on delivery</h2>
      <p>
        Where offered for your delivery area, you may pay in cash to the driver on delivery. Please have the exact
        order total ready, as drivers may not carry change for large notes.
      </p>

      <h2>When we dispatch your order</h2>
      <p>
        For MCB Juice and bank transfer, we dispatch once we can match your payment to your order number, which is
        usually the same business day for MCB Juice and within{" "}
        <span className={styles.placeholder}>[X BUSINESS DAYS]</span> for bank transfers. If we cannot match a
        payment because the reference was missing or incorrect, we will contact you before dispatching.
      </p>

      <h2>Payment queries</h2>
      <p>
        If a payment fails, is delayed, or you paid the wrong amount, contact us at{" "}
        <a href="mailto:hello@sultan.mu">hello@sultan.mu</a> or +230 5 000 0000 with your order number.
      </p>
    </>
  );
}
