import { getTranslations } from "next-intl/server";
import InquiryForm from "@/components/InquiryForm/InquiryForm";
import styles from "./page.module.css";

export default async function WholesalePage() {
  const t = await getTranslations("wholesale");
  return (
    <>
      <section className={styles.hero}>
        <p className={styles.kicker}>{t("kicker")}</p>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </section>
      <div className={styles.formWrap}>
        <InquiryForm wholesale />
      </div>
    </>
  );
}
