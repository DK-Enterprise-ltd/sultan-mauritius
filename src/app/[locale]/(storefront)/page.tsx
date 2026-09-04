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
import styles from "./page.module.css";

export default async function HomePage() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const content = await getSiteContent("home");
  // Sanity-edited copy wins when present; messages.json is the fallback
  // for a field nobody's touched in Studio yet (see src/lib/site-content.ts).
  const c = (key: string) => pick(content, key, locale, t(key));
  const viewer = getViewer();
  const featured = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <>
      <section className={styles.hero}>
        <Image
          src="/images/hero-sparkling.jpg"
          alt=""
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.heroScrim} />
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

      <section className={styles.story}>
        <Reveal className={styles.storyBlock}>
          <div className={styles.storyImage}>
            <Image
              src="/images/story-sparkling.jpg"
              alt=""
              fill
              className={styles.storyImg}
            />
          </div>
          <div className={styles.storyText}>
            <h2>{c("sparklingTitle")}</h2>
            <p>{c("sparklingBody")}</p>
          </div>
        </Reveal>
        <Reveal className={`${styles.storyBlock} ${styles.reverse}`}>
          <div className={styles.storyImage}>
            <Image
              src="/images/story-still.jpg"
              alt=""
              fill
              className={styles.storyImg}
            />
          </div>
          <div className={styles.storyText}>
            <h2>{c("stillTitle")}</h2>
            <p>{c("stillBody")}</p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <section className={styles.legacy}>
          <div className={styles.legacyImage}>
            <Image
              src="/images/range-lineup.jpg"
              alt=""
              fill
              className={styles.legacyImg}
            />
          </div>
          <div className={styles.legacyText}>
            <p className={styles.legacyKicker}>{c("legacyKicker")}</p>
            <h2 className={styles.legacyTitle}>{c("legacyTitle")}</h2>
            <p className={styles.legacyBody}>{c("legacyBody")}</p>
            <dl className={styles.legacyStats}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={styles.legacyStat}>
                  <dt className={styles.legacyStatValue}>
                    {c(`legacyStat${n}Value`)}
                  </dt>
                  <dd className={styles.legacyStatLabel}>
                    {c(`legacyStat${n}Label`)}
                  </dd>
                </div>
              ))}
            </dl>
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
            {SOCIAL_IMAGES.map((src) => (
              <div key={src} className={styles.socialTile}>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className={styles.socialImg}
                />
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </>
  );
}

// ponytail: static shortlist from the brand's own Instagram photos
// (../reference/instagram, vetted into public/images/social), not a live
// feed widget. Swap the list if the business wants different shots.
const SOCIAL_IMAGES = [
  "/images/social/social-1.jpg",
  "/images/social/social-2.jpg",
  "/images/social/social-3.jpg",
  "/images/social/social-4.jpg",
  "/images/social/social-5.jpg",
];
