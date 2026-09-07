import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// CheckoutPage is a client component; see cart/layout.tsx for why metadata
// lives here instead. Not indexed: transactional, no standalone SEO value.
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return { title: t("checkoutTitle"), robots: { index: false, follow: false } };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
