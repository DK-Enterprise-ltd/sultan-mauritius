import { Link } from "@/i18n/navigation";
import { LEGAL_PAGES } from "@/lib/legal-pages";
import styles from "./legal.module.css";

export default function LegalIndexPage() {
  return (
    <>
      <h1>Legal & Policies</h1>
      <span className={styles.updated}>
        Everything about how Sultan Mauritius Ltd handles your data, orders, payments and deliveries.
      </span>
      <div className={styles.indexGrid}>
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className={styles.indexCard}>
            <span className={styles.indexCardTitle}>{p.label}</span>
            <span className={styles.indexCardDesc}>{p.desc}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
