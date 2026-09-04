import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { sora, inter } from "../fonts";
import "../globals.css";
import AdminLoginForm from "./AdminLoginForm";
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
  const authed = isAdmin();

  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable}`}>
        {authed ? (
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
              <form action={logoutAdmin} className={styles.logoutForm}>
                <button type="submit" className={styles.logoutButton}>
                  Log out
                </button>
              </form>
            </aside>
            <main className={styles.content}>{children}</main>
          </div>
        ) : (
          <div className={styles.loginShell}>
            <AdminLoginForm />
          </div>
        )}
      </body>
    </html>
  );
}
