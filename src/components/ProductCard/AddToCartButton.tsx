"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import Button from "@/components/Button/Button";

type Props = {
  productId: string;
  name: string;
  flavor: string | null;
  sizeMl: number;
  unitPrice: number;
  isB2B?: boolean;
  caseSize?: number;
};

export default function AddToCartButton({ isB2B, caseSize, ...item }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const t = useTranslations("product");
  const bulk = isB2B && caseSize && caseSize > 1;

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        addItem(item, bulk ? caseSize : 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? `${t("added")} ✓` : bulk ? t("addCase", { count: caseSize }) : t("addToCart")}
    </Button>
  );
}
