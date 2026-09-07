import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// CartPage is a client component ("use client"), which can't export
// metadata itself; this server layout carries it instead. Not indexed:
// cart contents are per-visitor localStorage state, no standalone SEO value.
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return { title: t("cartTitle"), robots: { index: false, follow: false } };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
