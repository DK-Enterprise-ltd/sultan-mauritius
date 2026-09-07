import { LAST_UPDATED } from "@/lib/legal-pages";
import styles from "../legal.module.css";

export default function CookiePolicyPage() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <span className={styles.updated}>Last updated: {LAST_UPDATED}</span>

      <p>
        Cookies are small files a website stores in your browser. This page lists what this site currently uses
        them, and browser storage more broadly, for.
      </p>

      <h2>Strictly necessary</h2>
      <ul>
        <li><strong>Language preference</strong> — remembers whether you are browsing in English or French</li>
        <li><strong>Shopping cart</strong> — stored in your browser (localStorage, not a cookie) so your cart survives a page refresh; never sent to another website</li>
        <li><strong>Admin session</strong> — a signed session cookie used only on our internal <code>/admin</code> dashboard, not set for regular site visitors</li>
      </ul>
      <p>These are required for the site to function and cannot be switched off.</p>

      <h2>Analytics and advertising</h2>
      <p>
        We do not currently use analytics, advertising, or third-party tracking cookies on this site. If that
        changes, we will update this policy and the consent banner before any such cookies are set.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can block or delete cookies through your browser settings at any time. Blocking the strictly necessary
        cookies above may stop parts of the site, such as the shopping cart, from working correctly.
      </p>

      <h2>Changes to this policy</h2>
      <p>We will update this page if the cookies and storage we use change.</p>
    </>
  );
}
