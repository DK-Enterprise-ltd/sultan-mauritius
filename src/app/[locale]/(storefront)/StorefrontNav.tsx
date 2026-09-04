"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { Link, usePathname } from "@/i18n/navigation";
import styles from "./StorefrontNav.module.css";

export default function StorefrontNav() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.logo}>
        SULTAN
      </Link>
      <nav className={styles.links}>
        <Link href="/products">{t("shop")}</Link>
        <Link href="/stockists">{t("stockists")}</Link>
        <Link href="/wholesale">{t("wholesale")}</Link>
        <Link href="/contact">{t("contact")}</Link>
      </nav>
      <div className={styles.right}>
        <div className={styles.langSwitch}>
          <Link href={pathname} locale="en" className={locale === "en" ? styles.langActive : undefined}>
            EN
          </Link>
          <span aria-hidden>/</span>
          <Link href={pathname} locale="fr" className={locale === "fr" ? styles.langActive : undefined}>
            FR
          </Link>
        </div>
        <Link href="/cart" className={styles.cart}>
          {t("cart")}
          {count > 0 && <span className={styles.count}>{count}</span>}
        </Link>
      </div>
    </header>
  );
}
