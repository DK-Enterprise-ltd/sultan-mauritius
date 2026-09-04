import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import { getSiteContent, pick } from "@/lib/site-content";
import ProductCard from "@/components/ProductCard/ProductCard";
import Button from "@/components/Button/Button";
import Reveal from "@/components/Reveal/Reveal";
import { formatMur } from "@/lib/format";
import { localizeFlavor } from "@/lib/catalog-i18n";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// ponytail: real flavour -> swatch colour, keyed by name, matching the
// design canvas's own catalog() colours exactly. Static because the SKU
// list rarely changes; move to a Product column if it grows past ~24 rows.
const FLAVOR_SWATCH: Record<string, string> = {
  Lemon: "#d9c84a",
  Apple: "#d2c77a",
  Mandarin: "#e8963a",
  Strawberry: "#b92b44",
  Gazoz: "#e4eef2",
  "Mango & Pineapple": "#e8b93a",
  Pomegranate: "#a81e33",
  Mojito: "#c3d96a",
  "Black Mulberry & Blackcurrant": "#6e1746",
  "Berry & Hibiscus": "#c93b4e",
  "Watermelon Strawberry": "#e2607a",
};

// Curated selection, matching the design canvas's featured picks 1:1
// (st-025, sp-mango, st-prime-040, sp-pom, st-15, sp-mojito).
const FEATURED_SKUS = [
  "SUL-STL-250",
  "SUL-SPK-MAP-330",
  "SUL-STL-PRIME-400",
  "SUL-SPK-POM-330",
  "SUL-STL-1500",
  "SUL-SPK-MOJ-330",
];

