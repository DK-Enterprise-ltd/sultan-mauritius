"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { STANDARD_DELIVERY_AREAS } from "@/lib/delivery";
import styles from "./DeliveryAreaCheck.module.css";

export default function DeliveryAreaCheck() {
  const t = useTranslations("deliveryCheck");
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<string | null>(null);

  const match = checked
    ? STANDARD_DELIVERY_AREAS.find((area) => area.toLowerCase() === checked.toLowerCase())
    : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) setChecked(input.trim());
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          {t("label")}
          <input
            className={styles.input}
            list="delivery-areas"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setChecked(null);
            }}
            placeholder={t("placeholder")}
          />
        </label>
        <datalist id="delivery-areas">
          {STANDARD_DELIVERY_AREAS.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
        <button type="submit" className={styles.button}>
          {t("checkButton")}
        </button>
      </form>
      {checked &&
        (match ? (
          <p className={styles.yes}>{t("available", { area: match })}</p>
        ) : (
          <p className={styles.no}>{t("pickupOnly", { area: checked })}</p>
        ))}
    </div>
  );
}
