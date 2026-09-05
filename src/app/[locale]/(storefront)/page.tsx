import Image, { getImageProps } from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveProducts, getProductCopyBySku } from "@/lib/catalog";
import { getViewer } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import { getSiteContent, pick } from "@/lib/site-content";
import ProductCard from "@/components/ProductCard/ProductCard";
import Button from "@/components/Button/Button";
import Reveal from "@/components/Reveal/Reveal";
import FlavorShowcase, { type ShowcaseItem } from "@/components/FlavorShowcase/FlavorShowcase";
import { localizeFlavor } from "@/lib/catalog-i18n";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// Sensory tasting notes per flavour: not in the Turkey catalogue (which only
// lists format/size), so these are written for the showcase strip rather
// than sourced from brand material. Water-quality facts stay factual
// (see productDetail.waterQuality* in messages/*.json).
const FLAVOR_TASTE: Record<string, { en: string; fr: string; color: string; scale?: number }> = {
  Lemon: { en: "Bright and citrus-forward, with a clean, tart finish.", fr: "Vive et citronnée, avec une finale nette et acidulée.", color: "#d9c84a" },
  Apple: { en: "Crisp and lightly sweet, like biting into a fresh apple.", fr: "Croquante et légèrement sucrée, comme une pomme fraîche.", color: "#c7c25a" },
  Mandarin: { en: "Juicy and sun-ripened, with a fragrant citrus lift.", fr: "Juteuse et gorgée de soleil, avec un parfum d'agrume.", color: "#e8963a" },
  Sade: { en: "Plain sparkling mineral water: clean, mineral, no fruit added.", fr: "Eau minérale gazeuse nature : pure, minérale, sans fruit ajouté.", color: "#5c7a8a" },
  Gazoz: { en: "The original: clean, delicately sweet, and endlessly refreshing.", fr: "L'original : pur, délicatement sucré et infiniment rafraîchissant.", color: "#8fb9c2" },
  "Mango & Pineapple": { en: "Tropical and golden, sweet mango layered over tangy pineapple.", fr: "Tropicale et dorée, mangue sucrée relevée d'ananas acidulé.", color: "#e8b93a" },
  "C-Extra": { en: "Bright lemon with a boost of vitamin C.", fr: "Citron vif avec un supplément de vitamine C.", color: "#a8c23a" },
  Mojito: { en: "Cool mint and lime, crisp enough to feel like a garden terrace.", fr: "Menthe fraîche et citron vert, aussi vive qu'une terrasse ombragée.", color: "#7fa84a" },
  "Black Mulberry & Blackcurrant": { en: "Dark, jammy fruit with a bold, wine-like depth.", fr: "Fruits noirs confiturés, avec une profondeur presque vineuse.", color: "#6e1746" },
  "Berry & Hibiscus": {
    en: "Tart mixed berries lifted by floral hibiscus notes.",
    fr: "Baies acidulées relevées de notes florales d'hibiscus.",
    color: "#c93b4e",
    // ponytail: no single-bottle shot of this flavor exists in the
    // reference photos, only the 6-pack shrink mockup, which is landscape
    // (1.48:1) instead of portrait like every other bottle photo here. The
    // showcase box is height-bound under object-fit: contain, so a
    // landscape source renders shorter than the rest; scale compensates
    // partway without overflowing the box. Swap for a real single-bottle
    // photo when one exists and drop this.
    scale: 1.25,
  },
  "Watermelon Strawberry": { en: "Juicy summer watermelon rounded out by sweet strawberry.", fr: "Pastèque juteuse d'été, adoucie par la fraise.", color: "#e2607a" },
};

const STILL_TASTE: Record<number, { en: string; fr: string }> = {
  250: { en: "Light and crisp, sized for sharing at any gathering.", fr: "Légère et vive, un format fait pour être partagé." },
  500: { en: "The everyday size, clean and refreshing from first sip to last.", fr: "Le format du quotidien, pur et rafraîchissant jusqu'à la dernière gorgée." },
  1500: { en: "Smooth and neutral, big enough for the whole table.", fr: "Douce et neutre, assez grande pour toute la table." },
};

// Curated selection, matching the design canvas's featured picks 1:1
// (st-025, sp-mango, st-prime-040, sp-c-extra, st-15, sp-mojito).
const FEATURED_SKUS = [
  "SUL-STL-250",
  "SUL-SPK-MAP-200",
  "SUL-STL-PRIME-400",
  "SUL-SPK-CEX-200",
  "SUL-STL-1500",
  "SUL-SPK-MOJ-200",
];

