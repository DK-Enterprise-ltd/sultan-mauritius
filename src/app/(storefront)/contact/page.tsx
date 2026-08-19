import InquiryForm from "@/components/InquiryForm/InquiryForm";
import styles from "./page.module.css";

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Get in touch</h1>
      <p className={styles.subtitle}>
        Questions about an order, a product, or anything else — send us a message.
      </p>
      <InquiryForm />
    </div>
  );
}