export default async function HomePage() {
  const t = await getTranslations("home");
  const tWholesale = await getTranslations("wholesale");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();
  const content = await getSiteContent("home");
  // Sanity-edited copy wins when present; messages.json is the fallback
  // for a field nobody's touched in Studio yet (see src/lib/site-content.ts).
  const c = (key: string) => pick(content, key, locale, t(key));
  const viewer = getViewer();

  const allProducts = await prisma.product.findMany({ where: { isActive: true } });
  const bySku = new Map(allProducts.map((p) => [p.sku, p]));
  const featured = FEATURED_SKUS.map((sku) => bySku.get(sku)).filter((p): p is NonNullable<typeof p> => !!p);

  const sparklingFlavors = allProducts.filter((p) => p.type === "SPARKLING" && p.flavor);
  const coreStillSizes = Array.from(
    new Set(allProducts.filter((p) => p.type === "STILL" && p.name !== "Sultan Prime").map((p) => p.sizeMl))
  ).sort((a, b) => a - b);
  const priceFrom = (type: "SPARKLING" | "STILL") =>
    Math.min(...allProducts.filter((p) => p.type === type).map((p) => resolvePrice(p, viewer)));

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <Image src="/uploads/breadcrumb-banner.jpg" alt="" fill priority className={styles.heroImage} />
        </div>
        <div className={styles.heroScrim} />
        <span className={styles.heroRing} aria-hidden />
        <span className={`${styles.heroRing} ${styles.heroRing2}`} aria-hidden />
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>{c("heroKicker")}</p>
          <h1 className={styles.heroTitle}>{c("heroTitle")}</h1>
          <p className={styles.heroSubtitle}>{c("heroSubtitle")}</p>
          <div className={styles.heroActions}>
            <Link href="/products">
              <Button variant="secondary" className={styles.heroPrimary}>
                {c("ctaShop")}
              </Button>
            </Link>
            <Link href="/wholesale">
              <Button variant="outline" className={styles.heroOutline}>
                {c("ctaWholesale")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.lines}>
        <div className={styles.lineSparkling}>
          <span className={styles.lineKicker}>{t("linesSparklingKicker")}</span>
          <h2 className={styles.lineTitle}>{t("linesSparklingTitle")}</h2>
          <p className={styles.lineBody}>{t("linesSparklingBody")}</p>
          <div className={styles.swatchGrid}>
            {sparklingFlavors.map((p) => (
              <div key={p.id} className={styles.swatch}>
                <span
                  className={styles.swatchChip}
                  style={{ background: (p.flavor && FLAVOR_SWATCH[p.flavor]) || "var(--sultan-sun)" }}
                />
                <span className={styles.swatchLabel}>{localizeFlavor(p.flavor, locale as Locale)}</span>
              </div>
            ))}
          </div>
          <div className={styles.lineFooter}>
            <Link href="/products?type=SPARKLING">
              <Button className={styles.lineCtaSparkling}>{t("ctaSeeSparkling")}</Button>
            </Link>
            <span className={styles.lineFrom}>{t("from", { price: formatMur(priceFrom("SPARKLING")) })}</span>
          </div>
        </div>
        <div className={styles.lineStill}>
          <div className={styles.lineStillContent}>
            <span className={styles.lineKicker}>{t("linesStillKicker")}</span>
            <h2 className={styles.lineTitleLight}>{t("linesStillTitle")}</h2>
            <div className={styles.sizeRow}>
              {coreStillSizes.map((ml) => (
                <span key={ml} className={styles.sizeNumber}>
                  {formatLiters(ml)}
                </span>
              ))}
            </div>
            <p className={styles.lineBodyLight}>{t("linesStillBody")}</p>
            <div className={styles.lineFooter}>
              <Link href="/products?type=STILL">
                <Button className={styles.lineCtaStill}>{t("ctaSeeStill")}</Button>
              </Link>
              <span className={styles.lineFromLight}>{t("from", { price: formatMur(priceFrom("STILL")) })}</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.wave} aria-hidden>
        <svg viewBox="0 0 1440 88" preserveAspectRatio="none">
          <path
            d="M0,30 C180,-4 360,64 540,30 C720,-4 900,64 1080,30 C1260,-4 1350,46 1440,30"
            fill="none"
            stroke="var(--sultan-navy)"
            strokeOpacity="0.14"
          />
          <path
            d="M0,46 C180,12 360,80 540,46 C720,12 900,80 1080,46 C1260,12 1350,62 1440,46"
            fill="none"
            stroke="var(--sultan-sky)"
            strokeOpacity="0.6"
            strokeWidth="1.6"
          />
          <path
            d="M0,62 C180,28 360,96 540,62 C720,28 900,96 1080,62 C1260,28 1350,78 1440,62"
            fill="none"
            stroke="var(--sultan-teal)"
            strokeOpacity="0.28"
            strokeWidth="1.4"
          />
        </svg>
      </div>

      <Reveal>
        <section className={styles.origin}>
          <h2 className={styles.originHeading}>{t("originHeading")}</h2>
          <div className={styles.originGrid}>
            {ORIGIN_STEPS.map((step, i) => (
              <div key={step.img} className={styles.originStep}>
                <Image src={step.img} alt="" width={400} height={210} className={styles.originImg} />
                <div className={`${styles.originConnector} ${i === ORIGIN_STEPS.length - 1 ? styles.originConnectorLast : ""}`}>
                  <span className={styles.originDot} />
                  <h3 className={styles.originTitle}>{t(step.titleKey)}</h3>
                  <p className={styles.originBody}>{t(step.bodyKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.featured}>
          <h2 className={styles.featuredTitle}>{t("featured")}</h2>
          <div className={styles.grid}>
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                product={{
                  id: product.id,
                  name: product.name,
                  type: product.type,
                  flavor: product.flavor,
                  sizeMl: product.sizeMl,
                  imageUrl: product.imageUrl,
                  displayPrice: resolvePrice(product, viewer),
                  stockQuantity: product.stockQuantity,
                }}
              />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.social}>
          <div className={styles.socialHeader}>
            <h2 className={styles.socialTitle}>{c("socialTitle")}</h2>
            <a
              href="https://instagram.com/sultan_mauritius"
              target="_blank"
              rel="noreferrer"
              className={styles.socialCta}
            >
              {c("socialCta")}
            </a>
          </div>
          <div className={styles.socialGrid}>
            {SOCIAL_IMAGES.map((img) => (
              <div key={img.src} className={styles.socialTile} style={{ flexBasis: img.width }}>
                <Image src={img.src} alt="" fill sizes="(max-width: 640px) 60vw, 420px" className={styles.socialImg} />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.wholesaleBanner}>
          <div className={styles.wholesaleBannerInner}>
            <div>
              <h2 className={styles.wholesaleBannerTitle}>{tWholesale("title")}</h2>
              <p className={styles.wholesaleBannerBody}>{tWholesale("subtitle")}</p>
            </div>
            <div className={styles.wholesaleBannerActions}>
              <Link href="/wholesale">
                <Button variant="secondary" className={styles.wholesaleBannerPrimary}>
                  {c("ctaWholesale")}
                </Button>
              </Link>
              <Link href="/stockists">
                <Button variant="outline" className={styles.wholesaleBannerOutline}>
                  {tNav("stockists")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}

// "From Uludağ to your table" — literal port of the canvas's 3-step origin
// story, same images (matterhorn/dolum-tesisi/ig-12), same beats.
const ORIGIN_STEPS = [
  { img: "/uploads/matterhorn-alps-mountains.jpg", titleKey: "origin1Title", bodyKey: "origin1Body" },
  { img: "/uploads/dolum-tesisi.jpg", titleKey: "origin2Title", bodyKey: "origin2Body" },
  { img: "/uploads/ig-12.jpg", titleKey: "origin3Title", bodyKey: "origin3Body" },
] as const;

function formatLiters(ml: number): string {
  const liters = ml / 1000;
  return liters >= 1 ? `${liters}L` : `${liters.toFixed(2)}L`;
}

// Same four "in the wild" shots as the canvas, same varied widths.
const SOCIAL_IMAGES = [
  { src: "/uploads/ig-11.jpg", width: "420px" },
  { src: "/uploads/ig-13.jpg", width: "340px" },
  { src: "/uploads/ig-27.jpg", width: "380px" },
  { src: "/uploads/ig-03.jpg", width: "420px" },
];
