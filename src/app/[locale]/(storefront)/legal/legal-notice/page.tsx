import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export default function LegalNoticePage() {
  return (
    <>
      <h1>Legal Notice / Imprint</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>Information required to identify the operator of this website, in accordance with Mauritius law.</p>

      <h2>Company</h2>
      <ul>
        <li>Legal name: <strong>Sultan Mauritius Ltd</strong></li>
        <li>Registered office: <span className={styles.placeholder}>[FULL REGISTERED ADDRESS]</span>, Mauritius</li>
        <li>Business Registration Number (BRN): <span className={styles.placeholder}>[BRN NUMBER]</span></li>
        <li>VAT registration number: <span className={styles.placeholder}>[VAT NUMBER]</span></li>
        <li>Director(s): <span className={styles.placeholder}>[DIRECTOR NAME(S)]</span></li>
      </ul>

      <h2>Contact</h2>
      <ul>
        <li>Email: <a href="mailto:hello@sultan.mu">hello@sultan.mu</a></li>
        <li>Phone: +230 5 000 0000</li>
        <li>Address: Port Louis, Mauritius</li>
      </ul>

      <h2>Regulatory</h2>
      <p>
        Food and beverage import/distribution registration: <span className={styles.placeholder}>[REGISTRATION NUMBER, IF APPLICABLE]</span>.
      </p>

      <h2>Responsible for content</h2>
      <p>Sultan Mauritius Ltd is responsible for the content of this website.</p>
    </>
  );
}
