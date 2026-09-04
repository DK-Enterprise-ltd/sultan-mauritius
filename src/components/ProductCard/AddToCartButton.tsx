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
};

export default function AddToCartButton(props: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const t = useTranslations("product");

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        addItem(props);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? `${t("added")} ✓` : t("addToCart")}
    </Button>
  );
}
