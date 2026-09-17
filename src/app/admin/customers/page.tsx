import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import { ADMIN_PAGE_SIZE, parsePage, paginateRows } from "@/lib/pagination";
import PaginationControls from "../PaginationControls";
import styles from "../page.module.css";
import ownStyles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  if (!isAdmin()) return null;

  const q = searchParams.q?.trim();
  const page = parsePage(searchParams.page);
  const customerRows = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { companyName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE + 1,
  });
  const { rows: customers, hasNextPage } = paginateRows(customerRows);

  const customerIds = customers.map((c) => c.id);
  const [orderCounts, spendSums] = await Promise.all([
    prisma.order.groupBy({
      by: ["customerId"],
      where: { customerId: { in: customerIds } },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: { customerId: { in: customerIds }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
  ]);
  const orderCountByCustomer = new Map(orderCounts.map((o) => [o.customerId, o._count._all]));
  const spendByCustomer = new Map(spendSums.map((o) => [o.customerId, o._sum.total ?? new Prisma.Decimal(0)]));

  return (
    <div>
      <h1 className={styles.title}>Customers</h1>

      <form className={ownStyles.searchForm}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or company…"
          className={ownStyles.searchInput}
        />
        <button type="submit" className={ownStyles.searchButton}>
          Search
        </button>
      </form>

      <div className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Type</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Lifetime spend</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const orderCount = orderCountByCustomer.get(c.id) ?? 0;
              const lifetimeSpend = spendByCustomer.get(c.id) ?? new Prisma.Decimal(0);
              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.companyName || "—"}</td>
                  <td>
                    <span
                      className={`${ownStyles.typeBadge} ${c.type === "BUSINESS" ? ownStyles.typeBUSINESS : ""}`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </td>
                  <td>{c.phone}</td>
                  <td>
                    <Link href={`/admin/orders?customerId=${c.id}`} className={styles.rowLink}>
                      {orderCount}
                    </Link>
                  </td>
                  <td>{formatMur(lifetimeSpend)}</td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No customers match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationControls page={page} hasNextPage={hasNextPage} searchParams={searchParams} />
      </div>
    </div>
  );
}
