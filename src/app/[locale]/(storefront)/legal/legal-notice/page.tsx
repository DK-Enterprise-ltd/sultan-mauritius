import type { Metadata } from "next";
import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Legal Notice / Imprint | Sultan Mauritius",
  description: "Sultan Mauritius company registration and regulatory details.",
};

export default function LegalNoticePage() {
  return (
    <>
      <h1>Legal Notice / Imprint</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>Information required to identify the operator of this website, in accordance with Mauritius law.</p>

      <h2>Company</h2>
      <ul>
        <li>Trading name: <strong>Sultan Mauritius</strong></li>
        <li>Legal name: <strong>Grignoti Ltd</strong></li>
        <li>Registered office: 95, La Paix Street, Port Louis, Mauritius</li>
        <li>Business Registration Number (BRN): C25226789</li>
        <li>VAT registration number: 28451792</li>
        <li>Director: Jameellah Emamdee</li>
      </ul>

      <h2>Contact</h2>
      <ul>
        <li>Email: <a href="mailto:hello@sultan.mu">hello@sultan.mu</a></li>
        <li>Phone: +230 5 000 0000</li>
        <li>Address: Port Louis, Mauritius</li>
      </ul>

      <h2>Regulatory</h2>
      <p>
        No food and beverage import/distribution registration number is displayed on this website at this stage.
      </p>

      <h2>Responsible for content</h2>
      <p>Grignoti Ltd, trading as Sultan Mauritius, is responsible for the content of this website.</p>
    </>
  );
}
