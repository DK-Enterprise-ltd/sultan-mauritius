import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal/Reveal";
import { pageMetadata } from "@/lib/seo";
import { getSiteContent, pick } from "@/lib/site-content";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

const REGION_ORDER = ["North", "Centre", "West", "East", "South"];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return pageMetadata({
    locale: params.locale as Locale,
    path: "/stockists",
    title: t("stockistsTitle"),
    description: t("stockistsDescription"),
  });
}

export default async function StockistsPage() {
  const t = await getTranslations("stockists");
  const locale = await getLocale();
  const content = await getSiteContent("stockists");
  const c = (key: string) => pick(content, key, locale, t(key));
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
      <h1 className={styles.title}>{c("title")}</h1>
      <p className={styles.intro}>{c("intro")}</p>

      {stockists.length === 0 ? (
        <p className={styles.empty}>{c("empty")}</p>
      ) : (
        regions.map((region) => (
          <Reveal key={region} className={styles.region}>
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
          </Reveal>
        ))
      )}
    </div>
  );
}
