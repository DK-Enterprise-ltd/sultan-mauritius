import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

const REGION_ORDER = ["North", "Centre", "West", "East", "South"];

export default async function StockistsPage() {
  const t = await getTranslations("stockists");
  const stockists = await prisma.stockist.findMany({
    where: { isActive: true },
    orderBy: [{ region: "asc" }, { town: "asc" }, { name: "asc" }],
  });

  const byRegion = new Map<string, typeof stockists>();
  for (const s of stockists) {
    byRegion.set(s.region, [...(byRegion.get(s.region) ?? []), s]);
  }
  const regions = REGION_ORDER.filter((r) => byRegion.has(r));

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.intro}>{t("intro")}</p>

      {stockists.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
      ) : (
        regions.map((region) => (
          <div key={region} className={styles.region}>
            <h2 className={styles.regionLabel}>{region}</h2>
            <ul className={styles.list}>
              {byRegion.get(region)!.map((s) => (
                <li key={s.id} className={styles.row}>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.town}>{s.town}</span>
                  {s.mapUrl ? (
                    <a href={s.mapUrl} target="_blank" rel="noreferrer" className={styles.mapLink}>
                      {s.address ?? s.town}
                    </a>
                  ) : (
                    s.address && <span className={styles.address}>{s.address}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
