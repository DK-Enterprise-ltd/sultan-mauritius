// ponytail: static case-size lookup by bottle size, mirroring the design
// canvas's own caseSpec values (24 bottles for most sizes, 6 for 1.5L, 12
// for the 0.80L Prime bottle). Product has no caseSize column; move this to
// a schema field if case sizes ever vary per-SKU instead of per-size-tier.
const CASE_SIZE_BY_ML: Record<number, number> = {
  200: 24,
  250: 24,
  400: 24,
  500: 24,
  800: 12,
  1500: 6,
};

export function caseSizeFor(sizeMl: number): number {
  return CASE_SIZE_BY_ML[sizeMl] ?? 24;
}
