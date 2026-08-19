import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export default function Button({ variant = "primary", className, ...rest }: Props) {
  return (
    <button
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
