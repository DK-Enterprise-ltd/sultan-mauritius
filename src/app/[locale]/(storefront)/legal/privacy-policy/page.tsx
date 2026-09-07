import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Sultan Mauritius",
  description: "How Sultan Mauritius handles consumer and corporate data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        Sultan Mauritius Ltd (&quot;Sultan Mauritius&quot;, &quot;we&quot;, &quot;us&quot;) distributes Sultan mineral
        water in Mauritius, to individual consumers and to businesses. This policy explains what personal and
        business data we collect, why, and how it is protected, in line with the Mauritius Data Protection Act
        2017. Because we serve both consumer and business customers, the data we collect differs between the two,
        so it is set out in two separate sections below.
      </p>

      <h2>Who we are</h2>
      <p>
        Sultan Mauritius Ltd, registered office <span className={styles.placeholder}>[REGISTERED ADDRESS]</span>,
        Business Registration Number <span className={styles.placeholder}>[BRN NUMBER]</span>. Contact:{" "}
        <a href="mailto:hello@sultan.mu">hello@sultan.mu</a>, +230 5 000 0000.
      </p>

      <h2>A. Consumer (B2C) data</h2>
      <p>Collected when an individual browses, creates a cart, or places a personal order.</p>
      <ul>
        <li>Name, delivery address, phone number, email address</li>
        <li>Order history, order value, product preferences</li>
        <li>Payment reference for bank transfer or MCB Juice (we do not collect or store card numbers, as we take no online card payments)</li>
        <li>Locale preference (English/French) and basic device/browser data via strictly necessary cookies</li>
      </ul>
      <p>
        We use this data to process and deliver your order, provide customer support, issue proof of purchase,
        and, only with your consent, send occasional product updates.
      </p>

      <h2>B. Corporate (B2B) data</h2>
      <p>Collected when a business opens a wholesale account or places a trade order.</p>
      <ul>
        <li>Company legal name, Business Registration Number and VAT number</li>
        <li>Business address and delivery/site addresses</li>
        <li>Name, role, email and phone number of authorised ordering contacts</li>
        <li>Credit account details, billing history, purchase order and invoice records</li>
        <li>Agreed wholesale pricing and volume commitments</li>
      </ul>
      <p>
        We use this data to set up and manage the trade account, fulfil and invoice orders, assess credit terms,
        and comply with our own tax and accounting obligations.
      </p>

      <h2>Legal basis for processing</h2>
      <p>
        We process consumer and corporate data to perform the sale contract you enter into with us, to comply with
        tax and company-law obligations, and, for optional marketing communications, on the basis of your consent,
        which you may withdraw at any time.
      </p>

      <h2>Who we share data with</h2>
      <ul>
        <li>Delivery and courier partners, limited to what is needed to complete delivery</li>
        <li>Our bank (MCB) and MCB Juice, to reconcile payments you send us</li>
        <li>IT infrastructure providers that host this website and its database</li>
        <li>The Mauritius Revenue Authority and other authorities, where legally required</li>
      </ul>
      <p>We do not sell personal or business data to third parties.</p>

      <h2>Data retention</h2>
      <p>
        We keep order and invoicing records for as long as required under Mauritius tax and company-law retention
        rules, and account data for as long as your consumer or trade account remains active, plus a reasonable
        period afterwards to handle disputes and legal claims.
      </p>

      <h2>Your rights</h2>
      <p>Under the Data Protection Act 2017, you may ask us to:</p>
      <ul>
        <li>Confirm what personal or business-contact data we hold about you and provide a copy</li>
        <li>Correct inaccurate data</li>
        <li>Delete data we no longer have a lawful reason to keep</li>
        <li>Stop using your data for direct marketing</li>
      </ul>
      <p>
        To exercise any of these rights, contact <a href="mailto:hello@sultan.mu">hello@sultan.mu</a>. You may also
        lodge a complaint with the Data Protection Office of Mauritius.
      </p>

      <h2>Security</h2>
      <p>
        We restrict access to personal and business data to staff who need it to process your order, and use
        encrypted connections and access-controlled hosting for the systems that store it.
      </p>

      <h2>Cookies</h2>
      <p>
        See our <a href="/legal/cookie-policy">Cookie Policy</a> for the specific cookies this site sets.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as our data practices change. The date at the top shows when it was last
        revised.
      </p>
    </>
  );
}
