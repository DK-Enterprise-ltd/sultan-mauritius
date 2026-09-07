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
  quantity?: number;
};

export default function AddToCartButton({ quantity = 1, ...item }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const t = useTranslations("product");

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        addItem(item, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? `${t("added")} ✓` : t("addToCart")}
    </Button>
  );
}