export default async function HomePage() {
  const t = await getTranslations("home");
  const tDetail = await getTranslations("productDetail");
  const tWholesale = await getTranslations("wholesale");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();
  const isFr = locale === "fr";
  const content = await getSiteContent("home");
  // Sanity-edited copy wins when present; messages.json is the fallback
  // for a field nobody's touched in Studio yet (see src/lib/site-content.ts).
  const c = (key: string) => pick(content, key, locale, t(key));
  const viewer = getViewer();

  const allProducts = await getActiveProducts();
  const bySku = new Map(allProducts.map((p) => [p.sku, p]));
  const featured = FEATURED_SKUS.map((sku) => bySku.get(sku)).filter((p): p is NonNullable<typeof p> => !!p);

  // packCount === 1 only: the showcase is one taste card per flavor, not
  // a full catalog listing, so the 6-pack/24-case SKUs are excluded here.
  const sparklingFlavors = allProducts.filter((p) => p.type === "SPARKLING" && p.flavor && p.packCount === 1);
  const coreStillProducts = allProducts
    .filter((p) => p.type === "STILL" && p.name !== "Sultan Prime")
    .sort((a, b) => a.sizeMl - b.sizeMl);

  const waterFacts = [
    { label: tDetail("sodiumLabel"), value: tDetail("sodiumValue") },
    { label: tDetail("phLabel"), value: tDetail("phValue") },
    { label: tDetail("sulfateLabel"), value: tDetail("sulfateValue") },
  ];

  const sparklingShowcase: ShowcaseItem[] = await Promise.all(
    sparklingFlavors.map(async (p): Promise<ShowcaseItem> => {
      const copy = await getProductCopyBySku(p.sku);
      const flavorLabel = localizeFlavor(p.flavor, locale as Locale) ?? p.flavor ?? "";
      const invented = (p.flavor && FLAVOR_TASTE[p.flavor]) || null;
      return {
        id: p.id,
        name: flavorLabel,
        subtitle: `${t("linesSparklingKicker")} · ${p.sizeMl}ml`,
        description: c("sparklingBody"),
        taste: (isFr ? copy?.tasteNoteFr : copy?.tasteNote) || invented?.[isFr ? "fr" : "en"] || tDetail("tasteSparkling"),
        bestServedLabel: tDetail("bestServedHeading"),
        bestServed: (isFr ? copy?.bestServedNoteFr : copy?.bestServedNote) || tDetail("bestServedSparkling"),
        tasteLabel: tDetail("tasteHeading"),
        factsLabel: tDetail("waterQualityHeading"),
        facts: waterFacts,
        color: invented?.color || "#e8963a",
        imageUrl: p.imageUrl,
        imageScale: invented?.scale,
      };
    })
  );

  const stillShowcase: ShowcaseItem[] = await Promise.all(
    coreStillProducts.map(async (p): Promise<ShowcaseItem> => {
      const copy = await getProductCopyBySku(p.sku);
      const invented = STILL_TASTE[p.sizeMl] || null;
      return {
        id: p.id,
        name: formatLiters(p.sizeMl),
        subtitle: t("linesStillKicker"),
        description: c("stillBody"),
        taste: (isFr ? copy?.tasteNoteFr : copy?.tasteNote) || invented?.[isFr ? "fr" : "en"] || tDetail("tasteStill"),
        bestServedLabel: tDetail("bestServedHeading"),
        bestServed: (isFr ? copy?.bestServedNoteFr : copy?.bestServedNote) || tDetail("bestServedStill"),
        tasteLabel: tDetail("tasteHeading"),
        factsLabel: tDetail("waterQualityHeading"),
        facts: waterFacts,
        color: "#1b9aae",
        imageUrl: p.imageUrl,
      };
    })
  );

  // Art-directed hero: a portrait shot crops badly into a full-bleed 100vh
  // band on a wide screen and vice versa, so mobile and desktop each get a
  // different source image via a native <picture>, not just a smaller crop
  // of the same one. Both are agency photography (../reference/Customer
  // upload/Agency), swapped in for the old ig-28.jpg Instagram grab.
  const heroCommon = { alt: "", width: 1600, height: 1600, priority: true, sizes: "100vw" } as const;
  const {
    props: { srcSet: heroMobileSrcSet },
  } = getImageProps({ ...heroCommon, src: "/Assets/Lifestyle/hero-mobile-ice.jpg" });
  const {
    props: { srcSet: heroDesktopSrcSet, ...heroDesktopRest },
  } = getImageProps({ ...heroCommon, src: "/Assets/Lifestyle/hero-desktop-picnic.jpg" });

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <picture>
            <source media="(max-width: 640px)" srcSet={heroMobileSrcSet} />
            <source media="(min-width: 641px)" srcSet={heroDesktopSrcSet} />
            <img {...heroDesktopRest} className={styles.heroImage} />
          </picture>
        </div>
        <div className={styles.heroScrim} />
        <span className={styles.heroRing} aria-hidden />
        <span className={`${styles.heroRing} ${styles.heroRing2}`} aria-hidden />
        <div className={styles.heroContent}>
          <span className={styles.heroDot} aria-hidden />
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

      <FlavorShowcase
        items={sparklingShowcase}
        sectionTitle={c("sparklingTitle")}
        prevLabel={t("showcasePrev")}
        nextLabel={t("showcaseNext")}
      />
      <FlavorShowcase
        items={stillShowcase}
        sectionTitle={c("stillTitle")}
        prevLabel={t("showcasePrev")}
        nextLabel={t("showcaseNext")}
      />

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
              <Reveal key={step.img} delay={i * 100} className={styles.originStep}>
                <Image src={step.img} alt="" width={400} height={210} className={styles.originImg} />
                <div className={`${styles.originConnector} ${i === ORIGIN_STEPS.length - 1 ? styles.originConnectorLast : ""}`}>
                  <span className={styles.originDot} />
                  <h3 className={styles.originTitle}>{t(step.titleKey)}</h3>
                  <p className={styles.originBody}>{t(step.bodyKey)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.featured}>
          <h2 className={styles.featuredTitle}>{t("featured")}</h2>
          <div className={styles.grid}>
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 6) * 70}>
                <ProductCard
                  index={index}
                  isB2B={viewer.isB2B}
                  product={{
                    id: product.id,
                    name: product.name,
                    type: product.type,
                    flavor: product.flavor,
                    sizeMl: product.sizeMl,
                    packCount: product.packCount,
                    imageUrl: product.imageUrl,
                    displayPrice: resolvePrice(product, viewer),
                    stockQuantity: product.stockQuantity,
                  }}
                />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.social}>
          <div className={styles.socialCard}>
            <div className={styles.socialBrand}>
              <svg className={styles.igGlyph} width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                <rect width="24" height="24" rx="6" fill="url(#sultan-ig-grad)" />
                <rect x="6" y="6" width="12" height="12" rx="4" stroke="#fff" strokeWidth="1.6" fill="none" />
                <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.6" fill="none" />
                <circle cx="16.3" cy="7.7" r="0.9" fill="#fff" />
                <defs>
                  <linearGradient id="sultan-ig-grad" x1="0" y1="24" x2="24" y2="0">
                    <stop stopColor="#FEE411" />
                    <stop offset="0.3" stopColor="#F6002B" />
                    <stop offset="0.65" stopColor="#B900B4" />
                    <stop offset="1" stopColor="#5A00A8" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={styles.igHandle}>@sultan_mauritius</span>
            </div>
            <h2 className={styles.socialTitle}>{c("socialTitle")}</h2>
            <div className={styles.socialGrid}>
              {SOCIAL_IMAGES.map((img, i) => (
                <Reveal
                  key={img.src}
                  delay={(i % 6) * 60}
                  className={styles.socialTile}
                  style={{ flexBasis: img.width }}
                >
                  <Image src={img.src} alt="" fill sizes="(max-width: 640px) 60vw, 420px" className={styles.socialImg} />
                  <svg className={styles.socialBadge} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Reveal>
              ))}
            </div>
            <a
              href="https://instagram.com/sultan_mauritius"
              target="_blank"
              rel="noreferrer"
              className={styles.socialFollow}
            >
              {c("socialCta")}
            </a>
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
  { img: "/Assets/Origin/matterhorn-alps-mountains.jpg", titleKey: "origin1Title", bodyKey: "origin1Body" },
  { img: "/Assets/Origin/dolum-tesisi.jpg", titleKey: "origin2Title", bodyKey: "origin2Body" },
  { img: "/Assets/Lifestyle/ig-12.jpg", titleKey: "origin3Title", bodyKey: "origin3Body" },
] as const;

function formatLiters(ml: number): string {
  const liters = ml / 1000;
  return liters >= 1 ? `${liters}L` : `${liters.toFixed(2)}L`;
}

// Same four "in the wild" shots as the canvas, same varied widths.
const SOCIAL_IMAGES = [
  { src: "/Assets/Lifestyle/ig-11.jpg", width: "420px" },
  { src: "/Assets/Lifestyle/ig-13.jpg", width: "340px" },
  { src: "/Assets/Lifestyle/ig-27.jpg", width: "380px" },
  { src: "/Assets/Lifestyle/ig-03.jpg", width: "420px" },
];
