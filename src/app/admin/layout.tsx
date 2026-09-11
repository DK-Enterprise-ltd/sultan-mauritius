import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { sora, inter } from "../fonts";
import "../globals.css";
// Tailwind + shadcn/ui, scoped to /admin only: this file (not globals.css)
// is where bklit's chart components pull their utility classes and CSS
// variables from. The storefront's own root layout never imports this, so
// Tailwind's reset/utilities never reach it.
import "./admin-tailwind.css";
import AdminLoginForm from "./AdminLoginForm";
import AdminNav from "./AdminNav";
import AdminTopbar from "./AdminTopbar";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Sultan Admin",
  robots: { index: false, follow: false },
};

async function AdminShell({ children }: { children: React.ReactNode }) {
  const [pendingOrders, lowStockCount, unhandledInquiries] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma
      .product
      .findMany({ where: { isActive: true }, select: { stockQuantity: true, lowStockThreshold: true } })
      .then((products) => products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length),
    prisma.contactInquiry.count({ where: { handled: false } }),
  ]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.brand}>Sultan Admin</p>
        <AdminNav pendingOrders={pendingOrders} lowStockCount={lowStockCount} />
        <form action={logoutAdmin} className={styles.logoutForm}>
          <button type="submit" className={styles.logoutButton}>
            Log out
          </button>
        </form>
      </aside>
      <div className={styles.main}>
        <AdminTopbar alertCount={pendingOrders + lowStockCount + unhandledInquiries} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdmin();

  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable}`}>
        {authed ? (
          <AdminShell>{children}</AdminShell>
        ) : (
          <div className={styles.loginShell}>
            <AdminLoginForm />
          </div>
        )}
      </body>
    </html>
  );
}
