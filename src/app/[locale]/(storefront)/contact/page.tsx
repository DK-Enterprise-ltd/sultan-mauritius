import { getTranslations } from "next-intl/server";
import InquiryForm from "@/components/InquiryForm/InquiryForm";
import styles from "./page.module.css";

export default async function ContactPage() {
  const t = await getTranslations("contact");
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>
      <InquiryForm />
    </div>
  );
}
