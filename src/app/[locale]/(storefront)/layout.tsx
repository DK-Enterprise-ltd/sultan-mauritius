import { useTranslations } from "next-intl";
import { CartProvider } from "@/lib/cart-context";
import StorefrontNav from "./StorefrontNav";
import styles from "./layout.module.css";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StorefrontNav />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}

function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className={styles.footer}>
      <span>{t("copyright", { year: new Date().getFullYear() })}</span>
      <span>{t("paymentNote")}</span>
    </footer>
  );
}
