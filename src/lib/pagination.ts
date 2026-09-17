export const ADMIN_PAGE_SIZE = 50;

/** Parses a page number from a searchParams value, defaulting to 1 for anything invalid. */
export function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Splits a take-(ADMIN_PAGE_SIZE + 1) query result into the page's rows and whether a next page exists. */
export function paginateRows<T>(rows: T[]): { rows: T[]; hasNextPage: boolean } {
  return { rows: rows.slice(0, ADMIN_PAGE_SIZE), hasNextPage: rows.length > ADMIN_PAGE_SIZE };
}
