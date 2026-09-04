import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/Button/Button";
import Reveal from "@/components/Reveal/Reveal";
import styles from "./page.module.css";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tHome = await getTranslations("home");
  const tp = await getTranslations("productDetail");

  const stats = [
    { value: tHome("legacyStat1Value"), label: tHome("legacyStat1Label") },
    { value: tHome("legacyStat2Value"), label: tHome("legacyStat2Label") },
    { value: tHome("legacyStat3Value"), label: tHome("legacyStat3Label") },
    { value: tHome("legacyStat4Value"), label: tHome("legacyStat4Label") },
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
          <p className={styles.kicker}>{t("heroKicker")}</p>
          <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
          <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>
        </div>
      </section>

      <Reveal>
        <section className={styles.legacy}>
          <h2 className={styles.legacyTitle}>{tHome("legacyTitle")}</h2>
          <p className={styles.legacyBody}>{tHome("legacyBody")}</p>
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
            <p className={styles.kickerLight}>{t("qualityKicker")}</p>
            <h2 className={styles.qualityTitle}>{t("qualityTitle")}</h2>
            <p className={styles.qualityBody}>{t("qualityBody")}</p>
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
          <h2 className={styles.paramsHeading}>{t("paramsHeading")}</h2>
          <p className={styles.paramsNote}>{t("paramsNote")}</p>
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
            <p className={styles.kicker}>{t("mauritiusKicker")}</p>
            <h2 className={styles.mauritiusTitle}>{t("mauritiusTitle")}</h2>
            <p className={styles.mauritiusBody}>{t("mauritiusBody")}</p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className={styles.gallery}>
          <h2 className={styles.galleryHeading}>{t("galleryHeading")}</h2>
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
              <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
              <p className={styles.ctaBody}>{t("ctaBody")}</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/products">
                <Button variant="secondary" className={styles.ctaPrimary}>
                  {tHome("ctaShop")}
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="outline" className={styles.ctaOutline}>
                  {tHome("ctaWholesale")}
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
