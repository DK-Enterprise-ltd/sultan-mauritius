"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import styles from "./CookieConsentBanner.module.css";

const STORAGE_KEY = "sultan_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ponytail: only strictly-necessary cookies exist today, so this banner
    // is informational; it just needs to remember it was dismissed once.
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="region" aria-label="Cookie notice">
      <p className={styles.text}>
        We use only strictly necessary cookies and browser storage to run your cart and remember your language.
        See our <Link href="/legal/cookie-policy">Cookie Policy</Link>.
      </p>
      <button type="button" className={styles.button} onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
