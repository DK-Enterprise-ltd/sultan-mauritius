"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import styles from "./StorefrontNav.module.css";

export default function StorefrontNav() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.logo}>
        SULTAN
      </Link>
      <nav className={styles.links}>
        <Link href="/products">Shop</Link>
        <Link href="/wholesale">Wholesale</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <Link href="/cart" className={styles.cart}>
        Cart{count > 0 && <span className={styles.count}>{count}</span>}
      </Link>
    </header>
  );
}
