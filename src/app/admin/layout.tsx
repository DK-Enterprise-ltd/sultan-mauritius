import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { sora, inter } from "../fonts";
import "../globals.css";
import AdminLoginForm from "./AdminLoginForm";
import AdminNav from "./AdminNav";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Sultan Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdmin();

  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable}`}>
        {authed ? (
          <div className={styles.shell}>
            <aside className={styles.sidebar}>
              <p className={styles.brand}>Sultan Admin</p>
              <AdminNav />
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
