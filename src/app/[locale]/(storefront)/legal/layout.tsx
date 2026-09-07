import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { LEGAL_PAGES } from "@/lib/legal-pages";
import styles from "./legal.module.css";

export const metadata: Metadata = { title: "Legal & Policies | Sultan Mauritius" };

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <span className={styles.sidebarHeading}>Legal & Policies</span>
        <nav className={styles.sidebarNav}>
          {LEGAL_PAGES.map((p) => (
            <Link key={p.href} href={p.href}>
              {p.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className={styles.article}>{children}</article>
    </div>
  );
}
