import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import InquiryForm from "@/components/InquiryForm/InquiryForm";
import Reveal from "@/components/Reveal/Reveal";
import { pageMetadata } from "@/lib/seo";
import { getSiteContent, pick } from "@/lib/site-content";
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
  const locale = await getLocale();
  const content = await getSiteContent("wholesale");
  const c = (key: string) => pick(content, key, locale, t(key));
  return (
    <>
      <section className={styles.hero}>
        <p className={styles.kicker}>{c("kicker")}</p>
        <h1 className={styles.title}>{c("title")}</h1>
        <p className={styles.subtitle}>{c("subtitle")}</p>
      </section>
      <Reveal className={styles.formWrap}>
        <InquiryForm wholesale />
        <p className={styles.talk}>
          {c("talkPrefix")}{" "}
          <a href="tel:+23050000000">+230 5 000 0000</a> {c("talkOr")} <a href="mailto:hello@sultan.mu">hello@sultan.mu</a>
        </p>
      </Reveal>
    </>
  );
}
