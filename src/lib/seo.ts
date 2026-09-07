import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sultan-mauritius.vercel.app";
export const SITE_NAME = "Sultan Mauritius";
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/Assets/Lifestyle/home-04.jpg`,
  width: 1920,
  height: 1080,
};

const OG_LOCALE: Record<Locale, string> = { en: "en_MU", fr: "fr_MU" };

type PageMetaOptions = {
  locale: Locale;
  /** Root-relative, locale-free path, e.g. "/products" or "" for home. */
  path: string;
  title: string;
  description: string;
  /** Pages with no standalone SEO value (cart, checkout, order confirmation, admin). */
  noindex?: boolean;
  image?: { url: string; width: number; height: number };
};

/** Builds a page's title, description, canonical URL, and social preview
 * tags from one place, so every route gets a distinct, correct set instead
 * of silently inheriting the homepage's. */
export function pageMetadata({ locale, path, title, description, noindex, image }: PageMetaOptions): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      images: [ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
