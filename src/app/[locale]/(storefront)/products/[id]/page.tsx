import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveProducts, getProductById, getProductCopyBySku } from "@/lib/catalog";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import { formatMur } from "@/lib/format";
import { localizeFlavor, localizeProductName } from "@/lib/catalog-i18n";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { B2C_DELIVERY_FEE_MUR } from "@/lib/delivery";
import type { Locale } from "@/i18n/routing";
import AddToCartButton from "@/components/ProductCard/AddToCartButton";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string };
}): Promise<Metadata> {
  const locale = params.locale as Locale;
  const product = await getProductById(params.id);
  if (!product) return {};

  const name = localizeProductName(product.name, locale);
  const flavor = localizeFlavor(product.flavor, locale);
  const title = flavor ? `${name}, ${flavor}` : name;

  return pageMetadata({
    locale,
    path: `/products/${params.id}`,
    title,
    description: `${title}, ${product.sizeMl}ml. Sultan mineral water, sourced from Turkey, delivered across Mauritius.`,
    image: product.imageUrl ? { url: `${SITE_URL}${product.imageUrl}`, width: 1200, height: 1200 } : undefined,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const t = await getTranslations("productDetail");
  const tProduct = await getTranslations("product");
  const viewer = getViewer();
  const product = await getProductById(params.id);
  if (!product || !product.isActive) notFound();

  const locale = params.locale as Locale;
  const name = localizeProductName(product.name, locale);
  const flavor = localizeFlavor(product.flavor, locale);
  const price = resolvePrice(product, viewer);
  const outOfStock = product.stockQuantity <= 0;
  const isSparkling = product.type === "SPARKLING";

  // Single bottle and its pre-packed multi-buys (6-pack, 24-case) are
  // separate Product rows sharing type/flavor/size; group them here as
  // variants of one page instead of listing packs as their own shop entries.
  const variants = (await getActiveProducts())
    .filter((p) => p.type === product.type && p.flavor === product.flavor && p.sizeMl === product.sizeMl)
    .sort((a, b) => a.packCount - b.packCount);
  const variantLabel = (packCount: number) =>
    packCount === 1 ? t("packSingle") : packCount === 24 ? tProduct("caseLabel", { count: 24 }) : tProduct("packLabel", { count: packCount });

  // DB-stored copy (ProductCopy table, by SKU) wins when present; the
  // type-level static copy below is the fallback — see the ponytail note
  // on ProductCopy in prisma/schema.prisma for why this isn't per-flavor.
  const copy = await getProductCopyBySku(product.sku);
  const isFr = locale === "fr";
  const tasteNote =
    (isFr ? copy?.tasteNoteFr : copy?.tasteNote) || t(isSparkling ? "tasteSparkling" : "tasteStill");
  const bestServedNote =
    (isFr ? copy?.bestServedNoteFr : copy?.bestServedNote) ||
    t(isSparkling ? "bestServedSparkling" : "bestServedStill");
  const specNote = isFr ? copy?.specNoteFr : copy?.specNote;

  const waterQuality = [
    { label: t("sodiumLabel"), value: t("sodiumValue") },
    { label: t("phLabel"), value: t("phValue") },
    { label: t("sulfateLabel"), value: t("sulfateValue") },
    { label: t("chlorideLabel"), value: t("chlorideValue") },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: flavor ? `${name}, ${flavor}, ${product.sizeMl}ml` : `${name}, ${product.sizeMl}ml`,
    image: product.imageUrl ? `${SITE_URL}${product.imageUrl}` : undefined,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Sultan" },
    offers: {
      "@type": "Offer",
      priceCurrency: "MUR",
      price: price.toString(),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${SITE_URL}/${locale}/products/${product.id}`,
      // Real delivery terms (src/lib/delivery.ts): flat B2C fee within the
      // standard delivery areas, Mauritius only.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: B2C_DELIVERY_FEE_MUR, currency: "MUR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "MU" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 4, unitCode: "d" },
        },
      },
      // Real policy (src/app/[locale]/(storefront)/legal/cancellation-refund):
      // damage/shortage must be reported at the point of delivery; no
      // change-of-mind returns once a delivery is inspected and accepted.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "MU",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnLink: `${SITE_URL}/${locale}/legal/cancellation-refund`,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: tProduct(isSparkling ? "sparkling" : "still"), item: `${SITE_URL}/${locale}/products` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/${locale}/products/${product.id}` },
    ],
  };

  return (
    <div className={`${styles.page} ${isSparkling ? styles.sparkling : styles.still}`}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/products" className={styles.back}>
        {t("back")}
      </Link>

      <div className={styles.layout}>
        <div className={styles.media}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={name}
              fill
              draggable={false}
              sizes="(max-width: 860px) 100vw, 480px"
              className={styles.image}
              priority
            />
          ) : (
            <span className={styles.mediaLabel}>{product.sizeMl}ml</span>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.type}>
            {isSparkling ? tProduct("sparkling") : tProduct("still")}
            {product.packCount === 24 && ` · ${tProduct("caseLabel", { count: 24 })}`}
            {product.packCount > 1 && product.packCount !== 24 && ` · ${tProduct("packLabel", { count: product.packCount })}`}
          </p>
          <h1 className={styles.name}>{name}</h1>
          {flavor && <p className={styles.flavor}>{flavor}</p>}
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatMur(price)}</span>
            {outOfStock ? (
              <span className={styles.outOfStock}>{tProduct("outOfStock")}</span>
            ) : (
              <AddToCartButton
                productId={product.id}
                name={product.name}
                flavor={product.flavor}
                sizeMl={product.sizeMl}
                imageUrl={product.imageUrl}
                unitPrice={price}
              />
            )}
          </div>

          {variants.length > 1 && (
            <div className={styles.packRow}>
              <span className={styles.chipLabel}>{t("packHeading")}</span>
              <div className={styles.packOptions}>
                {variants.map((v) =>
                  v.id === product.id ? (
                    <span key={v.id} className={`${styles.packOption} ${styles.packOptionActive}`}>
                      {variantLabel(v.packCount)}
                    </span>
                  ) : (
                    <Link key={v.id} href={`/products/${v.id}`} className={styles.packOption}>
                      {variantLabel(v.packCount)}
                    </Link>
                  )
                )}
              </div>
            </div>
          )}

          <section className={styles.block}>
            <h2 className={styles.blockHeading}>{t("tasteHeading")}</h2>
            <p>{tasteNote}</p>
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockHeading}>{t("bestServedHeading")}</h2>
            <p>{bestServedNote}</p>
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockHeading}>{t("specHeading")}</h2>
            <dl className={styles.specList}>
              <div className={styles.specRow}>
                <dt>{t("specType")}</dt>
                <dd>{isSparkling ? tProduct("sparkling") : tProduct("still")}</dd>
              </div>
              <div className={styles.specRow}>
                <dt>{t("specSize")}</dt>
                <dd>{product.sizeMl}ml</dd>
              </div>
            </dl>
            <p className={styles.specNote}>{t("specSourced")}</p>
            <p className={styles.specNote}>{t("specBottled")}</p>
            {specNote && <p className={styles.specNote}>{specNote}</p>}
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockHeading}>{t("waterQualityHeading")}</h2>
            <dl className={styles.factGrid}>
              {waterQuality.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt className={styles.factLabel}>{fact.label}</dt>
                  <dd className={styles.factValue}>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.specNote}>{t("waterQualityNote")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
