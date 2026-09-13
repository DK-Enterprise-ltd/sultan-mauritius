import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import InquiryActions from "./InquiryActions";
import pageStyles from "../page.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string };
}) {
  if (!isAdmin()) return null;

  const filter = searchParams.filter;
  const q = searchParams.q?.trim();

  const whereClause: Prisma.ContactInquiryWhereInput = {};
  if (filter === "unhandled") {
    whereClause.handled = false;
  } else if (filter === "handled") {
    whereClause.handled = true;
  }

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const inquiries = await prisma.contactInquiry.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <h1 className={pageStyles.title}>Contact & Wholesale Inquiries</h1>

      <form className={styles.searchForm}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, company, or message…"
          className={styles.searchInput}
        />
        {filter && <input type="hidden" name="filter" value={filter} />}
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      <div className={styles.filters}>
        <Link
          href={`/admin/inquiries${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          className={`${styles.filter} ${!filter ? styles.filterActive : ""}`}
        >
          All
        </Link>
        <Link
          href={`/admin/inquiries?filter=unhandled${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`${styles.filter} ${filter === "unhandled" ? styles.filterActive : ""}`}
        >
          Unhandled
        </Link>
        <Link
          href={`/admin/inquiries?filter=handled${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`${styles.filter} ${filter === "handled" ? styles.filterActive : ""}`}
        >
          Handled
        </Link>
      </div>

      <div className={pageStyles.section}>
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Contact Details</th>
              <th>Company & Volume</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>
                  <span
                    className={`${styles.typeBadge} ${
                      inquiry.type === "WHOLESALE" ? styles.typeWHOLESALE : ""
                    }`}
                  >
                    {inquiry.type}
                  </span>
                </td>
                <td>
                  <div>
                    <strong>{inquiry.name}</strong>
                  </div>
                  <div>
                    <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                  </div>
                  {inquiry.phone && <div>{inquiry.phone}</div>}
                </td>
                <td>
                  {inquiry.companyName ? <div><strong>{inquiry.companyName}</strong></div> : "—"}
                  {inquiry.estimatedVolume && (
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Vol: {inquiry.estimatedVolume}
                    </div>
                  )}
                </td>
                <td className={styles.messageCell}>{inquiry.message}</td>
                <td>{inquiry.createdAt.toLocaleDateString("en-MU")}</td>
                <td>
                  <InquiryActions
                    id={inquiry.id}
                    handled={inquiry.handled}
                    email={inquiry.email}
                    name={inquiry.name}
                  />
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className={pageStyles.empty}>
                  No inquiries match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
