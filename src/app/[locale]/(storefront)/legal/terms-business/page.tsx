import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export default function TermsBusinessPage() {
  return (
    <>
      <h1>Terms & Conditions — Business Customers</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        These terms apply to restaurants, supermarkets, distributors, and other registered businesses that
        purchase Sultan water from us for resale or business use, including through our{" "}
        <a href="/wholesale">wholesale</a> channel. If you are an individual buying for personal use, our{" "}
        <a href="/legal/terms-consumer">Consumer Terms & Conditions</a> apply instead. Placing a trade order
        constitutes acceptance of these terms.
      </p>

      <h2>1. Trade accounts</h2>
      <p>
        We may ask for your Business Registration Number, VAT number, and authorised ordering contacts before
        approving a trade account. We may set a credit limit and review it at our discretion.
      </p>

      <h2>2. Pricing and bulk orders</h2>
      <p>
        Wholesale pricing is quoted per SKU and volume tier and may be agreed individually per account. Prices
        exclude delivery unless stated otherwise and are subject to change on notice for future orders; confirmed
        orders are priced as quoted at confirmation.
      </p>

      <h2>3. Payment terms</h2>
      <p>
        Unless we have approved credit terms for your account (standard credit period:{" "}
        <span className={styles.placeholder}>[NET DAYS — TO CONFIRM]</span>), payment by MCB Juice or bank transfer
        is due before dispatch. See <a href="/legal/payment-instructions">Payment Instructions</a>. Invoices on
        approved credit terms are due within the agreed period; overdue balances may accrue interest at{" "}
        <span className={styles.placeholder}>[RATE — TO CONFIRM]</span> per month and may result in the account
        being placed on hold.
      </p>

      <h2>4. Delivery and risk</h2>
      <p>
        Bulk and commercial freight terms are set out in our{" "}
        <a href="/legal/delivery-shipping">Delivery & Shipping Policy</a>. Unless agreed otherwise in writing, risk
        in the goods passes to you on delivery to, or collection from, the agreed site, and you are responsible for
        providing suitable access and manpower to receive the delivery.
      </p>

      <h2>5. Order cancellation</h2>
      <p>
        Cancellation requests must be made before an order is dispatched or, for made-to-order volumes, before
        production begins. Orders cancelled after dispatch may be subject to a restocking fee and recovery of
        freight costs already incurred. Confirmed bulk or custom-volume orders may be marked non-cancellable at the
        time of confirmation. The consumer cooling-off right described in our{" "}
        <a href="/legal/cancellation-refund">Cancellation & Refund Policy</a> does not apply to commercial orders
        placed under these terms.
      </p>

      <h2>6. Inspection and claims</h2>
      <p>
        You must inspect deliveries on receipt and report shortages, damage, or quality issues within{" "}
        <span className={styles.placeholder}>[X BUSINESS DAYS — TO CONFIRM]</span> of delivery. Claims made after
        this period may not be accepted, except for defects that could not reasonably have been discovered on
        inspection.
      </p>

      <h2>7. Liability</h2>
      <p>
        Our total liability arising from a business order is limited to the value of that order. We are not liable
        for indirect or consequential loss, including loss of profit, business, or goodwill, except where the law
        does not allow such an exclusion.
      </p>

      <h2>8. Force majeure</h2>
      <p>
        Neither party is liable for delay or failure to perform caused by events beyond its reasonable control,
        including supply disruption, adverse weather, or governmental action.
      </p>

      <h2>9. Confidentiality</h2>
      <p>
        Wholesale pricing and other commercial terms agreed with your account are confidential and must not be
        disclosed to third parties.
      </p>

      <h2>10. Termination</h2>
      <p>
        Either party may close a trade account on reasonable written notice. We may suspend or close an account
        immediately for non-payment or breach of these terms.
      </p>

      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of Mauritius and subject to the jurisdiction of its courts.</p>
    </>
  );
}
