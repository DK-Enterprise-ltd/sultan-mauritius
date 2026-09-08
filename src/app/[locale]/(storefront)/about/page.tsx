import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { getSiteContent, pick } from "@/lib/site-content";
import type { Locale } from "@/i18n/routing";
import Button from "@/components/Button/Button";
import Reveal from "@/components/Reveal/Reveal";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return pageMetadata({
    locale: params.locale as Locale,
    path: "/about",
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  });
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tHome = await getTranslations("home");
  const tp = await getTranslations("productDetail");
  const locale = await getLocale();
  const [content, homeContent] = await Promise.all([getSiteContent("about"), getSiteContent("home")]);
  // Sanity-edited copy wins when present; messages.json is the fallback
  // for a field nobody's touched in Studio yet (see src/lib/site-content.ts).
  const c = (key: string) => pick(content, key, locale, t(key));
  // Legacy section is homeContent (shared with the homepage), not aboutContent.
  const cHome = (key: string) => pick(homeContent, key, locale, tHome(key));

  const stats = [
    { value: cHome("legacyStat1Value"), label: cHome("legacyStat1Label") },
    { value: cHome("legacyStat2Value"), label: cHome("legacyStat2Label") },
    { value: cHome("legacyStat3Value"), label: cHome("legacyStat3Label") },
    { value: cHome("legacyStat4Value"), label: cHome("legacyStat4Label") },
  ];

  const params = [
    { label: tp("sodiumLabel"), value: tp("sodiumValue") },
    { label: tp("phLabel"), value: tp("phValue") },
    { label: tp("sulfateLabel"), value: tp("sulfateValue") },
    { label: tp("chlorideLabel"), value: tp("chlorideValue") },
    { label: t("paramAluminumLabel"), value: t("paramAluminumValue") },
    { label: t("paramIronLabel"), value: t("paramIronValue") },
    { label: t("paramManganeseLabel"), value: t("paramManganeseValue") },
    { label: t("paramColiformLabel"), value: t("paramColiformValue") },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <Image src="/Assets/Origin/dolum-tesisi.jpg" alt="" fill priority className={styles.heroImage} />
        </div>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>{c("heroKicker")}</p>
          <h1 className={styles.heroTitle}>{c("heroTitle")}</h1>
          <p className={styles.heroSubtitle}>{c("heroSubtitle")}</p>
        </div>
      </section>

      <Reveal>
        <section className={styles.legacy}>
          <h2 className={styles.legacyTitle}>{cHome("legacyTitle")}</h2>
          <p className={styles.legacyBody}>{cHome("legacyBody")}</p>
          <div className={styles.statGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.quality}>
          <div className={styles.qualityText}>
            <p className={styles.kickerLight}>{c("qualityKicker")}</p>
            <h2 className={styles.qualityTitle}>{c("qualityTitle")}</h2>
            <p className={styles.qualityBody}>{c("qualityBody")}</p>
          </div>
          <div className={styles.facilityGrid}>
            <Image src="/Assets/Origin/lacin-facility.jpg" alt="" width={400} height={300} className={styles.facilityImg} />
            <Image src="/Assets/Origin/uludag-facility-1.jpg" alt="" width={400} height={300} className={styles.facilityImg} />
            <Image src="/Assets/Origin/uludag-facility-2.jpg" alt="" width={400} height={300} className={styles.facilityImg} />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.params}>
          <h2 className={styles.paramsHeading}>{c("paramsHeading")}</h2>
          <p className={styles.paramsNote}>{c("paramsNote")}</p>
          <div className={styles.paramGrid}>
            {params.map((p) => (
              <div key={p.label} className={styles.paramTile}>
                <span className={styles.paramValue}>{p.value}</span>
                <span className={styles.paramLabel}>{p.label}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.mauritius}>
          <div className={styles.mauritiusImageWrap}>
            <Image src="/Assets/Lifestyle/home-04.jpg" alt="" fill className={styles.mauritiusImage} />
          </div>
          <div className={styles.mauritiusText}>
            <p className={styles.kicker}>{c("mauritiusKicker")}</p>
            <h2 className={styles.mauritiusTitle}>{c("mauritiusTitle")}</h2>
            <p className={styles.mauritiusBody}>{c("mauritiusBody")}</p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.gallery}>
          <h2 className={styles.galleryHeading}>{c("galleryHeading")}</h2>
          <div className={styles.galleryGrid}>
            {GALLERY_IMAGES.map((img) => (
              <div key={img.src} className={styles.galleryTile} style={{ flexBasis: img.width }}>
                <Image src={img.src} alt="" fill sizes="(max-width: 640px) 60vw, 420px" className={styles.galleryImg} />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>{c("ctaTitle")}</h2>
              <p className={styles.ctaBody}>{c("ctaBody")}</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/products">
                <Button variant="secondary" className={styles.ctaPrimary}>
                  {cHome("ctaShop")}
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="outline" className={styles.ctaOutline}>
                  {cHome("ctaWholesale")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}

const GALLERY_IMAGES = [
  { src: "/Assets/Lifestyle/ig-33.jpg", width: "380px" },
  { src: "/Assets/Lifestyle/ig-36.jpg", width: "420px" },
  { src: "/Assets/Lifestyle/ig-39.jpg", width: "340px" },
  { src: "/Assets/Lifestyle/ig-44.jpg", width: "380px" },
  { src: "/Assets/Lifestyle/ig-46.jpg", width: "420px" },
  { src: "/Assets/Lifestyle/ig-52.jpg", width: "340px" },
];
