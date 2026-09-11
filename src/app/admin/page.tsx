import Link from "next/link";
import { DollarSign, ShoppingCart, Users, PackageX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/admin-stats";
import Badge from "@/components/Badge/Badge";
import StatCard from "@/components/StatCard/StatCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // AdminLayout only renders {children} when authed, but that alone doesn't
  // stop this page's own queries from running — check again here so no
  // order/customer data is ever fetched for an unauthenticated request.
  if (!isAdmin()) return null;

  const [stats, pendingOrders, lowStockProducts, unhandledInquiries, recentOrders] = await Promise.all([
    getDashboardStats(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma
      .product
      .findMany({ where: { isActive: true } })
      .then((products) => products.filter((p) => p.stockQuantity <= p.lowStockThreshold)),
    prisma.contactInquiry.count({ where: { handled: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
  ]);

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statGrid}>
        <StatCard
          label="Revenue this month"
          value={formatMur(stats.revenueThisMonth)}
          icon={<DollarSign size={18} />}
          accent="var(--sultan-teal)"
          trend={stats.revenueTrend}
          sparkline={stats.sparklines.revenue}
        />
        <StatCard
          label="Orders this month"
          value={String(stats.ordersThisMonth)}
          icon={<ShoppingCart size={18} />}
          accent="var(--sultan-sun)"
          trend={stats.ordersTrend}
          sparkline={stats.sparklines.orders}
        />
        <StatCard
          label="New customers this month"
          value={String(stats.newCustomersThisMonth)}
          icon={<Users size={18} />}
          accent="var(--sultan-navy)"
          trend={stats.newCustomersTrend}
        />
        <StatCard
          label="Low stock products"
          value={String(stats.lowStockCount)}
          icon={<PackageX size={18} />}
          accent="var(--sultan-plum)"
        />
      </div>

      <div className={styles.quickLinks}>
        <Link href="/admin/orders?status=PENDING" className={styles.quickLink}>
          <span className={styles.quickLinkValue}>{pendingOrders}</span>
          <span className={styles.quickLinkLabel}>Pending orders</span>
        </Link>
        <Link href="/admin/inventory" className={styles.quickLink}>
          <span className={styles.quickLinkValue}>{lowStockProducts.length}</span>
          <span className={styles.quickLinkLabel}>Low stock products</span>
        </Link>
        <span className={styles.quickLink}>
          <span className={styles.quickLinkValue}>{unhandledInquiries}</span>
          <span className={styles.quickLinkLabel}>Unhandled inquiries</span>
        </span>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent orders</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className={styles.rowLink}>
                    #{order.orderNumber}
                  </Link>
                </td>
                <td>{order.customer.name}</td>
                <td>
                  <Badge status={order.status} />
                </td>
                <td>{formatMur(order.total)}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {lowStockProducts.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Low stock alerts</h2>
          <ul className={styles.alertList}>
            {lowStockProducts.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/inventory/${p.id}`}>{p.name}</Link> — {p.stockQuantity} left (threshold{" "}
                {p.lowStockThreshold})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
