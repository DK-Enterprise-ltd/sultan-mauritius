// ponytail: static case-size lookup by bottle size. Values for 200/250/400/
// 500/800ml read off the customer's actual shrink-wrap pack photography
// (../reference/Customer upload): still bottles ship 12 to a shrink pack,
// sparkling 200ml ships 6 to a pack with 4 packs (24 bottles) to a wholesale
// case. 1.5L has no pack photo in that set; kept at the prior assumption of
// 6. Product has no caseSize column; move this to a schema field if case
// sizes ever vary per-SKU instead of per-size-tier.
const CASE_SIZE_BY_ML: Record<number, number> = {
  200: 24,
  250: 12,
  400: 12,
  500: 12,
  800: 12,
  1500: 6,
};

export function caseSizeFor(sizeMl: number): number {
  return CASE_SIZE_BY_ML[sizeMl] ?? 24;
}
