import Image from "next/image";
import { useTranslations } from "next-intl";
import { CartProvider } from "@/lib/cart-context";
import { Link } from "@/i18n/navigation";
import StorefrontNav from "./StorefrontNav";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import styles from "./layout.module.css";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className={styles.shell}>
        <StorefrontNav />
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
      <CartDrawer />
    </CartProvider>
  );
}

function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tProduct = useTranslations("product");
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <Image src="/Assets/Logo/logo_white.svg" alt="Sultan" width={141} height={36} className={styles.footerLogo} />
          <p className={styles.tagline}>{t("tagline")}</p>
        </div>
        <div className={styles.footerCol}>
          <span className={styles.colHeading}>{t("shopHeading")}</span>
          <Link href="/products?type=SPARKLING">{tProduct("sparkling")}</Link>
          <Link href="/products?type=STILL">{tProduct("still")}</Link>
          <Link href="/products?type=STILL">Sultan Prime</Link>
        </div>
        <div className={styles.footerCol}>
          <span className={styles.colHeading}>{t("tradeHeading")}</span>
          <Link href="/about">{tNav("about")}</Link>
          <Link href="/wholesale">{tNav("wholesale")}</Link>
          <Link href="/stockists">{tNav("stockists")}</Link>
          <Link href="/contact">{tNav("contact")}</Link>
        </div>
        <div className={styles.footerCol}>
          <span className={styles.colHeading}>{t("contactHeading")}</span>
          <span>Port Louis, Mauritius</span>
          <span>+230 5 000 0000</span>
          <span>hello@sultan.mu</span>
          <a href="https://www.instagram.com/sultan_mauritius/" target="_blank" rel="noreferrer" className={styles.social}>
            Instagram
          </a>
          <a href="https://www.facebook.com/sultandrinkmauritius/" target="_blank" rel="noreferrer" className={styles.social}>
            Facebook
          </a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <span>{t("paymentNote")}</span>
      </div>
    </footer>
  );
}
