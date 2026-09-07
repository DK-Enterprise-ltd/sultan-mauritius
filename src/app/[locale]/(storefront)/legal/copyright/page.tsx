import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export default function CopyrightPage() {
  return (
    <>
      <h1>Copyright Notice</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        © {new Date().getFullYear()} Sultan Mauritius Ltd. All rights reserved.
      </p>

      <h2>Ownership</h2>
      <p>
        The text, product photography, graphics, layout, and design of this website belong to Sultan Mauritius Ltd
        or are used under license, and are protected by copyright law.
      </p>

      <h2>Trademarks</h2>
      <p>
        The Sultan name and logo are used under license by Sultan Mauritius Ltd. No permission is granted to use
        these marks other than to identify our products in the ordinary course of buying from us.
      </p>

      <h2>Permitted use</h2>
      <p>
        You may view, print, and download pages of this site for your own personal, non-commercial reference. Any
        other use, including reproduction, republication, or distribution of our content or images without our
        written permission, is not allowed.
      </p>

      <h2>Reporting infringement</h2>
      <p>
        If you believe content on this site infringes your rights, contact{" "}
        <a href="mailto:hello@sultan.mu">hello@sultan.mu</a>.
      </p>
    </>
  );
}
