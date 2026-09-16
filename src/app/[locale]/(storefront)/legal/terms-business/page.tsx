import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "B2B Sales Terms | Sultan Mauritius",
  description: "Business account requirements, pack ordering, payment, and delivery terms for Sultan Mauritius trade customers.",
};

export default function TermsBusinessPage() {
  return (
    <>
      <h1>B2B Sales Terms — Grignoti Ltd</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        These terms apply to restaurants, supermarkets, distributors, and other registered businesses that
        purchase Sultan water from Grignoti Ltd (trading as Sultan Mauritius) for resale or business use,
        including through our <a href="/wholesale">wholesale</a> channel. If you are an individual buying for
        personal use, our <a href="/legal/terms-consumer">Consumer Terms &amp; Conditions</a> apply instead.
        Confirming a trade order constitutes acceptance of these terms.
      </p>

      <h2>1. Business registration</h2>
      <p>
        To purchase under B2B conditions, you must provide a valid Business Registration Number (BRN) and accept
        these B2B Sales Terms before placing or confirming an order.
      </p>

      <h2>2. Pack-based ordering</h2>
      <p>
        Products must be purchased according to the pack quantities stated in the relevant product description.
        You are responsible for reviewing pack sizes before confirming an order. Individual-unit purchases do not
        qualify for B2B ordering or pricing unless specifically stated otherwise on that product.
      </p>

      <h2>3. Order confirmation</h2>
      <p>
        You must confirm the required products/SKUs, flavour, pack size, and quantity before your order is
        prepared for dispatch. Once an order has been confirmed, we will prepare the goods based on the
        information you supplied.
      </p>

      <h2>4. Payment</h2>
      <p>
        Standard B2B orders are payable on delivery (POD), unless alternative payment or credit terms have been
        expressly agreed between Grignoti Ltd and your business in writing. There is no general Net 15/Net 30
        credit period or standard late-payment interest rate; any exceptional credit arrangement is agreed
        individually and is not a standard term offered on this website. See our{" "}
        <a href="/legal/payment-instructions">Payment Instructions</a>.
      </p>

      <h2>5. Delivery</h2>
      <p>
        Approved B2B customers receive free delivery within our standard delivery areas, see our{" "}
        <a href="/legal/delivery-shipping">Delivery &amp; Shipping Policy</a>. Orders are generally delivered
        within 2–4 business days, depending on order size, location, and delivery scheduling: this is an
        estimated timeframe, not a guaranteed delivery date. Customers outside the standard delivery areas must
        arrange collection from a pickup point agreed with us.
      </p>
      <p>
        You should ensure that an authorised person is available to receive and inspect the order at the agreed
        delivery or pickup time. Where a delivery cannot be completed because no authorised representative is
        available, a new delivery or collection arrangement may be required.
      </p>

      <h2>6. Inspection of goods</h2>
      <p>
        You must inspect the products, SKUs, quantities, and condition of the goods upon receipt. Any shortage,
        incorrect product, damage, or breakage must be reported to the delivery representative immediately and
        before accepting the delivery. Damaged goods should be returned at the time of delivery. See our{" "}
        <a href="/legal/cancellation-refund">Cancellation &amp; Refund Policy</a>.
      </p>

      <h2>7. Acceptance of delivery</h2>
      <p>
        Acceptance of the delivery confirms that you have had an opportunity to inspect the goods and, except for
        rights that cannot legally be excluded, that the order has been received in the agreed condition and
        quantity.
      </p>

      <h2>8. Liability</h2>
      <p>
        Our total liability arising from a business order is limited to the value of that order. We are not
        liable for indirect or consequential loss, including loss of profit, business, or goodwill, except where
        the law does not allow such an exclusion.
      </p>

      <h2>9. Confidentiality</h2>
      <p>
        Wholesale pricing and other commercial terms agreed with your account are confidential and must not be
        disclosed to third parties.
      </p>

      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of Mauritius and subject to the jurisdiction of its courts.</p>
    </>
  );
}
