import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveGrignotiProducts } from "@/lib/catalog";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";
import { GRIGNOTI_TYPES, type GrignotiType } from "@/lib/product-lines";
import type { Locale } from "@/i18n/routing";
import { baloo } from "@/app/fonts";
import GrignotiCard from "@/components/GrignotiCard/GrignotiCard";
import Reveal from "@/components/Reveal/Reveal";
import styles from "./page.module.css";

// URL slug (?category=snacks) for each Grignoti product type, and the
// messages/*.json key for its label.
const CATEGORY_SLUGS: Record<GrignotiType, string> = { DRINK: "drinks", SNACK: "snacks", MISC: "misc" };

function categoryFromSlug(slug: string | undefined): GrignotiType | undefined {
  return GRIGNOTI_TYPES.find((type) => CATEGORY_SLUGS[type] === slug);
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return pageMetadata({
    locale: params.locale as Locale,
    path: "/grignoti",
    title: t("grignotiTitle"),
    description: t("grignotiDescription"),
  });
}

export default async function GrignotiStorePage({ searchParams }: { searchParams: { category?: string } }) {
  const t = await getTranslations("grignoti");
  const viewer = getViewer();
  const category = categoryFromSlug(searchParams.category);

  const allProducts = await getActiveGrignotiProducts();
  const products = category ? allProducts.filter((p) => p.type === category) : allProducts;
  const countFor = (type: GrignotiType) => allProducts.filter((p) => p.type === type).length;

  const tabs = [
    { key: undefined, label: t("all"), count: allProducts.length },
    ...GRIGNOTI_TYPES.map((type) => ({ key: type, label: t(CATEGORY_SLUGS[type]), count: countFor(type) })),
  ];

  return (
    <div className={`${styles.page} ${baloo.variable}`}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Image
            src="/Assets/Logo/grignoti-logo.png"
            alt="Grignoti"
            width={168}
            height={168}
            priority
            className={styles.logo}
          />
          <div className={styles.heroText}>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.tagline}>{t("tagline")}</p>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <nav className={styles.tabs} aria-label={t("categories")}>
          {tabs.map(({ key, label, count }) => {
            const isActive = category === key;
            return (
              <Link
                key={label}
                href={key ? `/grignoti?category=${CATEGORY_SLUGS[key]}` : "/grignoti"}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
                <span className={styles.tabCount}>{count}</span>
              </Link>
            );
          })}
          <span className={styles.resultCount}>
            {products.length} {products.length === 1 ? t("resultOne") : t("resultMany")}
          </span>
        </nav>

        {products.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {products.map((product, index) => (
              <Reveal key={product.id} delay={(index % 8) * 60}>
                <GrignotiCard
                  product={{
                    id: product.id,
                    name: product.name,
                    flavor: product.flavor,
                    sizeMl: product.sizeMl,
                    imageUrl: product.imageUrl,
                    categoryLabel: t(CATEGORY_SLUGS[product.type]),
                    displayPrice: resolvePrice(product, viewer),
                    stockQuantity: product.stockQuantity,
                  }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
