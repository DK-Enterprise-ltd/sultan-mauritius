import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InquiryForm from "@/components/InquiryForm/InquiryForm";
import Reveal from "@/components/Reveal/Reveal";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return pageMetadata({
    locale: params.locale as Locale,
    path: "/wholesale",
    title: t("wholesaleTitle"),
    description: t("wholesaleDescription"),
  });
}

export default async function WholesalePage() {
  const t = await getTranslations("wholesale");
  return (
    <>
      <section className={styles.hero}>
        <p className={styles.kicker}>{t("kicker")}</p>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </section>
      <Reveal className={styles.formWrap}>
        <InquiryForm wholesale />
        <p className={styles.talk}>
          {t("talkPrefix")}{" "}
          <a href="tel:+23050000000">+230 5 000 0000</a> {t("talkOr")} <a href="mailto:hello@sultan.mu">hello@sultan.mu</a>
        </p>
      </Reveal>
    </>
  );
}
