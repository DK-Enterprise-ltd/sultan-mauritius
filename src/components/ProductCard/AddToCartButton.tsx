"use client";

import { useState } from "react";
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

  return (
    <Button
      type="button"
      variant="primary"
      onClick={() => {
        addItem(props);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added ✓" : "Add to cart"}
    </Button>
  );
}
