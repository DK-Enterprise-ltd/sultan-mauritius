import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { sora, inter } from "../fonts";
import "../globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Sultan Admin",
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/invoices", label: "Invoices" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO(real-auth): replace isAdmin() with a real session/role check and
  // redirect to a login page instead of "/" once auth exists.
  if (!isAdmin()) {
    redirect("/");
  }

  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable}`}>
        <div className={styles.shell}>
          <aside className={styles.sidebar}>
            <p className={styles.brand}>Sultan Admin</p>
            <nav className={styles.nav}>
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className={styles.content}>{children}</main>
        </div>
      </body>
    </html>
  );
}
