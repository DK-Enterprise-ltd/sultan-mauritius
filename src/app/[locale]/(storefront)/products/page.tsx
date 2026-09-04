import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./page.module.css";

function formatSize(ml: number): string {
  const liters = ml / 1000;
  return liters >= 1 ? `${liters}L` : `${liters.toFixed(2)}L`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { type?: string; size?: string; flavor?: string };
}) {
  const t = await getTranslations("products");
  const viewer = getViewer();
  const type = searchParams.type === "SPARKLING" || searchParams.type === "STILL"
    ? searchParams.type
    : undefined;
  const size = searchParams.size;
  const flavor = searchParams.flavor;

  const allProducts = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const inLine = allProducts.filter((p) => !type || p.type === type);

  let products = inLine;
  if (size) products = products.filter((p) => formatSize(p.sizeMl) === size);
  if (flavor) products = products.filter((p) => p.flavor === flavor);

  const sizeOptions = Array.from(new Set(inLine.map((p) => formatSize(p.sizeMl)))).sort(
    (a, b) => parseFloat(a) - parseFloat(b)
  );
  const flavorOptions = Array.from(
    new Set(inLine.filter((p) => p.flavor).map((p) => p.flavor as string))
  );
  const showFlavorChips = type !== "STILL";
  const activeChipClass = type === "STILL" ? styles.chipActiveStill : styles.chipActiveSparkling;

  const linkWith = (params: Record<string, string | undefined>) => {
    const next = { type, size, flavor, ...params };
    const qs = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join("&");
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        {viewer.isB2B && <p className={styles.wholesaleNote}>{t("wholesaleNote")}</p>}
      </div>

      <div className={styles.lanes}>
        <Link
          href={type === "SPARKLING" ? "/products" : "/products?type=SPARKLING"}
          className={`${styles.lane} ${styles.laneSparkling} ${type === "SPARKLING" ? styles.laneActive : ""}`}
        >
          <span className={styles.laneTitle}>{t("filterSparkling")}</span>
          <span className={styles.laneNote}>{t("laneSparklingNote")}</span>
        </Link>
        <Link
          href={type === "STILL" ? "/products" : "/products?type=STILL"}
          className={`${styles.lane} ${styles.laneStill} ${type === "STILL" ? styles.laneActive : ""}`}
        >
          <span className={styles.laneTitle}>{t("filterStill")}</span>
          <span className={styles.laneNote}>{t("laneStillNote")}</span>
        </Link>
      </div>

      <div className={styles.chipRow}>
        <span className={styles.chipLabel}>Size</span>
        <Link href={linkWith({ size: undefined })} className={`${styles.chip} ${!size ? activeChipClass : ""}`}>
          All
        </Link>
        {sizeOptions.map((s) => (
          <Link
            key={s}
            href={linkWith({ size: size === s ? undefined : s })}
            className={`${styles.chip} ${size === s ? activeChipClass : ""}`}
          >
            {s}
          </Link>
        ))}
        <span className={styles.chipSpacer} />
        <span className={styles.resultCount}>
          {products.length} {products.length === 1 ? t("resultOne") : t("resultMany")}
        </span>
      </div>

      {showFlavorChips && flavorOptions.length > 0 && (
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>Flavour</span>
          <Link
            href={linkWith({ flavor: undefined })}
            className={`${styles.chip} ${!flavor ? activeChipClass : ""}`}
          >
            All flavours
          </Link>
          {flavorOptions.map((f) => (
            <Link
              key={f}
              href={linkWith({ flavor: flavor === f ? undefined : f })}
              className={`${styles.chip} ${flavor === f ? activeChipClass : ""}`}
            >
              {f}
            </Link>
          ))}
        </div>
      )}

      {(type || size || flavor) && (
        <Link href="/products" className={styles.clearFilter}>
          {t("filterAll")}
        </Link>
      )}

      {products.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              index={index}
              isB2B={viewer.isB2B}
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
      )}
    </div>
  );
}
