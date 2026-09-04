"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Reveal.module.css";

// ponytail: IntersectionObserver + a CSS class toggle, not a library —
// this is the entire feature. prefers-reduced-motion is handled in CSS,
// not here, so it stays correct even if this file is copy-pasted.
export default function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => el.classList.add(styles.visible);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    // Safety net: real content should never stay invisible-but-clickable
    // forever just because the observer didn't fire (browser extension
    // interference, an already-in-view element on some mobile browsers,
    // etc.). Force it visible after a bit regardless.
    const timeout = setTimeout(reveal, 1200);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={ref} className={[styles.reveal, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
