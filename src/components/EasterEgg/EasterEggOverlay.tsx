"use client";

import Image from "next/image";
import { useEasterEgg } from "@/lib/easter-egg";
import styles from "./EasterEggOverlay.module.css";

// ponytail: instead of mutating every page's text/images individually,
// one full-page takeover covers hero + nav + footer at once. Upgrade to
// per-page content swaps only if the user wants the underlying site
// still visible/scrollable behind the egg.
const CONTENT: Record<"dumb" | "gucci", { src: string; caption: string }> = {
  dumb: { src: "/dumb&dumber.jpeg", caption: "Dumb and Dumber" },
  gucci: { src: "/morty_gucci.jpg", caption: "Gucci Morty" },
};

export default function EasterEggOverlay() {
  const kind = useEasterEgg();
  if (!kind) return null;

  const { src, caption } = CONTENT[kind];
  return (
    <div className={styles.overlay}>
      <Image src={src} alt={caption} fill className={styles.img} priority />
      <span className={styles.caption}>{caption}</span>
      <span className={styles.hint}>click a language button 5x to undo</span>
    </div>
  );
}
