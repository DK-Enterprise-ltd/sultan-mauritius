import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const NOT_CANCELLED: { status: { not: OrderStatus } } = { status: { not: "CANCELLED" } };

function monthRange(monthsAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start, end };
}

/** Percent change from `previous` to `current`, or null when there's no
 * previous-period baseline to compare against (avoids a misleading "+100%"
 * off a zero base). */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export type DailyPoint = { date: string; value: number };

/** Daily order count and revenue for the last `days` days, oldest first —
 * feeds the dashboard sparklines. Computed in JS from a single query rather
 * than a DB-specific date-trunc, so it stays portable across Postgres
 * setups. */
async function dailySeries(days: number): Promise<{ orders: DailyPoint[]; revenue: DailyPoint[] }> {
  // Bucket keys use toISOString().slice(0, 10) (a UTC calendar day), so the
  // range and bucket generation below must also walk UTC days — mixing
  // local-time date math (setDate/setHours) with a UTC-derived key silently
  // drops orders into no bucket at all whenever the local timezone offset
  // crosses a UTC day boundary.
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, ...NOT_CANCELLED },
    select: { createdAt: true, total: true },
  });

  const buckets = new Map<string, { count: number; revenue: Prisma.Decimal }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    buckets.set(d.toISOString().slice(0, 10), { count: 0, revenue: new Prisma.Decimal(0) });
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
      bucket.revenue = bucket.revenue.plus(order.total);
    }
  }

  const entries = Array.from(buckets.entries());
  return {
    orders: entries.map(([date, b]) => ({ date, value: b.count })),
    revenue: entries.map(([date, b]) => ({ date, value: b.revenue.toNumber() })),
  };
}

export type StatusCount = { status: OrderStatus; count: number };

const STATUS_ORDER: OrderStatus[] = ["PENDING", "CONFIRMED", "PAID", "OUT_FOR_DELIVERY", "FULFILLED", "CANCELLED"];

/** Order counts by status over the last `days` days, in a fixed display
 * order — feeds the "orders by status" bar chart. Cancelled orders are
 * included here (unlike the revenue/order-count stats above): the whole
 * point of this chart is to show where orders are in the pipeline,
 * cancellations included. */
async function ordersByStatus(days: number): Promise<StatusCount[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const grouped = await prisma.order.groupBy({
    by: ["status"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });
  const countByStatus = new Map(grouped.map((g) => [g.status, g._count._all]));

  return STATUS_ORDER.map((status) => ({ status, count: countByStatus.get(status) ?? 0 }));
}

export type DashboardStats = {
  revenueThisMonth: number;
  revenueTrend: number | null;
  ordersThisMonth: number;
  ordersTrend: number | null;
  newCustomersThisMonth: number;
  newCustomersTrend: number | null;
  lowStockCount: number;
  sparklines: { orders: DailyPoint[]; revenue: DailyPoint[] };
  ordersByStatus: StatusCount[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);

  const [
    revenueThisMonthAgg,
    revenueLastMonthAgg,
    ordersThisMonth,
    ordersLastMonth,
    newCustomersThisMonth,
    newCustomersLastMonth,
    activeProducts,
    sparklines,
    statusCounts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: thisMonth.start, lt: thisMonth.end }, ...NOT_CANCELLED },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: lastMonth.start, lt: lastMonth.end }, ...NOT_CANCELLED },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: thisMonth.start, lt: thisMonth.end }, ...NOT_CANCELLED } }),
    prisma.order.count({ where: { createdAt: { gte: lastMonth.start, lt: lastMonth.end }, ...NOT_CANCELLED } }),
    prisma.customer.count({ where: { createdAt: { gte: thisMonth.start, lt: thisMonth.end } } }),
    prisma.customer.count({ where: { createdAt: { gte: lastMonth.start, lt: lastMonth.end } } }),
    prisma.product.findMany({ where: { isActive: true }, select: { stockQuantity: true, lowStockThreshold: true } }),
    dailySeries(14),
    ordersByStatus(30),
  ]);

  const revenueThisMonth = (revenueThisMonthAgg._sum.total ?? new Prisma.Decimal(0)).toNumber();
  const revenueLastMonth = (revenueLastMonthAgg._sum.total ?? new Prisma.Decimal(0)).toNumber();

  return {
    revenueThisMonth,
    revenueTrend: percentChange(revenueThisMonth, revenueLastMonth),
    ordersThisMonth,
    ordersTrend: percentChange(ordersThisMonth, ordersLastMonth),
    newCustomersThisMonth,
    newCustomersTrend: percentChange(newCustomersThisMonth, newCustomersLastMonth),
    lowStockCount: activeProducts.filter((p) => p.stockQuantity <= p.lowStockThreshold).length,
    sparklines,
    ordersByStatus: statusCounts,
  };
}
