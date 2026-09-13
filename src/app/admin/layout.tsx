import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
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

// These badge counts render on every admin page (they live in the shared
// layout), which every page below forces to re-render dynamically — without
// caching, that's 3 extra DB round trips on top of whatever the page itself
// queries, on every single navigation. A stale badge for up to 30s is
// invisible to an admin, so cache instead of re-querying every click.
const getSidebarCounts = unstable_cache(
  async () => {
    const [pendingOrders, products, unhandledInquiries] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.findMany({ where: { isActive: true }, select: { stockQuantity: true, lowStockThreshold: true } }),
      prisma.contactInquiry.count({ where: { handled: false } }),
    ]);
    const lowStockCount = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
    return { pendingOrders, lowStockCount, unhandledInquiries };
  },
  ["admin-sidebar-counts"],
  { revalidate: 30 },
);

async function AdminShell({ children }: { children: React.ReactNode }) {
  const { pendingOrders, lowStockCount, unhandledInquiries } = await getSidebarCounts();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.brand}>Sultan Admin</p>
        <AdminNav
          pendingOrders={pendingOrders}
          lowStockCount={lowStockCount}
          unhandledInquiries={unhandledInquiries}
        />
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
