"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./FlavorShowcase.module.css";

export type ShowcaseItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  taste: string;
  bestServedLabel: string;
  bestServed: string;
  tasteLabel: string;
  factsLabel: string;
  facts: { label: string; value: string }[];
  color: string;
  imageUrl: string | null;
  // some source photos carry a lot of baked-in transparent padding around
  // the bottle itself (not just a squarer canvas, which the square media
  // box already normalizes) — this compensates so the bottle still reads
  // at roughly the same size as the others. Default 1 (no correction).
  imageScale?: number;
};

export default function FlavorShowcase({
  items,
  sectionTitle,
  prevLabel,
  nextLabel,
}: {
  items: ShowcaseItem[];
  sectionTitle?: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const item = items[index];
  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section className={styles.showcase} style={{ "--accent": item.color } as React.CSSProperties}>
      {sectionTitle && <p className={styles.sectionTitle}>{sectionTitle}</p>}
      <span key={`ghost-${item.id}`} className={styles.ghostText} aria-hidden>
        {item.name}
      </span>

      <div className={styles.body}>
        <div key={`copy-${item.id}`} className={styles.copy}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.subtitle}>{item.subtitle}</p>
          <p className={styles.description}>{item.description}</p>
        </div>

        <div key={`media-${item.id}`} className={styles.mediaWrap}>
          {/* mobile-only: desktop uses the arrows in .nav below instead */}
          <button
            type="button"
            onClick={() => go(-1)}
            className={`${styles.navArrow} ${styles.mediaArrow} ${styles.mediaArrowLeft}`}
            aria-label={prevLabel}
          >
            ←
          </button>
          {item.imageUrl && (
            <>
              <span className={styles.platform} aria-hidden />
              <div className={styles.floatWrap}>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="340px"
                  className={styles.media}
                  style={{ transform: `scale(${item.imageScale ?? 1})` }}
                />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => go(1)}
            className={`${styles.navArrow} ${styles.mediaArrow} ${styles.mediaArrowRight}`}
            aria-label={nextLabel}
          >
            →
          </button>
        </div>

        <div key={`facts-${item.id}`} className={styles.facts}>
          <div className={styles.factBlock}>
            <span className={styles.factHeading}>{item.tasteLabel}</span>
            <p className={styles.tasteText}>{item.taste}</p>
          </div>
          <div className={styles.factBlock}>
            <span className={styles.factHeading}>{item.factsLabel}</span>
            <dl className={styles.factGrid}>
              {item.facts.map((f) => (
                <div key={f.label} className={styles.factRow}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.factBlock}>
            <span className={styles.factHeading}>{item.bestServedLabel}</span>
            <p className={styles.tasteText}>{item.bestServed}</p>
          </div>
        </div>
      </div>

      <div className={styles.nav}>
        <button type="button" onClick={() => go(-1)} className={styles.navArrow} aria-label={prevLabel}>
          ←
        </button>
        <div className={styles.dots}>
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-label={it.name}
              aria-current={i === index}
            />
          ))}
        </div>
        <span className={styles.navLabel}>{item.name}</span>
        <button type="button" onClick={() => go(1)} className={styles.navArrow} aria-label={nextLabel}>
          →
        </button>
      </div>
    </section>
  );
}
