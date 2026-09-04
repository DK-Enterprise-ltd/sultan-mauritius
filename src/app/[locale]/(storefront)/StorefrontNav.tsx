"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { Link, usePathname } from "@/i18n/navigation";
import styles from "./StorefrontNav.module.css";

export default function StorefrontNav() {
  const { items, toggleCart } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // ponytail: bump the cart badge whenever the item count grows, no event
  // bus needed — a ref comparison in an effect is the entire feature.
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const id = setTimeout(() => setBump(false), 1100);
      prevCount.current = count;
      return () => clearTimeout(id);
    }
    prevCount.current = count;
  }, [count]);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const solid = !isHome || scrolled || menuOpen;

  const navLinks = (
    <>
      <Link href="/products" onClick={() => setMenuOpen(false)}>{t("shop")}</Link>
      <Link href="/stockists" onClick={() => setMenuOpen(false)}>{t("stockists")}</Link>
      <Link href="/wholesale" onClick={() => setMenuOpen(false)}>{t("wholesale")}</Link>
      <Link href="/contact" onClick={() => setMenuOpen(false)}>{t("contact")}</Link>
    </>
  );

  return (
    <header className={`${styles.nav} ${solid ? styles.solid : ""}`}>
      <Link href="/" className={styles.logo}>
        <Image src="/uploads/logo_white.svg" alt="Sultan" width={133} height={34} className={styles.logoImg} priority />
      </Link>
      <nav className={styles.links}>{navLinks}</nav>
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
        <button type="button" onClick={toggleCart} className={styles.cart}>
          {bump && <span className={styles.ring} aria-hidden />}
          {t("cart")}
          {count > 0 && <span className={`${styles.count} ${bump ? styles.countBump : ""}`}>{count}</span>}
        </button>
        <button
          type="button"
          className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={t("menu")}
        >
          <span />
          <span />
        </button>
      </div>
      {menuOpen && <nav className={styles.mobileMenu}>{navLinks}</nav>}
    </header>
  );
}
