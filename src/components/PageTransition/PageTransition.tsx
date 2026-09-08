"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import styles from "./PageTransition.module.css";

// ponytail: cross-fade on route change via a CSS class toggle, not GSAP —
// same idiom as Reveal.tsx, no new dependency for a two-property tween.
// Same-route content changes (filters, cart) update in place with no
// transition; only an actual pathname change plays the fade.
const EXIT_MS = 200;

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [exiting, setExiting] = useState(false);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) {
      setDisplayChildren(children);
      return;
    }
    lastPathname.current = pathname;
    setExiting(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setExiting(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [pathname, children]);

  return <div className={`${styles.transition} ${exiting ? styles.exit : ""}`}>{displayChildren}</div>;
}
