"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatMur } from "@/lib/format";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Your cart is empty</h1>
        <Link href="/products">
          <Button variant="primary">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your cart</h1>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.productId} className={styles.row}>
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              {item.flavor && <p className={styles.meta}>{item.flavor}</p>}
              <p className={styles.meta}>{item.sizeMl}ml</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
              className={styles.qty}
            />
            <span className={styles.lineTotal}>{formatMur(item.unitPrice * item.quantity)}</span>
            <button className={styles.remove} onClick={() => removeItem(item.productId)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <span>Subtotal</span>
        <span className={styles.subtotal}>{formatMur(subtotal)}</span>
      </div>

      <Link href="/checkout">
        <Button variant="primary">Proceed to checkout</Button>
      </Link>
    </div>
  );
}
