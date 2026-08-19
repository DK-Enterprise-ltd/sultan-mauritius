import InquiryForm from "@/components/InquiryForm/InquiryForm";
import styles from "./page.module.css";

export default function WholesalePage() {
  return (
    <>
      <section className={styles.hero}>
        <p className={styles.kicker}>For retailers &amp; restaurants</p>
        <h1 className={styles.title}>Wholesale accounts</h1>
        <p className={styles.subtitle}>
          Tell us your estimated volume and we&apos;ll set you up with wholesale pricing
          and delivery.
        </p>
      </section>
      <div className={styles.formWrap}>
        <InquiryForm wholesale />
      </div>
    </>
  );
}
