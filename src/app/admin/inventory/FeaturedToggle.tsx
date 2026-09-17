"use client";

import { useTransition } from "react";
import { setProductFeatured } from "@/app/actions/inventory";
import styles from "./page.module.css";

export default function FeaturedToggle({
  productId,
  isFeatured,
}: {
  productId: string;
  isFeatured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={styles.statusToggleButton}
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(() => {
          setProductFeatured(productId, !isFeatured);
        });
      }}
    >
      {pending ? "…" : isFeatured ? "★ Featured" : "Feature"}
    </button>
  );
}
