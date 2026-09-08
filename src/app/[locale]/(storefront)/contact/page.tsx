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
    path: "/contact",
    title: t("contactTitle"),
    description: t("contactDescription"),
  });
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const locale = await getLocale();
  const content = await getSiteContent("contact");
  const c = (key: string) => pick(content, key, locale, t(key));
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{c("title")}</h1>
      <p className={styles.subtitle}>{c("subtitle")}</p>
      <Reveal>
        <InquiryForm />
      </Reveal>
    </div>
  );
}
