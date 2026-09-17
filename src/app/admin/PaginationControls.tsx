import Link from "next/link";
import styles from "./page.module.css";

function hrefFor(searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key !== "page" && value !== undefined) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export default function PaginationControls({
  page,
  hasNextPage,
  searchParams,
}: {
  page: number;
  hasNextPage: boolean;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <div className={styles.pagination}>
      {page > 1 ? (
        <Link href={hrefFor(searchParams, page - 1)} className={styles.pageLink}>
          Previous
        </Link>
      ) : (
        <span className={`${styles.pageLink} ${styles.pageLinkDisabled}`}>Previous</span>
      )}
      <span className={styles.pageNumber}>Page {page}</span>
      {hasNextPage ? (
        <Link href={hrefFor(searchParams, page + 1)} className={styles.pageLink}>
          Next
        </Link>
      ) : (
        <span className={`${styles.pageLink} ${styles.pageLinkDisabled}`}>Next</span>
      )}
    </div>
  );
}
