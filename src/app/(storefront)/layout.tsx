import { CartProvider } from "@/lib/cart-context";
import StorefrontNav from "./StorefrontNav";
import styles from "./layout.module.css";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StorefrontNav />
      <main>{children}</main>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Sultan Mauritius</span>
        <span>Bank transfer &amp; cash on delivery — no online payment</span>
      </footer>
    </CartProvider>
  );
}
